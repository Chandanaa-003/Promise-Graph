import logging
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.connected_account import ConnectedAccount
from app.models.conversation import Conversation
from app.models.message import Message
from app.schemas.integration import (
    ConnectedAccountRead,
    OAuthAuthorizeResponse,
    OAuthCallbackRequest,
    GitHubPatRequest,
    GitHubSyncRequest,
    GmailSyncRequest,
    WhatsAppImportResponse,
    MessageRead,
    ChatSummaryRead,
)
from app.schemas.auth import MessageResponse
from app.services.gmail_service import GmailService
from app.services.github_service import GitHubService
from app.services.whatsapp_service import WhatsAppParser

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/integrations", tags=["Communication Sources"])


# -------------------------------------------------------------------------
# Account Statuses Overview
# -------------------------------------------------------------------------

@router.get("/accounts", response_model=List[ConnectedAccountRead])
def get_connected_accounts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[ConnectedAccountRead]:
    """Retrieve all external communication accounts connected for the authenticated user."""
    accounts = (
        db.query(ConnectedAccount)
        .filter(ConnectedAccount.user_id == current_user.id)
        .all()
    )
    return accounts


# -------------------------------------------------------------------------
# Gmail Integration
# -------------------------------------------------------------------------

@router.get("/gmail/auth-url", response_model=OAuthAuthorizeResponse)
def get_gmail_auth_url(
    current_user: User = Depends(get_current_user),
) -> OAuthAuthorizeResponse:
    """Generate Google OAuth 2.0 authorization URL with minimal read-only Gmail scopes."""
    data = GmailService.get_authorization_url(current_user.id)
    return OAuthAuthorizeResponse(**data)


@router.post("/gmail/callback", response_model=ConnectedAccountRead)
async def handle_gmail_callback(
    payload: OAuthCallbackRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ConnectedAccountRead:
    """Exchange authorization code from Google OAuth redirect for access & refresh tokens."""
    try:
        account = await GmailService.exchange_code_for_token(
            code=payload.code,
            state=payload.state,
            user_id=current_user.id,
            db=db,
        )
        return account
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )


@router.post("/gmail/sync")
async def sync_gmail_emails(
    payload: GmailSyncRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """Fetch and ingest authorized emails from connected Gmail account."""
    account = (
        db.query(ConnectedAccount)
        .filter(
            ConnectedAccount.user_id == current_user.id,
            ConnectedAccount.provider == "gmail",
            ConnectedAccount.is_active == True,
        )
        .first()
    )
    if not account:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active Gmail account connected. Please connect your Google account first.",
        )

    try:
        result = await GmailService.fetch_and_sync_emails(
            user_id=current_user.id,
            account=account,
            db=db,
            max_results=payload.max_results or 15,
            page_token=payload.page_token,
        )
        return result
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )


@router.delete("/gmail", response_model=MessageResponse)
async def disconnect_gmail(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MessageResponse:
    """Disconnect Google Gmail integration and revoke stored credentials."""
    success = await GmailService.disconnect_account(current_user.id, db)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active Gmail connection found to disconnect.",
        )
    return MessageResponse(message="Gmail account disconnected successfully.")


# -------------------------------------------------------------------------
# WhatsApp Chat Import
# -------------------------------------------------------------------------

@router.post("/whatsapp/import", response_model=WhatsAppImportResponse, status_code=status.HTTP_201_CREATED)
async def import_whatsapp_chat(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> WhatsAppImportResponse:
    """Upload and parse an exported WhatsApp .txt chat transcript."""
    # 1. Validate file extension
    filename = file.filename or "chat.txt"
    if not filename.lower().endswith(".txt"):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid file type. Please upload an exported WhatsApp transcript (.txt file).",
        )

    # 2. Read and enforce size limit (10MB max)
    content_bytes = await file.read()
    if len(content_bytes) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size exceeds maximum allowed limit of 10 MB.",
        )

    if len(content_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Uploaded file is empty.",
        )

    # 3. Decode text with fallback encodings
    raw_text = None
    for encoding in ["utf-8-sig", "utf-8", "utf-16", "latin-1"]:
        try:
            raw_text = content_bytes.decode(encoding)
            break
        except UnicodeDecodeError:
            continue

    if not raw_text:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Could not decode file content. Please ensure the file is plain text UTF-8.",
        )

    # Default title to filename without extension if not provided
    default_title = title or filename.rsplit(".", 1)[0].replace("_", " ").title()

    try:
        result = WhatsAppParser.ingest_chat(
            db=db,
            user_id=current_user.id,
            raw_text=raw_text,
            title=default_title,
        )
        return WhatsAppImportResponse(**result)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        )


