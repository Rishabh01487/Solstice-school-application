"""
EduNexus School — Auth Schemas (login, token, register, user profile).
"""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, ConfigDict

from app.models.user import UserRole


# ── Request Schemas ──

class LoginRequest(BaseModel):
    """Login credentials."""
    email: EmailStr
    password: str = Field(..., min_length=6)

class FirebaseLoginRequest(BaseModel):
    """Firebase ID token login/registration."""
    id_token: str
    role_preference: Optional[UserRole] = None


class RefreshTokenRequest(BaseModel):
    """Refresh token for rotation."""
    refresh_token: str


class RegisterRequest(BaseModel):
    """Create a new user (admin-only)."""
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    role: UserRole
    phone: Optional[str] = Field(None, max_length=20)


class ChangePasswordRequest(BaseModel):
    """Change own password."""
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=128)


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8, max_length=128)


# ── Response Schemas ──

class TokenResponse(BaseModel):
    """JWT token pair response."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds


class UserResponse(BaseModel):
    """Public user profile."""
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: str
    first_name: str
    last_name: str
    role: UserRole
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    is_active: bool
    last_login: Optional[datetime] = None
    created_at: datetime


class UserUpdateRequest(BaseModel):
    """Update user profile."""
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    avatar_url: Optional[str] = None
    is_active: Optional[bool] = None
