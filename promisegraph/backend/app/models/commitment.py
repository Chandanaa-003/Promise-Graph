import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Commitment(Base):
    """Extracted promise or commitment made by or to the user."""

    __tablename__ = "commitments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    conversation_id = Column(
        String(36),
        ForeignKey("conversations.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    person_id = Column(
        String(36),
        ForeignKey("people.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(
        String(50),
        default="pending",
        nullable=False,
        index=True,
    )  # pending, in_progress, fulfilled, cancelled, overdue
    commitment_type = Column(
        String(50),
        default="promise_made",
        nullable=False,
        index=True,
    )  # promise_made, promise_received
    due_date = Column(DateTime(timezone=True), nullable=True)
    confidence_score = Column(Float, default=1.0, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relationships
    user = relationship("User", back_populates="commitments")
    conversation = relationship("Conversation", back_populates="commitments")
    person = relationship("Person", back_populates="commitments")
    evidence_items = relationship(
        "Evidence", back_populates="commitment", cascade="all, delete-orphan"
    )
