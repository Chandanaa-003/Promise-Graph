from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.commitment import CommitmentCreate, CommitmentRead, CommitmentUpdate
from app.services.commitment_service import CommitmentService

router = APIRouter(prefix="/commitments", tags=["Commitments"])


@router.get("", response_model=List[CommitmentRead])
def list_commitments(
    user_id: Optional[str] = None,
    status_filter: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
) -> List[CommitmentRead]:
    """List tracked commitments with optional status and user filtering."""
    return CommitmentService.get_all(
        db, user_id=user_id, status=status_filter, skip=skip, limit=limit
    )


@router.post("", response_model=CommitmentRead, status_code=status.HTTP_201_CREATED)
def create_commitment(
    commitment_in: CommitmentCreate, db: Session = Depends(get_db)
) -> CommitmentRead:
    """Create a new tracked commitment."""
    return CommitmentService.create(db, commitment_in)


@router.get("/{commitment_id}", response_model=CommitmentRead)
def get_commitment(
    commitment_id: str, db: Session = Depends(get_db)
) -> CommitmentRead:
    """Get commitment details by ID."""
    commitment = CommitmentService.get_by_id(db, commitment_id)
    if not commitment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Commitment with ID '{commitment_id}' not found.",
        )
    return commitment


@router.patch("/{commitment_id}", response_model=CommitmentRead)
def update_commitment(
    commitment_id: str,
    commitment_in: CommitmentUpdate,
    db: Session = Depends(get_db),
) -> CommitmentRead:
    """Update status, deadline, or details of a commitment."""
    commitment = CommitmentService.get_by_id(db, commitment_id)
    if not commitment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Commitment with ID '{commitment_id}' not found.",
        )
    return CommitmentService.update(db, commitment, commitment_in)


@router.delete("/{commitment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_commitment(
    commitment_id: str,
    db: Session = Depends(get_db),
):
    """Delete a commitment by ID."""
    success = CommitmentService.delete(db, commitment_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Commitment with ID '{commitment_id}' not found.",
        )
    return None
