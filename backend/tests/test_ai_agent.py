from decimal import Decimal
from app.agents.graph import run_gift_curator
from app.services.ai_service import ai_service


def test_ai_heuristic_extraction():
    profile = ai_service.extract_gift_requirements("I need a coffee and journal gift for my sister's birthday")
    assert profile.relationship == "Sister"
    assert profile.occasion == "Birthday"
    assert any("coffee" in i.lower() for i in profile.interests)


def test_langgraph_curator_workflow():
    result = run_gift_curator(
        user_id="test-user-id",
        original_query="minimalist desk setup accessories for my husband for anniversary",
        maximum_budget=Decimal("6000"),
    )

    assert "ranked_recommendations" in result
    recs = result["ranked_recommendations"]
    assert len(recs) > 0

    first = recs[0]
    assert "product_title" in first
    assert "price" in first
    assert "final_score" in first
    assert "match_explanation" in first
    assert first["ranking_position"] == 1
    assert first["price"] <= 6000
