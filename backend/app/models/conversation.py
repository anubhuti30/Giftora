import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, Numeric, ForeignKey, JSON, Enum
from sqlalchemy.orm import relationship
from app.core.database import Base


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    recipient_id = Column(String(36), ForeignKey("recipients.id", ondelete="SET NULL"), nullable=True, index=True)
    title = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan", order_by="Message.created_at")
    search_sessions = relationship("SearchSession", back_populates="conversation")


class Message(Base):
    __tablename__ = "messages"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    conversation_id = Column(String(36), ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False, index=True)
    sender_type = Column(Enum("user", "assistant", "system", name="sender_types"), nullable=False)
    message_content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    conversation = relationship("Conversation", back_populates="messages")


class SearchSession(Base):
    __tablename__ = "search_sessions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    recipient_id = Column(String(36), ForeignKey("recipients.id", ondelete="SET NULL"), nullable=True, index=True)
    conversation_id = Column(String(36), ForeignKey("conversations.id", ondelete="SET NULL"), nullable=True)
    occasion = Column(String(100), nullable=True)
    original_query = Column(Text, nullable=False)
    extracted_preferences = Column(JSON, nullable=True)
    minimum_budget = Column(Numeric(10, 2), nullable=True)
    maximum_budget = Column(Numeric(10, 2), nullable=True)
    search_status = Column(String(50), default="PENDING", nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    completed_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="search_sessions")
    recipient = relationship("Recipient", back_populates="search_sessions")
    conversation = relationship("Conversation", back_populates="search_sessions")
    recommendations = relationship("Recommendation", back_populates="search_session", cascade="all, delete-orphan")
