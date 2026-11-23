import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.commitment import Commitment
from app.models.conversation import Conversation
from app.models.message import Message
from app.models.user import User
from app.schemas.ai import (
    ExtractRequest,
    ExtractResponse,
    ExtractedItemResponse,
    ReviewActionPayload,
    AIStatsResponse,
)
from app.schemas.commitment import CommitmentRead
from app.services.ai_extraction_service import AIExtractionService, ExtractionBatchSummary

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai", tags=["AI Commitment Intelligence"])


@router.post("/extract", response_model=ExtractResponse)
async def extract_commitments(
    payload: ExtractRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ExtractResponse:
    """
    Extracts promises, requests, and speech acts from arbitrary text or authorized messages.
    Persists commitments when analyzing stored message IDs.
    """
    all_items: List[ExtractedItemResponse] = []
    persisted: List[Commitment] = []
    total_auto = 0
    total_review = 0
    total_dupes = 0

    # Case 1: Extract from message IDs
    if payload.message_ids:
        messages = db.query(Message).filter(
            Message.id.in_(payload.message_ids),
            Message.user_id == current_user.id,
        ).all()

        for msg in messages:
            items = await AIExtractionService.extract_from_text(
                text=msg.content,
                sender_name=msg.sender_name or msg.sender_address or "Unknown",
                reference_timestamp=msg.timestamp,
                current_user_name=current_user.full_name,
                current_user_email=current_user.email,
            )
            for it in items:
                all_items.append(ExtractedItemResponse.model_validate(it.model_dump()))

            conv = db.query(Conversation).filter(Conversation.id == msg.conversation_id).first()
            created, auto_app, rev_q, dupes = AIExtractionService.process_and_persist_extraction(
                db=db,
                items=items,
                user=current_user,
                conversation=conv,
                source_message=msg,
            )
            persisted.extend(created)
            total_auto += auto_app
            total_review += rev_q
            total_dupes += dupes

    # Case 2: Extract from direct text
    elif payload.text:
        items = await AIExtractionService.extract_from_text(
            text=payload.text,
            sender_name=payload.sender_name or current_user.full_name or "Alex Mercer",
            reference_timestamp=payload.reference_timestamp,
            current_user_name=current_user.full_name,
            current_user_email=current_user.email,
        )
        for it in items:
            all_items.append(ExtractedItemResponse.model_validate(it.model_dump()))

    return ExtractResponse(
        items=all_items,
        persisted_commitments=[CommitmentRead.model_validate(p) for p in persisted],
        auto_approved_count=total_auto,
        review_queue_count=total_review,
        duplicates_skipped=total_dupes,
    )


@router.post("/extract-conversation/{conversation_id}", response_model=ExtractionBatchSummary)
async def extract_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ExtractionBatchSummary:
    """
    Analyzes an entire authorized conversation thread across Gmail, WhatsApp, or GitHub.
    Extracts, classifies, and populates the database with auto-approved or review-queue commitments.
    """
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id,
    ).first()

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conversation '{conversation_id}' not found.",
        )

    summary = await AIExtractionService.extract_and_store_conversation(
        db=db,
        conversation_id=conversation_id,
        user=current_user,
    )
    return summary


@router.get("/review-queue", response_model=List[CommitmentRead])
def list_review_queue(
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[CommitmentRead]:
    """
    Retrieves the queue of AI-extracted commitment suggestions pending human review.
    Guarantees strict user isolation.
    """
    pending_items = (
        db.query(Commitment)
        .filter(
            Commitment.user_id == current_user.id,
            Commitment.review_status == "pending",
        )
        .order_by(Commitment.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [CommitmentRead.model_validate(c) for c in pending_items]


@router.post("/review/{commitment_id}", response_model=CommitmentRead)
def review_commitment(
    commitment_id: str,
    payload: ReviewActionPayload,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CommitmentRead:
    """
    Approve, reject, or edit an AI-extracted commitment from the human review queue.
    """
    commitment = db.query(Commitment).filter(
        Commitment.id == commitment_id,
        Commitment.user_id == current_user.id,
    ).first()

    if not commitment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Commitment '{commitment_id}' not found.",
        )

    if payload.action == "approve":
        commitment.review_status = "approved"
        commitment.status = "pending"
    elif payload.action == "reject":
        commitment.review_status = "rejected"
        commitment.status = "cancelled"
    elif payload.action == "edit":
        if payload.title:
            commitment.title = payload.title
        if payload.due_date is not None:
            commitment.due_date = payload.due_date
        if payload.person_id:
            commitment.person_id = payload.person_id
        if payload.description:
            commitment.description = payload.description
        commitment.review_status = "approved"
        commitment.status = "pending"
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown review action '{payload.action}'",
        )

    db.commit()
    db.refresh(commitment)
    return CommitmentRead.model_validate(commitment)


@router.get("/stats", response_model=AIStatsResponse)
def get_ai_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AIStatsResponse:
    """Returns AI extraction statistics and threshold settings for the user."""
    total = db.query(Commitment).filter(Commitment.user_id == current_user.id).count()
    approved = (
        db.query(Commitment)
        .filter(Commitment.user_id == current_user.id, Commitment.review_status == "approved")
        .count()
    )
    pending = (
        db.query(Commitment)
        .filter(Commitment.user_id == current_user.id, Commitment.review_status == "pending")
        .count()
    )
    rejected = (
        db.query(Commitment)
        .filter(Commitment.user_id == current_user.id, Commitment.review_status == "rejected")
        .count()
    )

    return AIStatsResponse(
        total_commitments=total,
        approved_count=approved,
        pending_review_count=pending,
        rejected_count=rejected,
        ai_provider=settings.AI_PROVIDER,
        ollama_model=settings.OLLAMA_MODEL,
        auto_approve_threshold=settings.AI_CONFIDENCE_THRESHOLD_AUTO_APPROVE,
        review_queue_threshold=settings.AI_CONFIDENCE_THRESHOLD_REVIEW_QUEUE,
    )
