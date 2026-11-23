from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class ConnectedAccountBase(BaseModel):
    provider: str
    account_identifier: str
    is_active: bool = True


class ConnectedAccountCreate(ConnectedAccountBase):
    user_id: str
    metadata_json: Optional[str] = None


class ConnectedAccountRead(ConnectedAccountBase):
    id: str
    user_id: str
    metadata_json: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
