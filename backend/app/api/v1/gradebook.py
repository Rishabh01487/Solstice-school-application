"""
EduNexus School — Gradebook API Routes
"""

from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User, UserRole
from app.models.student import Student
from app.models.gradebook import GradingScale, AssignmentCategory, Assignment, Grade
from app.models.classroom import SubjectTeacher
from app.models.academic import Subject, Term
from app.schemas.gradebook import *
from app.api.deps import get_current_user, require_role

router = APIRouter(prefix="/gradebook", tags=["Gradebook"])


# ──────────────── Grading Scales ────────────────
@router.get("/scales", response_model=list[GradingScaleResponse])
async def list_grading_scales(year_id: UUID = None, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    query = select(GradingScale)
    if year_id:
        query = query.where(GradingScale.academic_year_id == year_id)
    result = await db.execute(query)
    return [GradingScaleResponse.model_validate(s) for s in result.scalars().all()]

@router.post("/scales", response_model=GradingScaleResponse, status_code=201)
async def create_grading_scale(body: GradingScaleCreate, db: AsyncSession = Depends(get_db), _: User = Depends(require_role([UserRole.ADMIN]))):
    scale = GradingScale(**body.model_dump())
    db.add(scale)
    await db.flush()
    await db.refresh(scale)
    return GradingScaleResponse.model_validate(scale)


# ──────────────── Assignment Categories ────────────────
@router.get("/categories", response_model=list[AssignmentCategoryResponse])
async def list_categories(
    subject_teacher_id: UUID = None,
    term_id: UUID = None,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    query = select(AssignmentCategory)
    if subject_teacher_id:
        query = query.where(AssignmentCategory.subject_teacher_id == subject_teacher_id)
    if term_id:
        query = query.where(AssignmentCategory.term_id == term_id)
    result = await db.execute(query)
    return [AssignmentCategoryResponse.model_validate(c) for c in result.scalars().all()]

@router.post("/categories", response_model=AssignmentCategoryResponse, status_code=201)
async def create_category(body: AssignmentCategoryCreate, db: AsyncSession = Depends(get_db), _: User = Depends(require_role([UserRole.ADMIN, UserRole.TEACHER]))):
    cat = AssignmentCategory(**body.model_dump())
    db.add(cat)
    await db.flush()
    await db.refresh(cat)
    return AssignmentCategoryResponse.model_validate(cat)


# ──────────────── Assignments ────────────────
@router.get("/assignments", response_model=list[AssignmentResponse])
async def list_assignments(category_id: UUID = None, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    query = select(Assignment)
    if category_id:
        query = query.where(Assignment.category_id == category_id)
    result = await db.execute(query.order_by(Assignment.due_date.desc()))
    return [AssignmentResponse.model_validate(a) for a in result.scalars().all()]

@router.post("/assignments", response_model=AssignmentResponse, status_code=201)
async def create_assignment(body: AssignmentCreate, db: AsyncSession = Depends(get_db), _: User = Depends(require_role([UserRole.ADMIN, UserRole.TEACHER]))):
    assignment = Assignment(**body.model_dump())
    db.add(assignment)
    await db.flush()
    await db.refresh(assignment)
    return AssignmentResponse.model_validate(assignment)

@router.put("/assignments/{assignment_id}", response_model=AssignmentResponse)
async def update_assignment(assignment_id: UUID, body: AssignmentUpdate, db: AsyncSession = Depends(get_db), _: User = Depends(require_role([UserRole.ADMIN, UserRole.TEACHER]))):
    result = await db.execute(select(Assignment).where(Assignment.id == assignment_id))
    assignment = result.scalar_one_or_none()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(assignment, k, v)
    await db.flush()
    await db.refresh(assignment)
    return AssignmentResponse.model_validate(assignment)


# ──────────────── Grades ────────────────
@router.post("/grades/bulk", response_model=list[GradeResponse])
async def bulk_grade_entry(
    body: BulkGradeRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.TEACHER])),
):
    """Enter grades for multiple students on an assignment."""
    results = []
    for entry in body.entries:
        # Check existing grade
        existing = await db.execute(
            select(Grade).where(Grade.assignment_id == body.assignment_id, Grade.student_id == entry.student_id)
        )
        grade = existing.scalar_one_or_none()

        if grade:
            grade.score = entry.score
            grade.remarks = entry.remarks
            grade.graded_by = current_user.id
        else:
            grade = Grade(
                assignment_id=body.assignment_id,
                student_id=entry.student_id,
                score=entry.score,
                remarks=entry.remarks,
                graded_by=current_user.id,
            )
            db.add(grade)

        await db.flush()
        await db.refresh(grade)
        results.append(GradeResponse.model_validate(grade))

    return results


