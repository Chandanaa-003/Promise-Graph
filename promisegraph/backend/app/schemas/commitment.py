from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class CommitmentBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: str = "pending"  # pending, in_progress, fulfilled, cancelled, overdue
    commitment_type: str = "promise_made"  # promise_made, promise_received
    due_date: Optional[datetime] = None
    confidence_score: float = 1.0
    review_status: str = "approved"  # pending, approved, rejected
    statement_type: Optional[str] = "promise"
    ai_explanation: Optional[str] = None
    raw_quote: Optional[str] = None
    source_message_id: Optional[str] = None


class CommitmentCreate(CommitmentBase):
    user_id: Optional[str] = None
    conversation_id: Optional[str] = None
    person_id: Optional[str] = None
    channel: Optional[str] = "email"


class CommitmentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    commitment_type: Optional[str] = None
    due_date: Optional[datetime] = None
    confidence_score: Optional[float] = None
    person_id: Optional[str] = None
    review_status: Optional[str] = None
    statement_type: Optional[str] = None
    ai_explanation: Optional[str] = None
    raw_quote: Optional[str] = None
    source_message_id: Optional[str] = None


class CommitmentRead(CommitmentBase):
    id: str
    user_id: str
    conversation_id: Optional[str] = None
    person_id: Optional[str] = None
    person_name: Optional[str] = None
    channel: Optional[str] = None
    evidence_snippets: Optional[List[str]] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
