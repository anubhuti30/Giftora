from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.shopping import Comparison
from app.models.conversation import SearchSession
from app.models.product import ProductSource
from app.repositories.shopping_repo import ShoppingRepository
from app.schemas.shopping import ComparisonCreateRequest

router = APIRouter(prefix="/compare", tags=["Product Comparison"])


@router.post("", status_code=status.HTTP_201_CREATED)
def create_product_comparison(
    request: ComparisonCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Creates a side-by-side comparison matrix for up to 4 products across marketplaces.
    """
    if len(request.product_source_ids) < 1 or len(request.product_source_ids) > 4:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Comparison requires between 1 and 4 products",
        )
    sources_count = db.query(ProductSource.id).filter(ProductSource.id.in_(request.product_source_ids)).count()
    if sources_count != len(request.product_source_ids):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="One or more products were not found")
    if request.search_session_id:
        session = db.query(SearchSession.id).filter(SearchSession.id == request.search_session_id, SearchSession.user_id == current_user.id).first()
        if not session:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Search session not found")

    repo = ShoppingRepository(db)
    comparison = repo.create_comparison(
        user_id=current_user.id,
        product_source_ids=request.product_source_ids,
        search_session_id=request.search_session_id,
    )

    return {
        "comparison_id": comparison.id,
        "items_count": len(comparison.items),
        "created_at": comparison.created_at.isoformat(),
    }


@router.get("/{comparison_id}", response_model=Dict[str, Any])
def get_product_comparison(
    comparison_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieves full side-by-side comparison specs, prices, ratings, and marketplace sources.
    """
    repo = ShoppingRepository(db)
    comp = repo.get_comparison(comparison_id=comparison_id, user_id=current_user.id)
    if not comp:
        raise HTTPException(status_code=404, detail="Comparison matrix not found")

    items_data = []
    for item in comp.items:
        src = item.product_source
        items_data.append({
            "id": item.id,
            "product_source_id": item.product_source_id,
            "product_title": src.product_title if src else "Curated Item",
            "marketplace_name": src.marketplace_name if src else "Curated",
            "price": float(src.current_price) if src else 0,
            "original_price": float(src.original_price) if src and src.original_price else None,
            "currency": src.currency if src else "INR",
            "image_url": src.image_url if src else "",
            "product_url": src.product_url if src else "#",
            "rating": float(src.source_rating) if src and src.source_rating else 4.5,
            "review_count": src.source_review_count if src else 50,
            "availability_status": src.availability_status if src else "IN_STOCK",
            "category": src.product.category if (src and src.product) else "General",
            "brand": src.product.brand if (src and src.product) else "Curated Brand",
        })

    return {
        "id": comp.id,
        "user_id": comp.user_id,
        "search_session_id": comp.search_session_id,
        "created_at": comp.created_at.isoformat(),
        "items": items_data,
    }


@router.get("", response_model=List[Dict[str, Any]])
def list_user_comparisons(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Lists saved comparisons for the current user."""
    comps = (
        db.query(Comparison)
        .filter(Comparison.user_id == current_user.id)
        .order_by(Comparison.created_at.desc())
        .limit(20)
        .all()
    )
    return [
        {
            "id": c.id,
            "search_session_id": c.search_session_id,
            "created_at": c.created_at.isoformat(),
            "items_count": len(c.items),
        }
        for c in comps
    ]
