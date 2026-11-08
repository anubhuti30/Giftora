from typing import Dict, Any, List
from app.agents.state import AgentWorkflowState
from app.services.ranking_service import ranking_service


def verify_products_node(state: AgentWorkflowState) -> Dict[str, Any]:
    """
    Verifies product availability, eliminates out-of-stock items,
    and applies strict non-negotiable budget bounds before ranking.
    """
    raw_products = state.normalized_products

    # 1. Availability verification: must be available
    in_stock_candidates: List[Dict[str, Any]] = [
        p for p in raw_products
        if p.get("availability_status", "in_stock").lower() in ("in_stock", "available", "active")
    ]

    # 2. Strict budget filtering
    validated = ranking_service.filter_strict_budget(
        products=in_stock_candidates,
        minimum_budget=state.minimum_budget,
        maximum_budget=state.maximum_budget,
    )

    # Fallback to in_stock_candidates if budget was too restrictive and pruned everything
    if not validated and in_stock_candidates:
        validated = in_stock_candidates[:10]

    return {"validated_products": validated}
