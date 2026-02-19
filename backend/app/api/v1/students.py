"""
EduNexus School — Students API Routes
"""

from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User, UserRole
from app.models.student import Student, StudentGuardian, StudentStatus
from app.schemas.student import (
    StudentCreateRequest, StudentUpdateRequest, StudentResponse,
    StudentStatusUpdate, GuardianCreateRequest,
)
from app.schemas.common import PaginatedResponse
from app.api.deps import get_current_user, require_role
from app.utils.security import hash_password

router = APIRouter(prefix="/students", tags=["Students"])


@router.get("", response_model=PaginatedResponse[StudentResponse])
async def list_students(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    section_id: Optional[UUID] = None,
    student_status: Optional[StudentStatus] = Query(None, alias="status"),
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.TEACHER])),
):
    """List students with filters and pagination."""
    query = select(Student, User.first_name, User.last_name, User.email).join(User, Student.user_id == User.id)
    count_query = select(func.count(Student.id))

    if section_id:
        query = query.where(Student.current_section_id == section_id)
        count_query = count_query.where(Student.current_section_id == section_id)
    if student_status:
        query = query.where(Student.status == student_status)
        count_query = count_query.where(Student.status == student_status)
    if search:
        sf = f"%{search}%"
        search_cond = (
            User.first_name.ilike(sf) |
            User.last_name.ilike(sf) |
            Student.admission_no.ilike(sf)
        )
        query = query.where(search_cond)
        count_query = count_query.join(User, Student.user_id == User.id).where(search_cond)

    total_result = await db.execute(count_query)
    total = total_result.scalar()

    query = query.order_by(Student.created_at.desc()).offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    rows = result.all()

    items = []
    for student, first_name, last_name, email in rows:
        resp = StudentResponse.model_validate(student)
        resp.first_name = first_name
        resp.last_name = last_name
        resp.email = email
        items.append(resp)

    return PaginatedResponse(
        items=items, total=total, page=page, per_page=per_page,
        pages=(total + per_page - 1) // per_page,
    )


@router.post("", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
async def create_student(
    body: StudentCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN])),
):
    """Admit a new student (creates user account + student profile)."""
    # Check email
    existing = await db.execute(select(User).where(User.email == body.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Email already registered")

    # Check admission number
    existing_adm = await db.execute(select(Student).where(Student.admission_no == body.admission_no))
    if existing_adm.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Admission number already exists")

    # Create user
    user = User(
        email=body.email,
        password_hash=hash_password(body.password),
        role=UserRole.STUDENT,
        first_name=body.first_name,
        last_name=body.last_name,
        phone=body.phone,
    )
    db.add(user)
    await db.flush()

    # Create student profile
    student = Student(
        user_id=user.id,
        admission_no=body.admission_no,
        date_of_birth=body.date_of_birth,
        gender=body.gender,
        blood_group=body.blood_group,
        address=body.address,
        city=body.city,
        state=body.state,
        zip_code=body.zip_code,
        enrollment_date=body.enrollment_date,
        current_section_id=body.section_id,
        medical_notes=body.medical_notes,
        emergency_contact=body.emergency_contact,
        emergency_phone=body.emergency_phone,
    )
    db.add(student)
    await db.flush()
    await db.refresh(student)

    resp = StudentResponse.model_validate(student)
    resp.first_name = user.first_name
    resp.last_name = user.last_name
    resp.email = user.email
    return resp


@router.get("/{student_id}", response_model=StudentResponse)
async def get_student(
    student_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get student by ID."""
    result = await db.execute(
        select(Student, User.first_name, User.last_name, User.email)
        .join(User, Student.user_id == User.id)
        .where(Student.id == student_id)
    )
    row = result.one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail="Student not found")

    student, first_name, last_name, email = row
    resp = StudentResponse.model_validate(student)
    resp.first_name = first_name
    resp.last_name = last_name
    resp.email = email
    return resp


@router.put("/{student_id}", response_model=StudentResponse)
async def update_student(
    student_id: UUID,
    body: StudentUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN])),
):
    """Update student details."""
    result = await db.execute(select(Student).where(Student.id == student_id))
    student = result.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(student, field, value)

    await db.flush()
    await db.refresh(student)
    return StudentResponse.model_validate(student)


@router.patch("/{student_id}/status")
async def update_student_status(
    student_id: UUID,
    body: StudentStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN])),
):
    """Change student lifecycle status (transfer, graduate, etc.)."""
    result = await db.execute(select(Student).where(Student.id == student_id))
    student = result.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    student.status = body.status
    await db.flush()
    return {"message": f"Student status updated to {body.status.value}"}
