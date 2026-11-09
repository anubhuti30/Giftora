import logging
import urllib.parse
from decimal import Decimal
from typing import List, Optional, Dict, Any
from app.core.config import settings
from app.connectors.base import BaseMarketplaceConnector, ConnectorStatus, LinkStatus, MarketplaceProductItem

logger = logging.getLogger("giftora.connectors.flipkart")


class FlipkartConnector(BaseMarketplaceConnector):
    """
    Flipkart Affiliate API Integration.
    Requires approved affiliate credentials (affiliate_id, affiliate_token).
    When live API credentials are not available, operates in transparent
    retailer-search fallback mode.
    """

    def __init__(self):
        super().__init__("Flipkart")
        self.affiliate_id = settings.FLIPKART_AFFILIATE_ID
        self.affiliate_token = settings.FLIPKART_AFFILIATE_TOKEN

    @property
    def is_configured(self) -> bool:
        return bool(self.affiliate_id and self.affiliate_token)

    def health_check(self) -> Dict[str, Any]:
        if not self.is_configured:
            return {
                "marketplace": self.marketplace_name,
                "status": ConnectorStatus.NOT_CONFIGURED.value,
                "message": (
                    "Flipkart Affiliate credentials not configured in environment. "
                    "Operating in official retailer-search fallback mode."
                ),
                "is_live": False,
            }
        return {
            "marketplace": self.marketplace_name,
            "status": ConnectorStatus.ACTIVE.value,
            "message": "Flipkart Affiliate API configured.",
            "is_live": True,
        }

    def search_products(
        self,
        query: str,
        category: Optional[str] = None,
        max_price: Optional[Decimal] = None,
        limit: int = 10,
    ) -> List[MarketplaceProductItem]:
        is_prod = settings.ENVIRONMENT.lower() == "production"

        if not self.is_configured:
            if is_prod:
                logger.info("Flipkart credentials not configured in production. Using retailer search fallback.")
                return self._get_retailer_search_fallback(query)
            else:
                return self._get_dev_mock_items(query, max_price, limit)

        # In production with authorized Affiliate API keys:
        return []

    def get_product_details(self, marketplace_product_id: str) -> Optional[MarketplaceProductItem]:
        if not self.is_configured and not (settings.ENVIRONMENT.lower() == "production"):
            for item in self._get_dev_mock_items(""):
                if item.marketplace_product_id == marketplace_product_id:
                    return item
        return None

    def _get_retailer_search_fallback(self, query: str) -> List[MarketplaceProductItem]:
        """Provides verified official Flipkart search destination."""
        clean_q = query.strip() or "gifts"
        search_url = f"https://www.flipkart.com/search?q={urllib.parse.quote_plus(clean_q)}"

        return [
            MarketplaceProductItem(
                marketplace_name=self.marketplace_name,
                marketplace_product_id=f"FK-SEARCH-{abs(hash(clean_q)) % 1000000}",
                title=f"Search {clean_q} on Flipkart",
                product_url=None,
                retailer_search_url=search_url,
                link_status=LinkStatus.SEARCH_FALLBACK,
                is_search_fallback=True,
                image_url="https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80",
                current_price=Decimal("0.00"),
                currency="INR",
                availability_status="IN_STOCK",
                category="Retailer Search",
                is_development_mock=False,
                source_attribution="Official Flipkart Search Destination",
            )
        ]

    def _get_dev_mock_items(
        self,
        query: str,
        max_price: Optional[Decimal] = None,
        limit: int = 10,
    ) -> List[MarketplaceProductItem]:
        all_mocks = [
            MarketplaceProductItem(
                marketplace_name=self.marketplace_name,
                marketplace_product_id="FK-DEV-INSTAX-MINI",
                title="FujiFilm Instax Mini 12 Instant Camera (Lilac Purple)",
                product_url=None,
                retailer_search_url="https://www.flipkart.com/search?q=fujifilm+instax+mini+12",
                link_status=LinkStatus.SEARCH_FALLBACK,
                is_search_fallback=True,
                image_url="https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80",
                current_price=Decimal("6499.00"),
                original_price=Decimal("7999.00"),
                currency="INR",
                availability_status="IN_STOCK",
                rating=Decimal("4.80"),
                review_count=1420,
                category="Photography",
                is_development_mock=True,
                source_attribution="Development Mock Provider (Flipkart)",
            ),
            MarketplaceProductItem(
                marketplace_name=self.marketplace_name,
                marketplace_product_id="FK-DEV-EARBUDS-ANC",
                title="Noise Air Buds Pro 4 with Spatial Audio & ANC",
                product_url=None,
                retailer_search_url="https://www.flipkart.com/search?q=noise+air+buds+pro+4",
                link_status=LinkStatus.SEARCH_FALLBACK,
                is_search_fallback=True,
                image_url="https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80",
                current_price=Decimal("2999.00"),
                original_price=Decimal("4999.00"),
                currency="INR",
                availability_status="IN_STOCK",
                rating=Decimal("4.60"),
                review_count=890,
                category="Electronics",
                is_development_mock=True,
                source_attribution="Development Mock Provider (Flipkart)",
            ),
        ]
        results = [m for m in all_mocks if max_price is None or m.current_price <= max_price]
        return results[:limit]