@router.get("/grades/student/{student_id}", response_model=list[GradeResponse])
async def get_student_grades(
    student_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Get all grades for a student."""
    result = await db.execute(
        select(Grade).where(Grade.student_id == student_id).order_by(Grade.created_at.desc())
    )
    return [GradeResponse.model_validate(g) for g in result.scalars().all()]


@router.get("/report-card/{student_id}", response_model=ReportCardResponse)
async def get_report_card(
    student_id: UUID,
    term_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Generate a report card summary for a student in a term."""
    # Get student info
    student_result = await db.execute(
        select(Student, User.first_name, User.last_name)
        .join(User, Student.user_id == User.id)
        .where(Student.id == student_id)
    )
    student_row = student_result.one_or_none()
    if not student_row:
        raise HTTPException(status_code=404, detail="Student not found")

    student, fn, ln = student_row

    # Get term info
    term_result = await db.execute(select(Term).where(Term.id == term_id))
    term = term_result.scalar_one_or_none()
    if not term:
        raise HTTPException(status_code=404, detail="Term not found")

    from app.models.academic import AcademicYear
    year_result = await db.execute(select(AcademicYear).where(AcademicYear.id == term.academic_year_id))
    year = year_result.scalar_one()

    # Get categories for this term in student's section
    categories_result = await db.execute(
        select(AssignmentCategory).where(AssignmentCategory.term_id == term_id)
    )
    categories = categories_result.scalars().all()

    subjects_data = {}
    for cat in categories:
        # Get subject info
        st_result = await db.execute(select(SubjectTeacher).where(SubjectTeacher.id == cat.subject_teacher_id))
        st = st_result.scalar_one_or_none()
        if not st:
            continue

        subj_result = await db.execute(select(Subject).where(Subject.id == st.subject_id))
        subj = subj_result.scalar_one()

        if subj.id not in subjects_data:
            subjects_data[subj.id] = {"name": subj.name, "code": subj.code, "scores": [], "max_scores": []}

        # Get assignments and grades for this category
        assignments_result = await db.execute(select(Assignment).where(Assignment.category_id == cat.id))
        for assignment in assignments_result.scalars().all():
            grade_result = await db.execute(
                select(Grade).where(Grade.assignment_id == assignment.id, Grade.student_id == student_id)
            )
            grade = grade_result.scalar_one_or_none()
            if grade:
                subjects_data[subj.id]["scores"].append(float(grade.score))
                subjects_data[subj.id]["max_scores"].append(float(assignment.max_score))

    subject_summaries = []
    for subj_id, data in subjects_data.items():
        if data["max_scores"]:
            avg = sum(data["scores"]) / sum(data["max_scores"]) * 100
        else:
            avg = 0
        subject_summaries.append(SubjectGradeSummary(
            subject_name=data["name"],
            subject_code=data["code"],
            average_score=round(avg, 2),
        ))

    overall = sum(s.average_score for s in subject_summaries) / len(subject_summaries) if subject_summaries else 0

    return ReportCardResponse(
        student_id=student_id,
        student_name=f"{fn} {ln}",
        admission_no=student.admission_no,
        term_name=term.name,
        academic_year=year.name,
        subjects=subject_summaries,
        overall_average=round(overall, 2),
    )
