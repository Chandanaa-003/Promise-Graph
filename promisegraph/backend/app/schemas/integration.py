from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict


class ConnectedAccountRead(BaseModel):
    """Schema for external connected account details (without tokens)."""
    id: str
    provider: str
    account_identifier: str
    is_active: bool
    token_expires_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    metadata_json: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class OAuthAuthorizeResponse(BaseModel):
    """Schema for OAuth authorization initialization."""
    url: str
    state: str
    configured: bool


class OAuthCallbackRequest(BaseModel):
    """Schema for OAuth callback code exchange."""
    code: str
    state: str


class GitHubPatRequest(BaseModel):
    """Schema for connecting GitHub via Personal Access Token."""
    token: str


class GitHubSyncRequest(BaseModel):
    """Schema for syncing repository issues and pull requests."""
    repository: str
    page: Optional[int] = 1
    per_page: Optional[int] = 20


class GmailSyncRequest(BaseModel):
    """Schema for synchronizing Gmail messages."""
    max_results: Optional[int] = 15
    page_token: Optional[str] = None


class MessageRead(BaseModel):
    """Unified communication message representation."""
    id: str
    conversation_id: str
    user_id: str
    external_id: Optional[str] = None
    sender_name: Optional[str] = None
    sender_address: Optional[str] = None
    recipient_addresses: Optional[str] = None
    subject: Optional[str] = None
    content: str
    content_type: str = "text"
    source_url: Optional[str] = None
    timestamp: datetime
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class WhatsAppImportResponse(BaseModel):
    """Response returned upon importing a WhatsApp transcript."""
    conversation_id: str
    title: str
    channel: str
    total_messages: int
    participants: List[str]
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    system_lines_skipped: int


class ChatSummaryRead(BaseModel):
    """Summary of an ingested conversation."""
    id: str
    title: str
    channel: str
    external_id: Optional[str] = None
    last_message_at: Optional[datetime] = None
    created_at: datetime
    message_count: int = 0

    model_config = ConfigDict(from_attributes=True)
