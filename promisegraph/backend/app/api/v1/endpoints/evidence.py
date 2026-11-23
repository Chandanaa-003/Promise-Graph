from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.commitment import Commitment
from app.models.evidence import Evidence
from app.schemas.evidence import EvidenceCreate, EvidenceRead

router = APIRouter(prefix="/evidence", tags=["Evidence"])


@router.get("", response_model=List[EvidenceRead])
def list_evidence(
    commitment_id: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[EvidenceRead]:
    """Retrieve audit evidence snippets isolated to the authenticated user's commitments."""
    query = (
        db.query(Evidence)
        .join(Commitment, Evidence.commitment_id == Commitment.id)
        .filter(Commitment.user_id == current_user.id)
    )
    if commitment_id:
        query = query.filter(Evidence.commitment_id == commitment_id)
    return query.order_by(Evidence.created_at.desc()).offset(skip).limit(limit).all()


@router.post("", response_model=EvidenceRead, status_code=status.HTTP_201_CREATED)
def create_evidence(
    evidence_in: EvidenceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> EvidenceRead:
    """Attach verification evidence to a commitment owned by the current user."""
    commitment = (
        db.query(Commitment)
        .filter(Commitment.id == evidence_in.commitment_id, Commitment.user_id == current_user.id)
        .first()
    )
    if not commitment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Commitment with ID '{evidence_in.commitment_id}' not found.",
        )

    evidence = Evidence(
        commitment_id=evidence_in.commitment_id,
        conversation_id=evidence_in.conversation_id,
        snippet_text=evidence_in.snippet_text,
        context_before=evidence_in.context_before,
        context_after=evidence_in.context_after,
        timestamp=evidence_in.timestamp,
        source_message_id=evidence_in.source_message_id,
    )
    db.add(evidence)
    db.commit()
    db.refresh(evidence)
    return evidence


@router.get("/{evidence_id}", response_model=EvidenceRead)
def get_evidence(
    evidence_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> EvidenceRead:
    """Get evidence record by ID, ensuring user data isolation."""
    evidence = (
        db.query(Evidence)
        .join(Commitment, Evidence.commitment_id == Commitment.id)
        .filter(Evidence.id == evidence_id, Commitment.user_id == current_user.id)
        .first()
    )
    if not evidence:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Evidence with ID '{evidence_id}' not found.",
        )
    return evidence
