import uuid
from typing import Optional
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Evidence(Base):
    """Contextual excerpt and verification proof for an extracted commitment."""

    __tablename__ = "evidence"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    commitment_id = Column(
        String(36),
        ForeignKey("commitments.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    conversation_id = Column(
        String(36),
        ForeignKey("conversations.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    snippet_text = Column(Text, nullable=False)
    context_before = Column(Text, nullable=True)
    context_after = Column(Text, nullable=True)
    timestamp = Column(DateTime(timezone=True), nullable=True)
    source_message_id = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    commitment = relationship("Commitment", back_populates="evidence_items")
    conversation = relationship("Conversation", back_populates="evidence_items")

    @property
    def commitment_title(self) -> Optional[str]:
        return self.commitment.title if self.commitment else None

    @property
    def channel(self) -> Optional[str]:
        if self.conversation:
            return self.conversation.channel
        if self.commitment and self.commitment.conversation:
            return self.commitment.conversation.channel
        return "email"
