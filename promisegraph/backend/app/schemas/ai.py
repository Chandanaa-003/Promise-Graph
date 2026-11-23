from datetime import datetime
from typing import List, Optional, Literal
from pydantic import BaseModel, Field
from app.schemas.commitment import CommitmentRead


class ExtractRequest(BaseModel):
    text: Optional[str] = None
    message_ids: Optional[List[str]] = None
    sender_name: Optional[str] = None
    reference_timestamp: Optional[datetime] = None


class ExtractedItemResponse(BaseModel):
    action: str
    promiser_name: str
    recipient_name: Optional[str] = None
    statement_type: str
    raw_deadline_phrase: Optional[str] = None
    normalized_deadline: Optional[datetime] = None
    confidence_score: float
    supporting_quote: str
    explanation: str
    commitment_type: str


class ExtractResponse(BaseModel):
    items: List[ExtractedItemResponse]
    persisted_commitments: List[CommitmentRead] = []
    auto_approved_count: int = 0
    review_queue_count: int = 0
    duplicates_skipped: int = 0


class ReviewActionPayload(BaseModel):
    action: Literal["approve", "reject", "edit"]
    title: Optional[str] = None
    due_date: Optional[datetime] = None
    person_id: Optional[str] = None
    description: Optional[str] = None


class AIStatsResponse(BaseModel):
    total_commitments: int
    approved_count: int
    pending_review_count: int
    rejected_count: int
    ai_provider: str
    ollama_model: str
    auto_approve_threshold: float
    review_queue_threshold: float
