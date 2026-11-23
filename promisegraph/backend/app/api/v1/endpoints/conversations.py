from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.conversation import Conversation
from app.schemas.conversation import ConversationCreate, ConversationRead

router = APIRouter(prefix="/conversations", tags=["Conversations"])


@router.get("", response_model=List[ConversationRead])
def list_conversations(
    user_id: str = None,
    channel: str = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
) -> List[ConversationRead]:
    """List ingested conversations."""
    query = db.query(Conversation)
    if user_id:
        query = query.filter(Conversation.user_id == user_id)
    if channel:
        query = query.filter(Conversation.channel == channel)
    return query.order_by(Conversation.created_at.desc()).offset(skip).limit(limit).all()


@router.post("", response_model=ConversationRead, status_code=status.HTTP_201_CREATED)
def create_conversation(
    conv_in: ConversationCreate, db: Session = Depends(get_db)
) -> ConversationRead:
    """Register an ingested conversation."""
    conversation = Conversation(
        user_id=conv_in.user_id,
        connected_account_id=conv_in.connected_account_id,
        external_id=conv_in.external_id,
        title=conv_in.title,
        channel=conv_in.channel,
        last_message_at=conv_in.last_message_at,
        raw_metadata=conv_in.raw_metadata,
    )
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    return conversation


@router.get("/{conversation_id}", response_model=ConversationRead)
def get_conversation(
    conversation_id: str, db: Session = Depends(get_db)
) -> ConversationRead:
    """Get conversation details by ID."""
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conversation with ID '{conversation_id}' not found.",
        )
    return conversation
