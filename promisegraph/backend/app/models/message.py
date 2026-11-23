import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Message(Base):
    """Individual communication message across email, WhatsApp, and GitHub."""

    __tablename__ = "messages"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    conversation_id = Column(
        String(36),
        ForeignKey("conversations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id = Column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    external_id = Column(String(255), nullable=True, index=True)
    sender_name = Column(String(255), nullable=True)
    sender_address = Column(String(255), nullable=True)
    recipient_addresses = Column(Text, nullable=True)
    subject = Column(String(500), nullable=True)
    content = Column(Text, nullable=False)
    content_type = Column(String(50), default="text", nullable=False)  # text, snippet, markdown
    source_url = Column(String(1000), nullable=True)
    timestamp = Column(DateTime(timezone=True), nullable=False)
    raw_metadata = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    conversation = relationship("Conversation", back_populates="messages")
    user = relationship("User")
