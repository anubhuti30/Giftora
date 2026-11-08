"""Transactional search tests. SQLite validates application transactions, not MySQL DDL parity."""
from types import SimpleNamespace

import pytest
from fastapi import HTTPException
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker

from app.api.routes import search
from app.api.routes import comparison
from app.core.database import Base
from app.models.conversation import SearchSession
from app.models.product import PriceSnapshot, Product, ProductSource, Recommendation
from app.models.user import User
from app.schemas.search import GiftSearchRequest
from app.schemas.shopping import ComparisonCreateRequest


@pytest.fixture()
def db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    session = sessionmaker(bind=engine)()
    session.add(User(id="user-1", full_name="Test User", email="user@example.com", password_hash="hash"))
    session.commit()
    try:
        yield session
    finally:
        session.close()
        engine.dispose()


def workflow_result(*_args, **_kwargs):
    return {
        "extracted_needs": {"interests": ["Coffee"]},
        "ranked_recommendations": [{
            "product_source_id": "provider-item-1", "product_title": "Verified Coffee Set",
            "marketplace_name": "Test Marketplace", "price": 999, "original_price": 1200,
            "source_rating": 4.4, "source_review_count": 12, "image_url": "https://example.test/item.jpg",
            "product_url": "https://example.test/item", "category": "Kitchen", "brand": "Test",
            "availability_status": "IN_STOCK", "final_score": 91.5, "ranking_position": 1,
            "match_explanation": "Listed Kitchen category matches Coffee.",
        }],
    }


def call_search(db, monkeypatch):
    monkeypatch.setattr(search, "run_gift_curator", workflow_result)
    return search.perform_gift_search(
        GiftSearchRequest(query="coffee gift", maximum_budget=1000),
        current_user=SimpleNamespace(id="user-1"), db=db,
    )


def test_search_persists_stable_source_id_and_price_snapshots(db, monkeypatch):
    first = call_search(db, monkeypatch)
    second = call_search(db, monkeypatch)
    assert first["saved_in_database"] is True
    assert first["recommendations"][0]["product_source_id"] == second["recommendations"][0]["product_source_id"]
    assert db.query(SearchSession).count() == 2
    assert db.query(Product).count() == 1
    assert db.query(ProductSource).count() == 1
    assert db.query(Recommendation).count() == 2
    assert db.query(PriceSnapshot).count() == 2


@pytest.mark.parametrize("failure_type", [ProductSource, Recommendation, PriceSnapshot])
def test_persistence_failure_rolls_back_the_entire_search(db, monkeypatch, failure_type):
    def fail_before_flush(_session, _flush_context, _instances):
        if any(isinstance(item, failure_type) for item in _session.new):
            raise RuntimeError(f"forced {failure_type.__name__} failure")

    event.listen(db, "before_flush", fail_before_flush)
    try:
        with pytest.raises(HTTPException) as exc_info:
            call_search(db, monkeypatch)
        assert exc_info.value.status_code == 503
    finally:
        event.remove(db, "before_flush", fail_before_flush)

    assert db.query(SearchSession).count() == 0
    assert db.query(Product).count() == 0
    assert db.query(ProductSource).count() == 0
    assert db.query(Recommendation).count() == 0
    assert db.query(PriceSnapshot).count() == 0


def test_comparison_rejects_another_users_search_session(db, monkeypatch):
    call_search(db, monkeypatch)
    source_id = db.query(ProductSource.id).one()[0]
    db.add(User(id="user-2", full_name="Other User", email="other@example.com", password_hash="hash"))
    db.add(SearchSession(id="other-session", user_id="user-2", original_query="private", search_status="COMPLETED"))
    db.commit()

    with pytest.raises(HTTPException) as exc_info:
        comparison.create_product_comparison(
            ComparisonCreateRequest(product_source_ids=[source_id], search_session_id="other-session"),
            current_user=SimpleNamespace(id="user-1"), db=db,
        )
    assert exc_info.value.status_code == 404
