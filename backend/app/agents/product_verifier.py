import logging
import urllib.parse
import urllib.request
import ssl
from typing import Dict, Any, List, Optional
from decimal import Decimal
from app.agents.state import AgentWorkflowState
from app.connectors.base import LinkStatus
from app.services.ranking_service import ranking_service

logger = logging.getLogger("giftora.agents.verifier")

ALLOWED_RETAILER_DOMAINS = (
    "amazon.in",
    "flipkart.com",
    "myntra.com",
    "tatacliq.com",
    "etsy.com",
    "fabindia.com",
    "nicobar.com",
    "forestessentialsindia.com",
    "pinterest.com",
)


def verify_outbound_link(url: Optional[str]) -> LinkStatus:
    """
    Validates HTTPS format, trusted retailer domains, and conducts a
    non-blocking status check.
    - 200/202/301/302: VERIFIED
    - 403 / anti-bot / rate-limit / timeout: INCONCLUSIVE (never marked dead)
    - 404 / malformed / untrusted domain: INVALID
    """
    if not url or not isinstance(url, str):
        return LinkStatus.INVALID

    url_str = url.strip()
    if not url_str.startswith("https://"):
        return LinkStatus.INVALID

    try:
        parsed = urllib.parse.urlparse(url_str)
        hostname = (parsed.hostname or "").lower()
        if not any(hostname == d or hostname.endswith("." + d) for d in ALLOWED_RETAILER_DOMAINS):
            return LinkStatus.INVALID
        # Reject obvious dummy / placeholder paths
        if any(bad in parsed.path.lower() for bad in ("/sample/", "/example/", "/test/")):
            return LinkStatus.INVALID
    except Exception:
        return LinkStatus.INVALID

    # Quick non-blocking probe (bounded timeout, never blocks the search)
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    req = urllib.request.Request(
        url_str,
        headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
    )
    try:
        with urllib.request.urlopen(req, timeout=1.0, context=ctx) as resp:
            if resp.status in (200, 202, 301, 302):
                return LinkStatus.VERIFIED
            return LinkStatus.INCONCLUSIVE
    except urllib.error.HTTPError as e:
        # A 403 from an anti-bot protection layer must NOT be treated as a dead link
        if e.code in (403, 429, 503):
            return LinkStatus.INCONCLUSIVE
        elif e.code in (404, 410):
            return LinkStatus.INVALID
        return LinkStatus.INCONCLUSIVE
    except Exception:
        # Network transient failure / timeout -> inconclusive
        return LinkStatus.INCONCLUSIVE


def verify_products_node(state: AgentWorkflowState) -> Dict[str, Any]:
    """
    Verifies product availability, applies strict non-negotiable budget bounds,
    validates outbound links, and enforces a mandatory relevance threshold.
    """
    raw_products = state.normalized_products

    # 1. Availability verification: must be in-stock
    in_stock_candidates: List[Dict[str, Any]] = [
        p for p in raw_products
        if str(p.get("availability_status", "in_stock")).lower() in ("in_stock", "available", "active")
    ]

    # 2. Strict budget filtering
    budget_filtered = ranking_service.filter_strict_budget(
        products=in_stock_candidates,
        minimum_budget=state.minimum_budget,
        maximum_budget=state.maximum_budget,
    )

    # 3. Mandatory Relevance Filtering
    # If the user specified interests, a candidate must have semantic alignment.
    # A silk scarf must NEVER be returned for specialty coffee / aromatherapy.
    user_interests = [i.strip().lower() for i in state.user_interests if i and i.strip()]
    relevance_filtered: List[Dict[str, Any]] = []

    for p in budget_filtered:
        # If no specific interests were given by user, keep all valid products
        if not user_interests:
            relevance_filtered.append(p)
            continue

        text_corpus = f"{p.get('title', '')} {p.get('product_title', '')} {p.get('category', '')} {p.get('source_attribution', '')}".lower()
        # Count interest term hits
        matches = sum(1 for interest in user_interests if any(word in text_corpus for word in interest.split()))

        if matches > 0:
            relevance_filtered.append(p)
        else:
            logger.info(
                f"Pruned irrelevant product '{p.get('title')}' - 0 matches for interests {user_interests}"
            )

    # 4. Outbound Link Classification
    validated_products: List[Dict[str, Any]] = []
    for p in relevance_filtered:
        item = dict(p)
        raw_url = item.get("product_url")
        search_fallback = item.get("retailer_search_url") or ""

        # Validate URL status
        status = verify_outbound_link(raw_url)
        if status in (LinkStatus.VERIFIED, LinkStatus.INCONCLUSIVE):
            item["product_url"] = raw_url
            item["link_status"] = status.value
            item["is_search_fallback"] = False
        else:
            # Fallback to verified retailer search
            item["product_url"] = None
            item["retailer_search_url"] = search_fallback
            item["link_status"] = LinkStatus.SEARCH_FALLBACK.value
            item["is_search_fallback"] = True

        validated_products.append(item)

    return {"validated_products": validated_products}
