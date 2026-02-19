"""
EduNexus School — Academics API Routes (Years, Terms, Subjects, Classes, Sections, Schedules)
"""

from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User, UserRole
from app.models.academic import AcademicYear, Term, Subject
from app.models.classroom import Class, Section, SubjectTeacher, Schedule
from app.schemas.academic import *
from app.api.deps import get_current_user, require_role

router = APIRouter(prefix="/academics", tags=["Academics"])


# ──────────────── Academic Years ────────────────
@router.get("/years", response_model=list[AcademicYearResponse])
async def list_academic_years(db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    result = await db.execute(select(AcademicYear).order_by(AcademicYear.start_date.desc()))
    return [AcademicYearResponse.model_validate(y) for y in result.scalars().all()]

@router.post("/years", response_model=AcademicYearResponse, status_code=201)
async def create_academic_year(body: AcademicYearCreate, db: AsyncSession = Depends(get_db), _: User = Depends(require_role([UserRole.ADMIN]))):
    year = AcademicYear(**body.model_dump())
    db.add(year)
    await db.flush()
    await db.refresh(year)
    return AcademicYearResponse.model_validate(year)

@router.put("/years/{year_id}", response_model=AcademicYearResponse)
async def update_academic_year(year_id: UUID, body: AcademicYearUpdate, db: AsyncSession = Depends(get_db), _: User = Depends(require_role([UserRole.ADMIN]))):
    result = await db.execute(select(AcademicYear).where(AcademicYear.id == year_id))
    year = result.scalar_one_or_none()
    if not year:
        raise HTTPException(status_code=404, detail="Academic year not found")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(year, k, v)
    await db.flush()
    await db.refresh(year)
    return AcademicYearResponse.model_validate(year)


# ──────────────── Terms ────────────────
@router.get("/terms", response_model=list[TermResponse])
async def list_terms(year_id: UUID = None, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    query = select(Term)
    if year_id:
        query = query.where(Term.academic_year_id == year_id)
    result = await db.execute(query.order_by(Term.start_date))
    return [TermResponse.model_validate(t) for t in result.scalars().all()]

@router.post("/terms", response_model=TermResponse, status_code=201)
async def create_term(body: TermCreate, db: AsyncSession = Depends(get_db), _: User = Depends(require_role([UserRole.ADMIN]))):
    term = Term(**body.model_dump())
    db.add(term)
    await db.flush()
    await db.refresh(term)
    return TermResponse.model_validate(term)


# ──────────────── Subjects ────────────────
@router.get("/subjects", response_model=list[SubjectResponse])
async def list_subjects(db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    result = await db.execute(select(Subject).order_by(Subject.name))
    return [SubjectResponse.model_validate(s) for s in result.scalars().all()]

@router.post("/subjects", response_model=SubjectResponse, status_code=201)
async def create_subject(body: SubjectCreate, db: AsyncSession = Depends(get_db), _: User = Depends(require_role([UserRole.ADMIN]))):
    subject = Subject(**body.model_dump())
    db.add(subject)
    await db.flush()
    await db.refresh(subject)
    return SubjectResponse.model_validate(subject)

@router.put("/subjects/{subject_id}", response_model=SubjectResponse)
async def update_subject(subject_id: UUID, body: SubjectUpdate, db: AsyncSession = Depends(get_db), _: User = Depends(require_role([UserRole.ADMIN]))):
    result = await db.execute(select(Subject).where(Subject.id == subject_id))
    subject = result.scalar_one_or_none()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(subject, k, v)
    await db.flush()
    await db.refresh(subject)
    return SubjectResponse.model_validate(subject)


# ──────────────── Classes ────────────────
@router.get("/classes", response_model=list[ClassResponse])
async def list_classes(year_id: UUID = None, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    query = select(Class)
    if year_id:
        query = query.where(Class.academic_year_id == year_id)
    result = await db.execute(query.order_by(Class.grade_level))
    return [ClassResponse.model_validate(c) for c in result.scalars().all()]

@router.post("/classes", response_model=ClassResponse, status_code=201)
async def create_class(body: ClassCreate, db: AsyncSession = Depends(get_db), _: User = Depends(require_role([UserRole.ADMIN]))):
    cls = Class(**body.model_dump())
    db.add(cls)
    await db.flush()
    await db.refresh(cls)
    return ClassResponse.model_validate(cls)


# ──────────────── Sections ────────────────
@router.get("/sections", response_model=list[SectionResponse])
async def list_sections(class_id: UUID = None, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    query = select(Section)
    if class_id:
        query = query.where(Section.class_id == class_id)
    result = await db.execute(query.order_by(Section.name))
    return [SectionResponse.model_validate(s) for s in result.scalars().all()]

@router.post("/sections", response_model=SectionResponse, status_code=201)
async def create_section(body: SectionCreate, db: AsyncSession = Depends(get_db), _: User = Depends(require_role([UserRole.ADMIN]))):
    section = Section(**body.model_dump())
    db.add(section)
    await db.flush()
    await db.refresh(section)
    return SectionResponse.model_validate(section)

@router.put("/sections/{section_id}", response_model=SectionResponse)
async def update_section(section_id: UUID, body: SectionUpdate, db: AsyncSession = Depends(get_db), _: User = Depends(require_role([UserRole.ADMIN]))):
    result = await db.execute(select(Section).where(Section.id == section_id))
    section = result.scalar_one_or_none()
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(section, k, v)
    await db.flush()
    await db.refresh(section)
    return SectionResponse.model_validate(section)


# ──────────────── Subject-Teacher Assignments ────────────────
@router.post("/subject-teachers", response_model=SubjectTeacherResponse, status_code=201)
async def assign_subject_teacher(body: SubjectTeacherCreate, db: AsyncSession = Depends(get_db), _: User = Depends(require_role([UserRole.ADMIN]))):
    st = SubjectTeacher(**body.model_dump())
    db.add(st)
    await db.flush()
    await db.refresh(st)
    return SubjectTeacherResponse.model_validate(st)

@router.get("/subject-teachers", response_model=list[SubjectTeacherResponse])
async def list_subject_teachers(section_id: UUID = None, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    query = select(SubjectTeacher)
    if section_id:
        query = query.where(SubjectTeacher.section_id == section_id)
    result = await db.execute(query)
    return [SubjectTeacherResponse.model_validate(st) for st in result.scalars().all()]


# ──────────────── Schedules ────────────────
@router.post("/schedules", response_model=ScheduleResponse, status_code=201)
async def create_schedule(body: ScheduleCreate, db: AsyncSession = Depends(get_db), _: User = Depends(require_role([UserRole.ADMIN]))):
    schedule = Schedule(**body.model_dump())
    db.add(schedule)
    await db.flush()
    await db.refresh(schedule)
    return ScheduleResponse.model_validate(schedule)

@router.get("/schedules", response_model=list[ScheduleResponse])
async def list_schedules(section_id: UUID = None, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    query = select(Schedule)
    if section_id:
        query = query.where(Schedule.section_id == section_id)
    result = await db.execute(query.order_by(Schedule.day_of_week, Schedule.start_time))
    return [ScheduleResponse.model_validate(s) for s in result.scalars().all()]

@router.put("/schedules/{schedule_id}", response_model=ScheduleResponse)
async def update_schedule(schedule_id: UUID, body: ScheduleUpdate, db: AsyncSession = Depends(get_db), _: User = Depends(require_role([UserRole.ADMIN]))):
    result = await db.execute(select(Schedule).where(Schedule.id == schedule_id))
    schedule = result.scalar_one_or_none()
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(schedule, k, v)
    await db.flush()
    await db.refresh(schedule)
    return ScheduleResponse.model_validate(schedule)

@router.delete("/schedules/{schedule_id}")
async def delete_schedule(schedule_id: UUID, db: AsyncSession = Depends(get_db), _: User = Depends(require_role([UserRole.ADMIN]))):
    result = await db.execute(select(Schedule).where(Schedule.id == schedule_id))
    schedule = result.scalar_one_or_none()
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    await db.delete(schedule)
    return {"message": "Schedule deleted"}
