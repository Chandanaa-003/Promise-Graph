from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.commitment import Commitment
from app.schemas.commitment import CommitmentCreate, CommitmentUpdate


class CommitmentService:
    """Service layer for commitment tracking operations."""

    @staticmethod
    def get_by_id(db: Session, commitment_id: str) -> Optional[Commitment]:
        return db.query(Commitment).filter(Commitment.id == commitment_id).first()

    @staticmethod
    def get_all(
        db: Session,
        user_id: Optional[str] = None,
        status: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Commitment]:
        query = db.query(Commitment)
        if user_id:
            query = query.filter(Commitment.user_id == user_id)
        if status:
            query = query.filter(Commitment.status == status)
        return query.order_by(Commitment.created_at.desc()).offset(skip).limit(limit).all()

    @staticmethod
    def create(db: Session, commitment_in: CommitmentCreate) -> Commitment:
        commitment = Commitment(
            user_id=commitment_in.user_id,
            conversation_id=commitment_in.conversation_id,
            person_id=commitment_in.person_id,
            title=commitment_in.title,
            description=commitment_in.description,
            status=commitment_in.status,
            commitment_type=commitment_in.commitment_type,
            due_date=commitment_in.due_date,
            confidence_score=commitment_in.confidence_score,
        )
        db.add(commitment)
        db.commit()
        db.refresh(commitment)
        return commitment

    @staticmethod
    def update(
        db: Session, db_commitment: Commitment, commitment_in: CommitmentUpdate
    ) -> Commitment:
        update_data = commitment_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_commitment, field, value)
        db.commit()
        db.refresh(db_commitment)
        return db_commitment
