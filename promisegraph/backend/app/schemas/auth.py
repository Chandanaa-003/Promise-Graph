from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from app.schemas.user import UserRead


class UserRegister(BaseModel):
    """Schema for new user registration."""
    email: EmailStr
    full_name: Optional[str] = Field(None, min_length=1, max_length=100)
    password: str = Field(..., min_length=8, max_length=128)


class UserLogin(BaseModel):
    """Schema for user login credentials."""
    email: EmailStr
    password: str
    remember_me: Optional[bool] = False


class TokenResponse(BaseModel):
    """Schema for authentication token response."""
    access_token: str
    token_type: str = "bearer"
    user: UserRead


class UserProfileUpdate(BaseModel):
    """Schema for updating user profile."""
    full_name: str = Field(..., min_length=1, max_length=100)


class ChangePasswordRequest(BaseModel):
    """Schema for changing account password."""
    current_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=8, max_length=128)


class MessageResponse(BaseModel):
    """Generic message response."""
    message: str
