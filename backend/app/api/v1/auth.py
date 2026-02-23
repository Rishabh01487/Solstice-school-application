"""
EduNexus School — Auth API Routes
Handles login, token refresh, logout, and user profile.
"""

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import RefreshToken, User
from app.schemas.auth import (
    ChangePasswordRequest,
    LoginRequest,
    RefreshTokenRequest,
    TokenResponse,
    UserResponse,
    FirebaseLoginRequest,
    RegisterRequest
)
from app.api.deps import get_current_user
from app.utils.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.utils.firebase import verify_firebase_token
from app.config import get_settings
from app.models.user import UserRole

settings = get_settings()
router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    """
    Authenticate with email + password.
    Returns JWT access + refresh token pair.
    """
    # Find user
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated. Contact administrator.",
        )

    # Generate tokens
    token_data = {
        "sub": str(user.id),
        "role": user.role.value,
        "email": user.email,
    }
    access_token = create_access_token(token_data)
    refresh_token, refresh_expires = create_refresh_token(token_data)

    # Store refresh token in DB
    db_refresh = RefreshToken(
        user_id=user.id,
        token=refresh_token,
        expires_at=refresh_expires,
    )
    db.add(db_refresh)

    # Update last login
    user.last_login = datetime.utcnow()

    await db.flush()

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.post("/register", response_model=TokenResponse)
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """Register a new user with email and password."""
    # Check if email exists
    result = await db.execute(select(User).where(User.email == body.email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already registered"
        )
        
    user = User(
        email=body.email,
        password_hash=hash_password(body.password),
        role=body.role,
        first_name=body.first_name,
        last_name=body.last_name,
        phone=body.phone,
        is_active=True
    )
    db.add(user)
    await db.flush()
    
    token_data = {
        "sub": str(user.id),
        "role": user.role.value,
        "email": user.email,
    }
    access_token = create_access_token(token_data)
    refresh_token, refresh_expires = create_refresh_token(token_data)

    db_refresh = RefreshToken(
        user_id=user.id,
        token=refresh_token,
        expires_at=refresh_expires,
    )
    db.add(db_refresh)
    user.last_login = datetime.utcnow()
    await db.flush()

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.post("/login/firebase", response_model=TokenResponse)
async def login_firebase(body: FirebaseLoginRequest, db: AsyncSession = Depends(get_db)):
    """
    Authenticate with Firebase ID token (Google Login).
    If the user does not exist, they are automatically registered.
    """
    try:
        decoded = verify_firebase_token(body.id_token)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Firebase token: {str(e)}"
        )
        
    email = decoded.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Token has no email")
        
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    
    if not user:
        # Auto-register new user
        name_parts = decoded.get("name", "New User").split(" ", 1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else ""
        
        user = User(
            email=email,
            password_hash=hash_password("oauth_placeholder"),
            role=body.role_preference or UserRole.STUDENT,
            first_name=first_name,
            last_name=last_name,
            avatar_url=decoded.get("picture"),
            is_active=True
        )
        db.add(user)
        await db.flush()
        
    # generate tokens
    token_data = {
        "sub": str(user.id),
        "role": user.role.value,
        "email": user.email,
    }
    access_token = create_access_token(token_data)
    refresh_token, refresh_expires = create_refresh_token(token_data)

    db.add(RefreshToken(
        user_id=user.id,
        token=refresh_token,
        expires_at=refresh_expires,
    ))
    user.last_login = datetime.utcnow()
    await db.flush()

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(body: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    """
    Rotate refresh token — invalidate old one, issue new pair.
    """
    try:
        payload = decode_token(body.refresh_token)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type",
        )

    # Find and delete old refresh token
    result = await db.execute(
        select(RefreshToken).where(RefreshToken.token == body.refresh_token)
    )
    old_token = result.scalar_one_or_none()
    if not old_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token not found or already used",
        )

    await db.delete(old_token)

    # Get user
    result = await db.execute(select(User).where(User.id == old_token.user_id))
    user = result.scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or deactivated",
        )

    # Issue new pair
    token_data = {
        "sub": str(user.id),
        "role": user.role.value,
        "email": user.email,
    }
    new_access = create_access_token(token_data)
    new_refresh, new_expires = create_refresh_token(token_data)

    db.add(RefreshToken(
        user_id=user.id,
        token=new_refresh,
        expires_at=new_expires,
    ))

    await db.flush()

    return TokenResponse(
        access_token=new_access,
        refresh_token=new_refresh,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.post("/logout")
async def logout(
    body: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Revoke a refresh token (logout)."""
    await db.execute(
        delete(RefreshToken).where(RefreshToken.token == body.refresh_token)
    )
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get the currently authenticated user's profile."""
    return current_user


@router.post("/change-password")
async def change_password(
    body: ChangePasswordRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Change own password."""
    if not verify_password(body.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )
    current_user.password_hash = hash_password(body.new_password)
    await db.flush()
    return {"message": "Password changed successfully"}
