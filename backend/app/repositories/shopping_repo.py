from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.shopping import Wishlist, WishlistItem, Comparison, ComparisonItem, Feedback


class ShoppingRepository:
    def __init__(self, db: Session):
        self.db = db

    # 1. Wishlist
    def get_or_create_user_wishlist(self, user_id: str, name: str = "My Saved Gifts") -> Wishlist:
        wishlist = self.db.query(Wishlist).filter(Wishlist.user_id == user_id).first()
        if not wishlist:
            wishlist = Wishlist(user_id=user_id, name=name)
            self.db.add(wishlist)
            self.db.commit()
            self.db.refresh(wishlist)
        return wishlist

    def add_to_wishlist(self, user_id: str, product_source_id: str, wishlist_name: str = "My Saved Gifts") -> WishlistItem:
        wishlist = self.get_or_create_user_wishlist(user_id, wishlist_name)
        existing = (
            self.db.query(WishlistItem)
            .filter(
                WishlistItem.wishlist_id == wishlist.id,
                WishlistItem.product_source_id == product_source_id,
            )
            .first()
        )
        if existing:
            return existing

        item = WishlistItem(wishlist_id=wishlist.id, product_source_id=product_source_id)
        self.db.add(item)
        self.db.commit()
        self.db.refresh(item)
        return item

    def remove_from_wishlist(self, user_id: str, item_id: str) -> bool:
        item = (
            self.db.query(WishlistItem)
            .join(Wishlist)
            .filter(
                WishlistItem.id == item_id,
                Wishlist.user_id == user_id,
            )
            .first()
        )
        if not item:
            # Also try matching product_source_id
            item = (
                self.db.query(WishlistItem)
                .join(Wishlist)
                .filter(
                    WishlistItem.product_source_id == item_id,
                    Wishlist.user_id == user_id,
                )
                .first()
            )
        if item:
            self.db.delete(item)
            self.db.commit()
            return True
        return False

    # 2. Comparisons
    def create_comparison(self, user_id: str, product_source_ids: List[str], search_session_id: Optional[str] = None) -> Comparison:
        comparison = Comparison(user_id=user_id, search_session_id=search_session_id)
        self.db.add(comparison)
        self.db.flush()

        for source_id in product_source_ids:
            c_item = ComparisonItem(comparison_id=comparison.id, product_source_id=source_id)
            self.db.add(c_item)

        self.db.commit()
        self.db.refresh(comparison)
        return comparison

    def get_comparison(self, comparison_id: str, user_id: str) -> Optional[Comparison]:
        return (
            self.db.query(Comparison)
            .filter(Comparison.id == comparison_id, Comparison.user_id == user_id)
            .first()
        )

    # 3. Feedback
    def add_feedback(self, user_id: str, recommendation_id: str, feedback_type: str, feedback_text: Optional[str] = None) -> Feedback:
        fb = Feedback(
            user_id=user_id,
            recommendation_id=recommendation_id,
            feedback_type=feedback_type,
            feedback_text=feedback_text,
        )
        self.db.add(fb)
        self.db.commit()
        self.db.refresh(fb)
        return fb
