from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class ConversationBase(BaseModel):
    title: str
    channel: str
    external_id: Optional[str] = None
    last_message_at: Optional[datetime] = None


class ConversationCreate(ConversationBase):
    user_id: str
    connected_account_id: Optional[str] = None
    raw_metadata: Optional[str] = None


class ConversationRead(ConversationBase):
    id: str
    user_id: str
    connected_account_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
