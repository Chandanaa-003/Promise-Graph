from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class EvidenceBase(BaseModel):
    snippet_text: str
    context_before: Optional[str] = None
    context_after: Optional[str] = None
    timestamp: Optional[datetime] = None
    source_message_id: Optional[str] = None


class EvidenceCreate(EvidenceBase):
    commitment_id: str
    conversation_id: Optional[str] = None


class EvidenceRead(EvidenceBase):
    id: str
    commitment_id: str
    conversation_id: Optional[str] = None
    commitment_title: Optional[str] = None
    channel: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
