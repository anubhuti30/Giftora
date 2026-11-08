from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.shopping import WishlistItem
from app.repositories.shopping_repo import ShoppingRepository
from app.schemas.shopping import WishlistAddRequest

router = APIRouter(prefix="/wishlist", tags=["Wishlist & Saved Items"])


@router.get("", response_model=Dict[str, Any])
def get_user_wishlist(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieves all saved gift recommendations for the user."""
    repo = ShoppingRepository(db)
    wishlist = repo.get_or_create_user_wishlist(user_id=current_user.id)

    items_data = []
    for item in wishlist.items:
        src = item.product_source
        items_data.append({
            "id": item.id,
            "product_source_id": item.product_source_id,
            "product_title": src.product_title if src else "Curated Item",
            "marketplace_name": src.marketplace_name if src else "Curated",
            "price": float(src.current_price) if src else 0,
            "original_price": float(src.original_price) if src and src.original_price else None,
            "image_url": src.image_url if src else "",
            "product_url": src.product_url if src else "#",
            "rating": float(src.source_rating) if src and src.source_rating else 4.5,
            "review_count": src.source_review_count if src else 50,
            "added_at": item.added_at.isoformat(),
        })

    return {
        "wishlist_id": wishlist.id,
        "name": wishlist.name,
        "items_count": len(items_data),
        "items": items_data,
    }


@router.post("", status_code=status.HTTP_201_CREATED)
def add_to_wishlist(
    request: WishlistAddRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Saves a recommended product into the user's wishlist."""
    repo = ShoppingRepository(db)
    item = repo.add_to_wishlist(
        user_id=current_user.id,
        product_source_id=request.product_source_id,
        wishlist_name=request.wishlist_name or "My Saved Gifts",
    )
    return {
        "message": "Item added to wishlist successfully",
        "item_id": item.id,
        "product_source_id": item.product_source_id,
    }


@router.delete("/{item_id}")
def remove_from_wishlist(
    item_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Removes a product from the user's wishlist."""
    repo = ShoppingRepository(db)
    success = repo.remove_from_wishlist(user_id=current_user.id, item_id=item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Item not found in wishlist")
    return {"message": "Item removed from wishlist successfully"}
