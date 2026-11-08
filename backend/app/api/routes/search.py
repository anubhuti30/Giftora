import uuid
from datetime import datetime
from decimal import Decimal
from typing import List, Optional, Any, Dict
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user_optional, get_current_user
from app.models.user import User
from app.models.conversation import SearchSession
from app.models.product import Product, ProductSource, Recommendation
from app.schemas.search import GiftSearchRequest, SearchSessionResponse, RecommendationResponse
from app.agents.graph import run_gift_curator

router = APIRouter(prefix="/search", tags=["Gift Search & Recommendations"])


@router.post("", response_model=Dict[str, Any])
@router.post("/gift-search", response_model=Dict[str, Any])
def perform_gift_search(
    request: GiftSearchRequest,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    """
    Executes the multi-agent gift curator workflow:
    1. Extracts implicit requirements and interests with AI.
    2. Generates targeted retail queries across Amazon, Flipkart, Myntra.
    3. Aggregates and normalizes marketplace candidates.
    4. Enforces availability and strict budget bounds.
    5. Applies 5-factor deterministic ranking.
    6. Attaches contextual AI match explanations.
    7. Persists search session and recommendations in MySQL database.
    """
    user_id = current_user.id if current_user else f"guest-{uuid.uuid4()}"

    query_text = request.query
    if not query_text:
        parts = []
        if request.relationship:
            parts.append(f"gift for {request.relationship}")
        if request.occasion:
            parts.append(f"for {request.occasion}")
        if request.interests:
            parts.append(f"interested in {', '.join(request.interests)}")
        query_text = " ".join(parts) or "curated gifts"

    # Execute LangGraph workflow
    workflow_result = run_gift_curator(
        user_id=user_id,
        original_query=query_text,
        recipient_id=request.recipient_id,
        recipient_name=request.recipient_name,
        relationship=request.relationship,
        occasion=request.occasion,
        user_interests=request.interests or [],
        minimum_budget=request.minimum_budget,
        maximum_budget=request.maximum_budget,
    )

    ranked_recs = workflow_result.get("ranked_recommendations", [])
    extracted_needs = workflow_result.get("extracted_needs", {})

    session_id = str(uuid.uuid4())

    # If database is connected and we have a valid database user (or guest is permitted in DB)
    saved_in_db = False
    if current_user:
        try:
            db_session = SearchSession(
                id=session_id,
                user_id=current_user.id,
                recipient_id=request.recipient_id,
                conversation_id=request.conversation_id,
                occasion=request.occasion or extracted_needs.get("occasion"),
                original_query=query_text,
                extracted_preferences=extracted_needs,
                minimum_budget=request.minimum_budget,
                maximum_budget=request.maximum_budget,
                search_status="COMPLETED",
                completed_at=datetime.utcnow(),
            )
            db.add(db_session)
            db.flush()

            # Persist recommendations
            for r in ranked_recs:
                src_id = r.get("product_source_id")
                # Check if product source exists in DB
                db_source = db.query(ProductSource).filter(ProductSource.id == src_id).first()
                if not db_source:
                    # Create placeholder product and source to maintain referential integrity
                    prod = Product(
                        canonical_name=r.get("product_title", "Curated Gift"),
                        brand=r.get("brand", "Curated"),
                        category=r.get("category", "Gifts"),
                        image_url=r.get("image_url", "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80"),
                    )
                    db.add(prod)
                    db.flush()

                    db_source = ProductSource(
                        id=src_id if src_id else str(uuid.uuid4()),
                        product_id=prod.id,
                        marketplace_name=r.get("marketplace_name", "Curated Marketplace"),
                        marketplace_product_id=r.get("product_source_id", str(uuid.uuid4())),
                        product_title=r.get("product_title", "Curated Gift"),
                        product_url=r.get("product_url", "#"),
                        image_url=r.get("image_url", "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80"),
                        current_price=Decimal(str(r.get("price", 0))),
                        original_price=Decimal(str(r.get("original_price"))) if r.get("original_price") else None,
                        currency="INR",
                        availability_status="IN_STOCK",
                        source_rating=Decimal(str(r.get("source_rating", 4.5))),
                        source_review_count=int(r.get("source_review_count", 50)),
                    )
                    db.add(db_source)
                    db.flush()

                rec_entry = Recommendation(
                    search_session_id=db_session.id,
                    product_source_id=db_source.id,
                    relevance_score=Decimal(str(round(r.get("final_score", 90.0), 2))),
                    match_explanation=r.get("match_explanation", "Thoughtfully curated match."),
                    ranking_position=int(r.get("ranking_position", 1)),
                )
                db.add(rec_entry)

            db.commit()
            saved_in_db = True
        except Exception:
            db.rollback()

    return {
        "search_id": session_id,
        "user_id": user_id,
        "query": query_text,
        "extracted_needs": extracted_needs,
        "saved_in_database": saved_in_db,
        "recommendations_count": len(ranked_recs),
        "recommendations": ranked_recs,
        "status": "COMPLETED",
        "created_at": datetime.utcnow().isoformat(),
    }


@router.get("/{search_id}")
def get_search_results(
    search_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieves stored search session and recommendations from MySQL."""
    session = (
        db.query(SearchSession)
        .filter(SearchSession.id == search_id, SearchSession.user_id == current_user.id)
        .first()
    )
    if not session:
        raise HTTPException(status_code=404, detail="Search session not found")

    recs = (
        db.query(Recommendation)
        .filter(Recommendation.search_session_id == search_id)
        .order_by(Recommendation.ranking_position.asc())
        .all()
    )

    formatted_recs = []
    for r in recs:
        src = r.product_source
        formatted_recs.append({
            "id": r.id,
            "product_source_id": r.product_source_id,
            "product_title": src.product_title if src else "Curated Item",
            "marketplace_name": src.marketplace_name if src else "Curated",
            "price": float(src.current_price) if src else 0,
            "original_price": float(src.original_price) if src and src.original_price else None,
            "image_url": src.image_url if src else "",
            "product_url": src.product_url if src else "#",
            "rating": float(src.source_rating) if src and src.source_rating else 4.5,
            "review_count": src.source_review_count if src else 50,
            "relevance_score": float(r.relevance_score),
            "ranking_position": r.ranking_position,
            "match_explanation": r.match_explanation,
        })

    return {
        "id": session.id,
        "original_query": session.original_query,
        "occasion": session.occasion,
        "extracted_preferences": session.extracted_preferences,
        "search_status": session.search_status,
        "created_at": session.created_at.isoformat(),
        "recommendations": formatted_recs,
    }


@router.get("")
def list_user_searches(
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Lists past gift search sessions for the authenticated user."""
    sessions = (
        db.query(SearchSession)
        .filter(SearchSession.user_id == current_user.id)
        .order_by(SearchSession.created_at.desc())
        .limit(limit)
        .all()
    )

    return [
        {
            "id": s.id,
            "original_query": s.original_query,
            "occasion": s.occasion,
            "search_status": s.search_status,
            "created_at": s.created_at.isoformat(),
            "recommendations_count": len(s.recommendations),
        }
        for s in sessions
    ]
