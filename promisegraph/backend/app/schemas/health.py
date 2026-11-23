from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    """Health check response schema."""

    status: str = Field("ok", description="Overall system health status")
    app_name: str = Field(..., description="Application name")
    environment: str = Field(..., description="Running environment")
    version: str = Field("0.1.0", description="Application version")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Current UTC timestamp")
    database_connected: bool = Field(..., description="Database connection status")
    database_message: Optional[str] = Field(None, description="Database status message or error")
