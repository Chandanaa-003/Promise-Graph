import re
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.security import (
    create_access_token,
    get_current_user,
    get_password_hash,
    verify_password,
)
from app.models.user import User
from app.schemas.auth import (
    ChangePasswordRequest,
    MessageResponse,
    TokenResponse,
    UserLogin,
    UserProfileUpdate,
    UserRegister,
)
from app.schemas.user import UserRead

router = APIRouter(tags=["Authentication"])


def validate_password_strength(password: str) -> None:
    """Validate password requirements: at least 8 characters with letters and numbers."""
    if len(password) < 8:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Password must be at least 8 characters long.",
        )
    if not re.search(r"[A-Za-z]", password) or not re.search(r"\d", password):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Password must contain at least one letter and one number.",
        )


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(
    user_in: UserRegister,
    response: Response,
    db: Session = Depends(get_db),
) -> TokenResponse:
    """Register a new user account with email and password."""
    # Email normalization
    email = user_in.email.strip().lower()

    # Check for existing email
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email address already exists.",
        )

    # Validate password complexity
    validate_password_strength(user_in.password)

    # Create new user record
    new_user = User(
        email=email,
        full_name=user_in.full_name.strip() if user_in.full_name else None,
        hashed_password=get_password_hash(user_in.password),
        is_active=True,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Issue JWT token
    delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": new_user.id}, expires_delta=delta)

    # Set secure HttpOnly cookie
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=int(delta.total_seconds()),
        samesite="lax",
        secure=settings.ENVIRONMENT == "production",
        path="/",
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserRead.model_validate(new_user),
    )


@router.post("/login", response_model=TokenResponse)
def login(
    credentials: UserLogin,
    response: Response,
    db: Session = Depends(get_db),
) -> TokenResponse:
    """Authenticate with email and password to receive an access token."""
    email = credentials.email.strip().lower()
    user = db.query(User).filter(User.email == email).first()

    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account is inactive. Please contact support.",
        )

    # Determine token lifetime
    if credentials.remember_me:
        delta = timedelta(days=settings.ACCESS_TOKEN_EXPIRE_DAYS_REMEMBER)
    else:
        delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    access_token = create_access_token(data={"sub": user.id}, expires_delta=delta)

    # Set secure HttpOnly cookie
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=int(delta.total_seconds()),
        samesite="lax",
        secure=settings.ENVIRONMENT == "production",
        path="/",
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserRead.model_validate(user),
    )


@router.post("/logout", response_model=MessageResponse)
def logout(response: Response) -> MessageResponse:
    """Log out the current user and invalidate the HttpOnly cookie."""
    response.delete_cookie(
        key="access_token",
        path="/",
        samesite="lax",
    )
    return MessageResponse(message="Successfully logged out.")


@router.get("/me", response_model=UserRead)
def get_me(current_user: User = Depends(get_current_user)) -> UserRead:
    """Retrieve profile of the currently authenticated user."""
    return UserRead.model_validate(current_user)


@router.patch("/profile", response_model=UserRead)
def update_profile(
    profile_in: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserRead:
    """Update user profile name."""
    current_user.full_name = profile_in.full_name.strip()
    db.commit()
    db.refresh(current_user)
    return UserRead.model_validate(current_user)


@router.post("/change-password", response_model=MessageResponse)
def change_password(
    pwd_in: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MessageResponse:
    """Change account password after verifying the existing password."""
    if not verify_password(pwd_in.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect.",
        )

    validate_password_strength(pwd_in.new_password)

    current_user.hashed_password = get_password_hash(pwd_in.new_password)
    db.commit()

    return MessageResponse(message="Password changed successfully.")
