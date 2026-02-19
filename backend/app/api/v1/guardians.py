"""
EduNexus School — Guardians API Routes
"""

from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User, UserRole
from app.models.guardian import Guardian
from app.models.student import StudentGuardian
from app.schemas.student import (
    GuardianCreateRequest, GuardianUpdateRequest, GuardianResponse, LinkGuardianRequest,
)
from app.schemas.common import PaginatedResponse
from app.api.deps import require_role
from app.utils.security import hash_password

router = APIRouter(prefix="/guardians", tags=["Guardians"])


@router.get("", response_model=PaginatedResponse[GuardianResponse])
async def list_guardians(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN])),
):
    """List all guardians."""
    query = select(Guardian, User.first_name, User.last_name, User.email, User.phone).join(
        User, Guardian.user_id == User.id
    )
    count_query = select(func.count(Guardian.id))

    if search:
        sf = f"%{search}%"
        query = query.where(User.first_name.ilike(sf) | User.last_name.ilike(sf) | User.email.ilike(sf))

    total_result = await db.execute(count_query)
    total = total_result.scalar()

    query = query.order_by(Guardian.created_at.desc()).offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    rows = result.all()

    items = []
    for guardian, fn, ln, email, phone in rows:
        resp = GuardianResponse.model_validate(guardian)
        resp.first_name = fn
        resp.last_name = ln
        resp.email = email
        resp.phone = phone
        items.append(resp)

    return PaginatedResponse(
        items=items, total=total, page=page, per_page=per_page,
        pages=(total + per_page - 1) // per_page,
    )


@router.post("", response_model=GuardianResponse, status_code=status.HTTP_201_CREATED)
async def create_guardian(
    body: GuardianCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN])),
):
    """Create guardian account."""
    existing = await db.execute(select(User).where(User.email == body.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Email already registered")

    user = User(
        email=body.email,
        password_hash=hash_password(body.password),
        role=UserRole.PARENT,
        first_name=body.first_name,
        last_name=body.last_name,
        phone=body.phone,
    )
    db.add(user)
    await db.flush()

    guardian = Guardian(
        user_id=user.id,
        occupation=body.occupation,
        relationship_type=body.relationship_type,
        address=body.address,
        workplace=body.workplace,
    )
    db.add(guardian)
    await db.flush()
    await db.refresh(guardian)

    resp = GuardianResponse.model_validate(guardian)
    resp.first_name = user.first_name
    resp.last_name = user.last_name
    resp.email = user.email
    resp.phone = user.phone
    return resp


@router.put("/{guardian_id}", response_model=GuardianResponse)
async def update_guardian(
    guardian_id: UUID,
    body: GuardianUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN])),
):
    """Update guardian details."""
    result = await db.execute(select(Guardian).where(Guardian.id == guardian_id))
    guardian = result.scalar_one_or_none()
    if not guardian:
        raise HTTPException(status_code=404, detail="Guardian not found")

    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(guardian, field, value)

    await db.flush()
    await db.refresh(guardian)
    return GuardianResponse.model_validate(guardian)


@router.post("/{guardian_id}/link")
async def link_guardian_to_student(
    guardian_id: UUID,
    body: LinkGuardianRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN])),
):
    """Link a guardian to a student."""
    link = StudentGuardian(
        student_id=body.student_id,
        guardian_id=guardian_id,
        is_primary=body.is_primary,
    )
    db.add(link)
    await db.flush()
    return {"message": "Guardian linked to student successfully"}
