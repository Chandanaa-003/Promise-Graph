from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.person import Person
from app.models.commitment import Commitment
from app.schemas.person import PersonCreate, PersonRead
from app.schemas.commitment import CommitmentRead

router = APIRouter(prefix="/people", tags=["People"])


@router.get("", response_model=List[PersonRead])
def list_people(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[PersonRead]:
    """List people in the authenticated user's relationship graph."""
    return (
        db.query(Person)
        .filter(Person.user_id == current_user.id)
        .order_by(Person.display_name.asc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.post("", response_model=PersonRead, status_code=status.HTTP_201_CREATED)
def create_person(
    person_in: PersonCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PersonRead:
    """Add a person to the authenticated user's relationship graph."""
    person = Person(
        user_id=current_user.id,
        display_name=person_in.display_name,
        email=person_in.email.lower() if person_in.email else None,
        phone=person_in.phone,
        handle=person_in.handle,
        organization=person_in.organization,
        relationship_score=person_in.relationship_score,
        notes=person_in.notes,
    )
    db.add(person)
    db.commit()
    db.refresh(person)
    return person


@router.get("/{person_id}", response_model=PersonRead)
def get_person(
    person_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PersonRead:
    """Get person details by ID, validating ownership."""
    person = (
        db.query(Person)
        .filter(Person.id == person_id, Person.user_id == current_user.id)
        .first()
    )
    if not person:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Person with ID '{person_id}' not found.",
        )
    return person


@router.get("/{person_id}/commitments", response_model=List[CommitmentRead])
def get_person_commitments(
    person_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[CommitmentRead]:
    """Get all commitments for a specific person owned by the current user."""
    person = (
        db.query(Person)
        .filter(Person.id == person_id, Person.user_id == current_user.id)
        .first()
    )
    if not person:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Person with ID '{person_id}' not found.",
        )
    return (
        db.query(Commitment)
        .filter(Commitment.person_id == person_id, Commitment.user_id == current_user.id)
        .order_by(Commitment.created_at.desc())
        .all()
    )
