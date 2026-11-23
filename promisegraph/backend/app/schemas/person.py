from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class PersonBase(BaseModel):
    display_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    handle: Optional[str] = None
    organization: Optional[str] = None
    relationship_score: float = 0.0
    notes: Optional[str] = None


class PersonCreate(PersonBase):
    user_id: str


class PersonUpdate(BaseModel):
    display_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    handle: Optional[str] = None
    organization: Optional[str] = None
    relationship_score: Optional[float] = None
    notes: Optional[str] = None


class PersonRead(PersonBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