@router.get("/whatsapp/chats", response_model=List[ChatSummaryRead])
def list_whatsapp_chats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[ChatSummaryRead]:
    """List all imported WhatsApp chat conversations for the current user."""
    convs = (
        db.query(
            Conversation.id,
            Conversation.title,
            Conversation.channel,
            Conversation.external_id,
            Conversation.last_message_at,
            Conversation.created_at,
            func.count(Message.id).label("message_count"),
        )
        .outerjoin(Message, Conversation.id == Message.conversation_id)
        .filter(
            Conversation.user_id == current_user.id,
            Conversation.channel == "whatsapp",
        )
        .group_by(Conversation.id)
        .order_by(Conversation.created_at.desc())
        .all()
    )

    return [
        ChatSummaryRead(
            id=c.id,
            title=c.title,
            channel=c.channel,
            external_id=c.external_id,
            last_message_at=c.last_message_at,
            created_at=c.created_at,
            message_count=c.message_count,
        )
        for c in convs
    ]


@router.delete("/whatsapp/chats/{conversation_id}", response_model=MessageResponse)
def delete_whatsapp_chat(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MessageResponse:
    """Delete an imported WhatsApp conversation and its associated messages."""
    conv = (
        db.query(Conversation)
        .filter(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user.id,
            Conversation.channel == "whatsapp",
        )
        .first()
    )
    if not conv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"WhatsApp conversation '{conversation_id}' not found.",
        )

    db.delete(conv)
    db.commit()
    return MessageResponse(message="WhatsApp conversation deleted successfully.")


# -------------------------------------------------------------------------
# GitHub Integration
# -------------------------------------------------------------------------

@router.get("/github/auth-url", response_model=OAuthAuthorizeResponse)
def get_github_auth_url(
    current_user: User = Depends(get_current_user),
) -> OAuthAuthorizeResponse:
    """Generate GitHub OAuth authorization URL."""
    data = GitHubService.get_authorization_url(current_user.id)
    return OAuthAuthorizeResponse(**data)


@router.post("/github/callback", response_model=ConnectedAccountRead)
async def handle_github_callback(
    payload: OAuthCallbackRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ConnectedAccountRead:
    """Exchange authorization code from GitHub OAuth redirect for an access token."""
    try:
        account = await GitHubService.exchange_code_for_token(
            code=payload.code,
            state=payload.state,
            user_id=current_user.id,
            db=db,
        )
        return account
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )


@router.post("/github/pat", response_model=ConnectedAccountRead)
async def connect_github_pat(
    payload: GitHubPatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ConnectedAccountRead:
    """Connect GitHub using a personal access token (read:user, repo) for developer environments."""
    try:
        account = await GitHubService.connect_with_pat(
            token=payload.token,
            user_id=current_user.id,
            db=db,
        )
        return account
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )


@router.get("/github/repositories")
async def list_github_repositories(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[Dict[str, Any]]:
    """List accessible GitHub repositories for the connected user."""
    account = (
        db.query(ConnectedAccount)
        .filter(
            ConnectedAccount.user_id == current_user.id,
            ConnectedAccount.provider == "github",
            ConnectedAccount.is_active == True,
        )
        .first()
    )
    if not account:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active GitHub account connected.",
        )

    try:
        repos = await GitHubService.list_repositories(account, db)
        return repos
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )


@router.post("/github/sync")
async def sync_github_issues(
    payload: GitHubSyncRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """Fetch and ingest issues and pull requests from a selected GitHub repository."""
    account = (
        db.query(ConnectedAccount)
        .filter(
            ConnectedAccount.user_id == current_user.id,
            ConnectedAccount.provider == "github",
            ConnectedAccount.is_active == True,
        )
        .first()
    )
    if not account:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active GitHub account connected.",
        )

    try:
        result = await GitHubService.sync_issues_and_prs(
            user_id=current_user.id,
            account=account,
            repo_full_name=payload.repository,
            db=db,
            page=payload.page or 1,
            per_page=payload.per_page or 20,
        )
        return result
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )


@router.delete("/github", response_model=MessageResponse)
def disconnect_github(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MessageResponse:
    """Disconnect GitHub integration and remove stored token."""
    success = GitHubService.disconnect_account(current_user.id, db)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active GitHub connection found to disconnect.",
        )
    return MessageResponse(message="GitHub account disconnected successfully.")


# -------------------------------------------------------------------------
# Unified Communication Messages Viewer
# -------------------------------------------------------------------------

@router.get("/messages", response_model=List[MessageRead])
def get_unified_messages(
    conversation_id: Optional[str] = None,
    channel: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[MessageRead]:
    """Retrieve ingested communication messages across email, WhatsApp, and GitHub for the current user."""
    query = db.query(Message).filter(Message.user_id == current_user.id)

    if conversation_id:
        query = query.filter(Message.conversation_id == conversation_id)

    if channel:
        query = query.join(Conversation, Message.conversation_id == Conversation.id).filter(
            Conversation.channel == channel
        )

    return (
        query.order_by(Message.timestamp.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
