import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base


class Wishlist(Base):
    __tablename__ = "wishlists"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(150), default="My Saved Gifts", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="wishlists")
    items = relationship("WishlistItem", back_populates="wishlist", cascade="all, delete-orphan")


class WishlistItem(Base):
    __tablename__ = "wishlist_items"
    __table_args__ = (
        UniqueConstraint("wishlist_id", "product_source_id", name="uq_wishlist_product"),
    )

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    wishlist_id = Column(String(36), ForeignKey("wishlists.id", ondelete="CASCADE"), nullable=False, index=True)
    product_source_id = Column(String(36), ForeignKey("product_sources.id", ondelete="CASCADE"), nullable=False, index=True)
    added_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    wishlist = relationship("Wishlist", back_populates="items")
    product_source = relationship("ProductSource")


class Comparison(Base):
    __tablename__ = "comparisons"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    search_session_id = Column(String(36), ForeignKey("search_sessions.id", ondelete="SET NULL"), nullable=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="comparisons")
    items = relationship("ComparisonItem", back_populates="comparison", cascade="all, delete-orphan")


class ComparisonItem(Base):
    __tablename__ = "comparison_items"
    __table_args__ = (
        UniqueConstraint("comparison_id", "product_source_id", name="uq_comparison_product"),
    )

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    comparison_id = Column(String(36), ForeignKey("comparisons.id", ondelete="CASCADE"), nullable=False, index=True)
    product_source_id = Column(String(36), ForeignKey("product_sources.id", ondelete="CASCADE"), nullable=False, index=True)

    comparison = relationship("Comparison", back_populates="items")
    product_source = relationship("ProductSource")


class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    recommendation_id = Column(String(36), ForeignKey("recommendations.id", ondelete="CASCADE"), nullable=False, index=True)
    feedback_type = Column(String(50), nullable=False)
    feedback_text = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User")
    recommendation = relationship("Recommendation", back_populates="feedback")
