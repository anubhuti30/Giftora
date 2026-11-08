from decimal import Decimal

from app.agents.product_verifier import verify_products_node
from app.agents.recommendation_ranker import rank_recommendations_node
from app.agents.state import AgentWorkflowState


def _state(products, maximum_budget):
    return AgentWorkflowState(user_id="user", original_query="gift", maximum_budget=Decimal(maximum_budget), normalized_products=products)


def test_strict_budget_keeps_exact_boundary_and_never_ranks_overage():
    state = _state([
        {"marketplace_product_id": "at-limit", "current_price": "1000", "availability_status": "IN_STOCK", "title": "At limit", "marketplace_name": "Test"},
        {"marketplace_product_id": "over", "current_price": "1000.01", "availability_status": "IN_STOCK", "title": "Over", "marketplace_name": "Test"},
    ], "1000")
    verified = verify_products_node(state)["validated_products"]
    state.validated_products = verified
    ranked = rank_recommendations_node(state)["ranked_recommendations"]
    assert [item["product_source_id"] for item in ranked] == ["at-limit"]


def test_all_over_budget_products_return_no_recommendations():
    state = _state([{"marketplace_product_id": "over", "current_price": "1001", "availability_status": "IN_STOCK", "title": "Over", "marketplace_name": "Test"}], "1000")
    state.validated_products = verify_products_node(state)["validated_products"]
    assert rank_recommendations_node(state)["ranked_recommendations"] == []
