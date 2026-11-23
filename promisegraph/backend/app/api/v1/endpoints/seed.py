from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.seed import seed_data_if_empty

router = APIRouter(prefix="/seed", tags=["System"])


@router.post("")
def trigger_seed(db: Session = Depends(get_db)):
    """Seed or reset demo commitments, people, and evidence."""
    seed_data_if_empty(db, force=True)
    return {"status": "ok", "message": "Demo data populated successfully."}
