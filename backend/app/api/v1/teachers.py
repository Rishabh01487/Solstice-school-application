"""
EduNexus School — Teachers API Routes
"""

from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User, UserRole
from app.models.teacher import Teacher
from app.models.classroom import SubjectTeacher, Section
from app.schemas.academic import TeacherCreate, TeacherUpdate, TeacherResponse
from app.schemas.common import PaginatedResponse
from app.api.deps import get_current_user, require_role
from app.utils.security import hash_password

router = APIRouter(prefix="/teachers", tags=["Teachers"])


@router.get("", response_model=PaginatedResponse[TeacherResponse])
async def list_teachers(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN])),
):
    """List all teachers."""
    query = select(Teacher, User.first_name, User.last_name, User.email).join(
        User, Teacher.user_id == User.id
    )
    count_query = select(func.count(Teacher.id))

    if search:
        sf = f"%{search}%"
        query = query.where(User.first_name.ilike(sf) | User.last_name.ilike(sf))

    total_result = await db.execute(count_query)
    total = total_result.scalar()

    query = query.order_by(Teacher.created_at.desc()).offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    rows = result.all()

    items = []
    for teacher, fn, ln, email in rows:
        resp = TeacherResponse.model_validate(teacher)
        resp.first_name = fn
        resp.last_name = ln
        resp.email = email
        items.append(resp)

    return PaginatedResponse(
        items=items, total=total, page=page, per_page=per_page,
        pages=(total + per_page - 1) // per_page,
    )


@router.post("", response_model=TeacherResponse, status_code=status.HTTP_201_CREATED)
async def create_teacher(
    body: TeacherCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN])),
):
    """Create a teacher (user account + teacher profile)."""
    existing = await db.execute(select(User).where(User.email == body.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Email already registered")

    user = User(
        email=body.email,
        password_hash=hash_password(body.password),
        role=UserRole.TEACHER,
        first_name=body.first_name,
        last_name=body.last_name,
        phone=body.phone,
    )
    db.add(user)
    await db.flush()

    teacher = Teacher(
        user_id=user.id,
        employee_id=body.employee_id,
        department=body.department,
        qualification=body.qualification,
        specialization=body.specialization,
        date_of_joining=body.date_of_joining,
        bio=body.bio,
    )
    db.add(teacher)
    await db.flush()
    await db.refresh(teacher)

    resp = TeacherResponse.model_validate(teacher)
    resp.first_name = user.first_name
    resp.last_name = user.last_name
    resp.email = user.email
    return resp


@router.get("/{teacher_id}", response_model=TeacherResponse)
async def get_teacher(
    teacher_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get teacher details."""
    result = await db.execute(
        select(Teacher, User.first_name, User.last_name, User.email)
        .join(User, Teacher.user_id == User.id)
        .where(Teacher.id == teacher_id)
    )
    row = result.one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail="Teacher not found")

    teacher, fn, ln, email = row
    resp = TeacherResponse.model_validate(teacher)
    resp.first_name = fn
    resp.last_name = ln
    resp.email = email
    return resp


@router.put("/{teacher_id}", response_model=TeacherResponse)
async def update_teacher(
    teacher_id: UUID,
    body: TeacherUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN])),
):
    """Update teacher details."""
    result = await db.execute(select(Teacher).where(Teacher.id == teacher_id))
    teacher = result.scalar_one_or_none()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(teacher, field, value)

    await db.flush()
    await db.refresh(teacher)
    return TeacherResponse.model_validate(teacher)
