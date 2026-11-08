from decimal import Decimal
from app.services.ranking_service import ProductRankingService, RankingWeights


def test_strict_budget_filter():
    service = ProductRankingService()

    candidates = [
        {"id": "p1", "price": Decimal("1000")},
        {"id": "p2", "price": Decimal("3000")},
        {"id": "p3", "price": Decimal("5000")},
        {"id": "p4", "price": Decimal("8000")},
    ]

    # Filter with min=2000 and max=6000
    filtered = service.filter_strict_budget(candidates, minimum_budget=Decimal("2000"), maximum_budget=Decimal("6000"))
    filtered_ids = [p["id"] for p in filtered]

    assert "p1" not in filtered_ids  # Below min
    assert "p2" in filtered_ids
    assert "p3" in filtered_ids
    assert "p4" not in filtered_ids  # Above max


def test_deterministic_scoring_order():
    service = ProductRankingService()

    candidates = [
        {
            "id": "p1",
            "title": "Ceramic Pour-Over Coffee Dripper Set",
            "category": "Home & Kitchen",
            "price": Decimal("2400"),
            "original_price": Decimal("3200"),
            "source_rating": Decimal("4.8"),
            "source_review_count": 350,
        },
        {
            "id": "p2",
            "title": "Generic Unbranded Item",
            "category": "Miscellaneous",
            "price": Decimal("500"),
            "original_price": Decimal("500"),
            "source_rating": Decimal("3.2"),
            "source_review_count": 5,
        },
    ]

    scored = service.rank_products(candidates, user_interests=["Coffee", "Ceramic"], target_budget_max=Decimal("3000"))

    assert len(scored) == 2
    # The coffee dripper matching interests and high rating must rank higher
    assert scored[0].product_source_id == "p1"
    assert scored[0].ranking_position == 1
    assert scored[0].final_score > scored[1].final_score
    assert scored[0].interest_score > scored[1].interest_score
    assert scored[1].ranking_position == 2
