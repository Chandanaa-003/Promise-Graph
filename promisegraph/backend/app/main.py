import logging
from contextlib import asynccontextmanager
from datetime import datetime
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.router import api_v1_router
from app.core.config import settings
from app.core.database import check_db_connection, init_db
from app.schemas.health import HealthResponse

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("promisegraph")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context for startup and shutdown routines."""
    logger.info(f"Starting {settings.APP_NAME} in {settings.ENVIRONMENT} mode...")
    try:
        init_db()
        logger.info("Database initialized successfully.")
    except Exception as exc:
        logger.warning(
            f"Database initialization could not complete on startup: {exc}. "
            "Tables will be initialized once database connection is available."
        )
    yield
    logger.info(f"Shutting down {settings.APP_NAME}...")


app = FastAPI(
    title=settings.APP_NAME,
    description="PromiseGraph AI-powered communication intelligence and commitment tracking platform API.",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    """Attach processing performance metrics to response headers."""
    response = await call_next(request)
    response.headers["X-Application-Name"] = settings.APP_NAME
    return response


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error processing {request.method} {request.url.path}: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred.", "path": request.url.path},
    )


# Health check endpoint required specifically at GET /api/health
@app.get(
    "/api/health",
    response_model=HealthResponse,
    tags=["System"],
    summary="System Health Check",
)
def api_health() -> HealthResponse:
    """Return application health, version, and database connectivity."""
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


# Root info endpoint
@app.get("/", tags=["System"], summary="API Root Overview")
def root_info():
    """Root info endpoint providing API metadata and links."""
    return {
        "name": settings.APP_NAME,
        "version": "0.1.0",
        "status": "online",
        "docs": "/docs",
        "health": "/api/health",
        "api_v1": settings.API_V1_STR,
    }


# Mount API v1 router
app.include_router(api_v1_router, prefix=settings.API_V1_STR)
