import logging
import uuid
from datetime import datetime
from decimal import Decimal
from typing import List, Optional, Any, Dict
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user_optional, get_current_user
from app.models.user import User
from app.models.conversation import SearchSession, Conversation
from app.models.product import Product, ProductSource, Recommendation, PriceSnapshot
from app.models.recipient import Recipient
from app.schemas.search import GiftSearchRequest, SearchSessionResponse, RecommendationResponse
from app.agents.graph import run_gift_curator

router = APIRouter(prefix="/search", tags=["Gift Search & Recommendations"])
logger = logging.getLogger("giftora.search")


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

    # Never allow a search session to reference another user's private profile or chat.
    if current_user and request.recipient_id:
        recipient = db.query(Recipient.id).filter(Recipient.id == request.recipient_id, Recipient.user_id == current_user.id).first()
        if not recipient:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recipient profile not found")
    if current_user and request.conversation_id:
        conversation = db.query(Conversation.id).filter(Conversation.id == request.conversation_id, Conversation.user_id == current_user.id).first()
        if not conversation:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")

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

    # Authenticated searches are persisted atomically with their product-source snapshots.
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

            # Upsert each normalized marketplace source by its provider identity. A source's
            # database UUID—not a transient connector identifier—is returned to the frontend.
            for r in ranked_recs:
                marketplace_name = str(r.get("marketplace_name") or "")
                marketplace_product_id = str(r.get("product_source_id") or "")
                title = str(r.get("product_title") or "").strip()
                product_url = str(r.get("product_url") or "").strip()
                image_url = str(r.get("image_url") or "").strip()
                if not all((marketplace_name, marketplace_product_id, title, product_url, image_url)):
                    raise ValueError("Connector returned an incomplete product record")
                price = Decimal(str(r.get("price")))
                if not price.is_finite() or price < 0:
                    raise ValueError("Connector returned an invalid product price")
                db_source = db.query(ProductSource).filter(
                    ProductSource.marketplace_name == marketplace_name,
                    ProductSource.marketplace_product_id == marketplace_product_id,
                ).first()
                if not db_source:
                    prod = Product(
                        canonical_name=title,
                        brand=str(r.get("brand") or "") or None,
                        category=str(r.get("category") or "General"),
                        image_url=image_url,
                    )
                    db.add(prod)
                    db.flush()
                    db_source = ProductSource(
                        product_id=prod.id,
                        marketplace_name=marketplace_name,
                        marketplace_product_id=marketplace_product_id,
                        product_title=title,
                        product_url=product_url,
                        image_url=image_url,
                        current_price=price,
                        original_price=Decimal(str(r.get("original_price"))) if r.get("original_price") else None,
                        currency="INR",
                        availability_status=str(r.get("availability_status") or "IN_STOCK"),
                        source_rating=Decimal(str(r.get("source_rating"))) if r.get("source_rating") is not None else None,
                        source_review_count=int(r["source_review_count"]) if r.get("source_review_count") is not None else None,
                    )
                    db.add(db_source)
                    db.flush()
                else:
                    db_source.current_price = price
                    db_source.original_price = Decimal(str(r.get("original_price"))) if r.get("original_price") else None
                    db_source.availability_status = str(r.get("availability_status") or db_source.availability_status)
                    db_source.last_verified_at = datetime.utcnow()
                db.add(PriceSnapshot(product_source_id=db_source.id, price=price, availability_status=db_source.availability_status))

                # Use persistent IDs for wishlist/comparison actions in this same response.
                r["product_source_id"] = db_source.id

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
        except Exception as exc:
            db.rollback()
            logger.exception("Authenticated search persistence failed", extra={"reason": type(exc).__name__})
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Search results could not be saved. Please retry.") from exc

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
