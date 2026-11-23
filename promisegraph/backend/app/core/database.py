import logging
from typing import Generator, Tuple
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.core.config import settings

logger = logging.getLogger(__name__)

# Configure connect_args based on DB dialect
connect_args = {}
if settings.is_sqlite:
    connect_args["check_same_thread"] = False

# SQLAlchemy Engine
engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,
    echo=settings.DEBUG and not settings.ENVIRONMENT == "production",
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Declarative Base
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """Dependency that provides a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_db_connection() -> Tuple[bool, str]:
    """Check whether database connection is alive and working."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True, "Database connected successfully"
    except Exception as exc:
        logger.warning(f"Database connection check failed: {exc}")
        return False, str(exc)


def init_db() -> None:
    """Initialize database tables from models."""
    try:
        # Import all models to ensure they are registered on the Base metadata
        import app.models  # noqa: F401

        Base.metadata.create_all(bind=engine)

        # Check and migrate columns if necessary
        with engine.connect() as conn:
            if settings.is_sqlite:
                result = conn.execute(text("PRAGMA table_info(users)"))
                columns = [row[1] for row in result.fetchall()]
                if columns and "hashed_password" not in columns:
                    conn.execute(text("ALTER TABLE users ADD COLUMN hashed_password VARCHAR(255)"))
                    conn.commit()
                    logger.info("Added hashed_password column to users table.")

                # Migrate commitments table columns if missing
                result = conn.execute(text("PRAGMA table_info(commitments)"))
                comm_columns = [row[1] for row in result.fetchall()]
                if comm_columns:
                    if "review_status" not in comm_columns:
                        conn.execute(text("ALTER TABLE commitments ADD COLUMN review_status VARCHAR(50) DEFAULT 'approved'"))
                    if "statement_type" not in comm_columns:
                        conn.execute(text("ALTER TABLE commitments ADD COLUMN statement_type VARCHAR(50) DEFAULT 'promise'"))
                    if "ai_explanation" not in comm_columns:
                        conn.execute(text("ALTER TABLE commitments ADD COLUMN ai_explanation TEXT"))
                    if "raw_quote" not in comm_columns:
                        conn.execute(text("ALTER TABLE commitments ADD COLUMN raw_quote TEXT"))
                    if "source_message_id" not in comm_columns:
                        conn.execute(text("ALTER TABLE commitments ADD COLUMN source_message_id VARCHAR(255)"))
                    conn.commit()
                    logger.info("Checked/migrated commitments table schema.")
            else:
                conn.execute(
                    text("ALTER TABLE users ADD COLUMN IF NOT EXISTS hashed_password VARCHAR(255)")
                )
                conn.execute(
                    text("ALTER TABLE commitments ADD COLUMN IF NOT EXISTS review_status VARCHAR(50) DEFAULT 'approved'")
                )
                conn.execute(
                    text("ALTER TABLE commitments ADD COLUMN IF NOT EXISTS statement_type VARCHAR(50) DEFAULT 'promise'")
                )
                conn.execute(
                    text("ALTER TABLE commitments ADD COLUMN IF NOT EXISTS ai_explanation TEXT")
                )
                conn.execute(
                    text("ALTER TABLE commitments ADD COLUMN IF NOT EXISTS raw_quote TEXT")
                )
                conn.execute(
                    text("ALTER TABLE commitments ADD COLUMN IF NOT EXISTS source_message_id VARCHAR(255)")
                )
                conn.commit()

        logger.info("Database tables initialized successfully.")
    except Exception as exc:
        logger.error(f"Failed to initialize database tables: {exc}")
        raise
