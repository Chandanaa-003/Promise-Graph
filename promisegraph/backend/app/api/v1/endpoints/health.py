from datetime import datetime
from fastapi import APIRouter
from app.core.config import settings
from app.core.database import check_db_connection
from app.schemas.health import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse, tags=["Health"])
def get_health() -> HealthResponse:
    """Return application health status, version, and database connectivity."""
    db_ok, db_msg = check_db_connection()
    status = "ok" if db_ok else "degraded"

    return HealthResponse(
        status=status,
        app_name=settings.APP_NAME,
        environment=settings.ENVIRONMENT,
        version="0.1.0",
        timestamp=datetime.utcnow(),
        database_connected=db_ok,
        database_message=db_msg,
    )
