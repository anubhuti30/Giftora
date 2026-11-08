import uuid
from datetime import datetime
from sqlalchemy import Column, String, Date, DateTime, Text, Numeric, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


class Recipient(Base):
    __tablename__ = "recipients"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    relationship_type = Column("relationship", String(100), nullable=False)
    date_of_birth = Column(Date, nullable=True)
    notes = Column(Text, nullable=True)
    custom_attributes = Column(JSON, nullable=True)
    disliked_gifts = Column(JSON, nullable=True)
    ai_memory_enabled = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="recipients")
    interests = relationship("RecipientInterest", back_populates="recipient", cascade="all, delete-orphan")
    gift_preference = relationship("GiftPreference", back_populates="recipient", uselist=False, cascade="all, delete-orphan")
    occasions = relationship("Occasion", back_populates="recipient")
    search_sessions = relationship("SearchSession", back_populates="recipient")


class RecipientInterest(Base):
    __tablename__ = "recipient_interests"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    recipient_id = Column(String(36), ForeignKey("recipients.id", ondelete="CASCADE"), nullable=False, index=True)
    interest_name = Column(String(150), nullable=False, index=True)
    interest_category = Column(String(100), nullable=True)

    recipient = relationship("Recipient", back_populates="interests")


class GiftPreference(Base):
    __tablename__ = "gift_preferences"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    recipient_id = Column(String(36), ForeignKey("recipients.id", ondelete="CASCADE"), unique=True, nullable=False)
    minimum_budget = Column(Numeric(10, 2), default=0.00, nullable=False)
    maximum_budget = Column(Numeric(10, 2), default=25000.00, nullable=False)
    currency = Column(String(10), default="INR", nullable=False)
    preferred_categories = Column(JSON, nullable=True)
    disliked_categories = Column(JSON, nullable=True)
    preferred_styles = Column(JSON, nullable=True)
    additional_notes = Column(Text, nullable=True)

    recipient = relationship("Recipient", back_populates="gift_preference")


class Occasion(Base):
    __tablename__ = "occasions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    recipient_id = Column(String(36), ForeignKey("recipients.id", ondelete="SET NULL"), nullable=True, index=True)
    occasion_name = Column(String(150), nullable=False)
    occasion_date = Column(Date, nullable=False, index=True)
    reminder_enabled = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="occasions")
    recipient = relationship("Recipient", back_populates="occasions")
