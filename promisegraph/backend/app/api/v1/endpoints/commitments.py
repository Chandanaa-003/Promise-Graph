from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.commitment import CommitmentCreate, CommitmentRead, CommitmentUpdate
from app.services.commitment_service import CommitmentService

router = APIRouter(prefix="/commitments", tags=["Commitments"])


@router.get("", response_model=List[CommitmentRead])
def list_commitments(
    status_filter: Optional[str] = None,
    review_status: Optional[str] = "approved",
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[CommitmentRead]:
    """List tracked commitments belonging strictly to the authenticated user."""
    # When review_status is "all", pass None to bypass filtering
    r_status = None if review_status == "all" else review_status
    return CommitmentService.get_all(
        db,
        user_id=current_user.id,
        status=status_filter,
        review_status=r_status,
        skip=skip,
        limit=limit,
    )


@router.post("", response_model=CommitmentRead, status_code=status.HTTP_201_CREATED)
def create_commitment(
    commitment_in: CommitmentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CommitmentRead:
    """Create a new tracked commitment assigned to the authenticated user."""
    commitment_in.user_id = current_user.id
    return CommitmentService.create(db, commitment_in)


@router.get("/{commitment_id}", response_model=CommitmentRead)
def get_commitment(
    commitment_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CommitmentRead:
    """Get commitment details by ID, validating user ownership."""
    commitment = CommitmentService.get_by_id(db, commitment_id)
    if not commitment or commitment.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Commitment with ID '{commitment_id}' not found.",
        )
    return commitment


@router.patch("/{commitment_id}", response_model=CommitmentRead)
def update_commitment(
    commitment_id: str,
    commitment_in: CommitmentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CommitmentRead:
    """Update status, deadline, or details of a commitment owned by the authenticated user."""
    commitment = CommitmentService.get_by_id(db, commitment_id)
    if not commitment or commitment.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Commitment with ID '{commitment_id}' not found.",
        )
    return CommitmentService.update(db, commitment, commitment_in)


@router.delete("/{commitment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_commitment(
    commitment_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a commitment by ID after confirming ownership."""
    commitment = CommitmentService.get_by_id(db, commitment_id)
    if not commitment or commitment.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Commitment with ID '{commitment_id}' not found.",
        )
    CommitmentService.delete(db, commitment_id)
    return None
