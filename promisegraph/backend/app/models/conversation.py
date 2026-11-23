import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Conversation(Base):
    """Conversation thread across ingested communication channels."""

    __tablename__ = "conversations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    connected_account_id = Column(
        String(36),
        ForeignKey("connected_accounts.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    external_id = Column(String(255), nullable=True, index=True)  # Thread ID / Chat ID
    title = Column(String(500), nullable=False)
    channel = Column(String(50), nullable=False, index=True)     # email, whatsapp, github_issue
    last_message_at = Column(DateTime(timezone=True), nullable=True)
    raw_metadata = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relationships
    user = relationship("User", back_populates="conversations")
    connected_account = relationship("ConnectedAccount", back_populates="conversations")
    commitments = relationship("Commitment", back_populates="conversation")
    evidence_items = relationship("Evidence", back_populates="conversation")
