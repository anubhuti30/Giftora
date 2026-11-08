import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, Numeric, Integer, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    canonical_name = Column(String(255), nullable=False, index=True)
    brand = Column(String(150), nullable=True)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=False, index=True)
    subcategory = Column(String(100), nullable=True)
    image_url = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    sources = relationship("ProductSource", back_populates="product", cascade="all, delete-orphan")


class ProductSource(Base):
    __tablename__ = "product_sources"
    __table_args__ = (
        UniqueConstraint("marketplace_name", "marketplace_product_id", name="uq_marketplace_product"),
    )

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    product_id = Column(String(36), ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    marketplace_name = Column(String(100), nullable=False, index=True)
    marketplace_product_id = Column(String(150), nullable=False)
    product_title = Column(String(300), nullable=False)
    product_url = Column(Text, nullable=False)
    image_url = Column(Text, nullable=False)
    current_price = Column(Numeric(10, 2), nullable=False, index=True)
    original_price = Column(Numeric(10, 2), nullable=True)
    currency = Column(String(10), default="INR", nullable=False)
    availability_status = Column(String(50), default="IN_STOCK", nullable=False)
    source_rating = Column(Numeric(3, 2), nullable=True)
    source_review_count = Column(Integer, nullable=True)
    last_verified_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    product = relationship("Product", back_populates="sources")
    price_snapshots = relationship("PriceSnapshot", back_populates="product_source", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="product_source")


class PriceSnapshot(Base):
    __tablename__ = "price_snapshots"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    product_source_id = Column(String(36), ForeignKey("product_sources.id", ondelete="CASCADE"), nullable=False, index=True)
    price = Column(Numeric(10, 2), nullable=False)
    availability_status = Column(String(50), nullable=False)
    captured_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    product_source = relationship("ProductSource", back_populates="price_snapshots")


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    search_session_id = Column(String(36), ForeignKey("search_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    product_source_id = Column(String(36), ForeignKey("product_sources.id", ondelete="CASCADE"), nullable=False, index=True)
    relevance_score = Column(Numeric(5, 2), nullable=False, index=True)
    match_explanation = Column(Text, nullable=False)
    ranking_position = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    search_session = relationship("SearchSession", back_populates="recommendations")
    product_source = relationship("ProductSource", back_populates="recommendations")
    feedback = relationship("Feedback", back_populates="recommendation", cascade="all, delete-orphan")
