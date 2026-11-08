from typing import Dict, Any, List
from app.agents.state import AgentWorkflowState
from app.connectors.amazon import AmazonConnector
from app.connectors.flipkart import FlipkartConnector
from app.connectors.myntra import MyntraConnector


def normalize_products_node(state: AgentWorkflowState) -> Dict[str, Any]:
    """
    Connects to configured marketplace connectors and aggregates candidates,
    normalizing schemas and eliminating duplicates.
    """
    connectors = [AmazonConnector(), FlipkartConnector(), MyntraConnector()]
    all_raw: List[Dict[str, Any]] = []

    # Query connectors with top generated queries
    queries_to_run = state.generated_search_queries or [state.original_query]
    for q in queries_to_run[:2]:
        for conn in connectors:
            items = conn.search_products(q, max_price=state.maximum_budget, limit=5)
            for itm in items:
                all_raw.append(itm.model_dump())

    # Deduplicate by (marketplace_name, marketplace_product_id)
    seen = set()
    deduped = []
    for item in all_raw:
        key = (item.get("marketplace_name"), item.get("marketplace_product_id"))
        if key not in seen:
            seen.add(key)
            deduped.append(item)

    return {"normalized_products": deduped}
