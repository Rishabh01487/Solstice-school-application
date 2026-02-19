"""
EduNexus School — Reports API Routes (Analytics + PDF/Excel exports)
"""

from datetime import date
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from sqlalchemy import func, select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User, UserRole
from app.models.student import Student, StudentStatus
from app.models.teacher import Teacher
from app.models.attendance import Attendance, AttendanceStatus
from app.models.finance import Invoice, InvoiceStatus, Payment
from app.models.academic import AcademicYear, Term, Subject
from app.models.classroom import Section, SubjectTeacher, Class
from app.models.gradebook import AssignmentCategory, Assignment, Grade
from app.api.deps import get_current_user, require_role
from app.utils.pdf_generator import (
    generate_report_card_pdf,
    generate_attendance_report_pdf,
    generate_student_list_pdf,
)
from app.utils.excel_generator import (
    generate_attendance_excel,
    generate_student_list_excel,
    generate_grades_excel,
)

router = APIRouter(prefix="/reports", tags=["Reports"])


# ══════════════════════════════════════════
#  DASHBOARD ANALYTICS
# ══════════════════════════════════════════

@router.get("/analytics")
async def dashboard_analytics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN])),
):
    """
    Returns comprehensive analytics data for the admin dashboard.
    """
    # Student counts
    total_students = (await db.execute(select(func.count(Student.id)))).scalar() or 0
    active_students = (await db.execute(
        select(func.count(Student.id)).where(Student.status == StudentStatus.ACTIVE)
    )).scalar() or 0

    # Teacher count
    total_teachers = (await db.execute(select(func.count(Teacher.id)))).scalar() or 0

    # Attendance today
    today = date.today()
    today_present = (await db.execute(
        select(func.count(Attendance.id)).where(
            and_(Attendance.date == today, Attendance.status == AttendanceStatus.PRESENT)
        )
    )).scalar() or 0
    today_absent = (await db.execute(
        select(func.count(Attendance.id)).where(
            and_(Attendance.date == today, Attendance.status == AttendanceStatus.ABSENT)
        )
    )).scalar() or 0
    today_late = (await db.execute(
        select(func.count(Attendance.id)).where(
            and_(Attendance.date == today, Attendance.status == AttendanceStatus.LATE)
        )
    )).scalar() or 0

    # Finance
    total_revenue = float((await db.execute(select(func.sum(Payment.amount)))).scalar() or 0)
    pending_fees = float((await db.execute(
        select(func.sum(Invoice.amount)).where(Invoice.status == InvoiceStatus.PENDING)
    )).scalar() or 0)
    overdue_count = (await db.execute(
        select(func.count(Invoice.id)).where(Invoice.status == InvoiceStatus.OVERDUE)
    )).scalar() or 0

    # Class & section counts
    total_classes = (await db.execute(select(func.count(Class.id)))).scalar() or 0
    total_sections = (await db.execute(select(func.count(Section.id)))).scalar() or 0

    # Student status breakdown
    status_counts = {}
    for status in StudentStatus:
        count = (await db.execute(
            select(func.count(Student.id)).where(Student.status == status)
        )).scalar() or 0
        status_counts[status.value] = count

    return {
        "students": {
            "total": total_students,
            "active": active_students,
            "by_status": status_counts,
        },
        "teachers": {"total": total_teachers},
        "classes": {"total": total_classes, "sections": total_sections},
        "attendance_today": {
            "present": today_present,
            "absent": today_absent,
            "late": today_late,
        },
        "finance": {
            "total_revenue": total_revenue,
            "pending_fees": pending_fees,
            "overdue_invoices": overdue_count,
        },
    }


# ══════════════════════════════════════════
#  REPORT CARD PDF
# ══════════════════════════════════════════

@router.get("/report-card/{student_id}/pdf")
async def download_report_card_pdf(
    student_id: UUID,
    term_id: UUID = Query(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Download a student's report card as PDF."""
    # Get student
    result = await db.execute(
        select(Student, User.first_name, User.last_name)
        .join(User, Student.user_id == User.id)
        .where(Student.id == student_id)
    )
    row = result.one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail="Student not found")
    student, fn, ln = row

    # Get term + year
    term = (await db.execute(select(Term).where(Term.id == term_id))).scalar_one_or_none()
    if not term:
        raise HTTPException(status_code=404, detail="Term not found")
    year = (await db.execute(select(AcademicYear).where(AcademicYear.id == term.academic_year_id))).scalar_one()

    # Build subject grades
    categories = (await db.execute(
        select(AssignmentCategory).where(AssignmentCategory.term_id == term_id)
    )).scalars().all()

    subjects_data = {}
    for cat in categories:
        st = (await db.execute(select(SubjectTeacher).where(SubjectTeacher.id == cat.subject_teacher_id))).scalar_one_or_none()
        if not st:
            continue
        subj = (await db.execute(select(Subject).where(Subject.id == st.subject_id))).scalar_one()
        if subj.id not in subjects_data:
            subjects_data[subj.id] = {"subject_name": subj.name, "subject_code": subj.code, "scores": [], "max_scores": []}

        assignments = (await db.execute(select(Assignment).where(Assignment.category_id == cat.id))).scalars().all()
        for assignment in assignments:
            grade = (await db.execute(
                select(Grade).where(and_(Grade.assignment_id == assignment.id, Grade.student_id == student_id))
            )).scalar_one_or_none()
            if grade:
                subjects_data[subj.id]["scores"].append(float(grade.score))
                subjects_data[subj.id]["max_scores"].append(float(assignment.max_score))

    subjects = []
    for data in subjects_data.values():
        avg = (sum(data["scores"]) / sum(data["max_scores"]) * 100) if data["max_scores"] else 0
        letter = _score_to_letter(avg)
        gpa = _score_to_gpa(avg)
        subjects.append({
            "subject_name": data["subject_name"],
            "subject_code": data["subject_code"],
            "average_score": round(avg, 1),
            "letter_grade": letter,
            "gpa": gpa,
        })

    overall = sum(s["average_score"] for s in subjects) / len(subjects) if subjects else 0
    overall_gpa = round(sum(s["gpa"] for s in subjects if s["gpa"]) / len(subjects), 2) if subjects else None

    pdf_bytes = generate_report_card_pdf({
        "student_name": f"{fn} {ln}",
        "admission_no": student.admission_no,
        "academic_year": year.name,
        "term_name": term.name,
        "subjects": subjects,
        "overall_average": round(overall, 1),
        "overall_gpa": overall_gpa,
    })

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="report_card_{student.admission_no}_{term.name}.pdf"'},
    )


# ══════════════════════════════════════════
#  ATTENDANCE REPORT (PDF / Excel)
# ══════════════════════════════════════════

@router.get("/attendance")
async def download_attendance_report(
    section_id: UUID = Query(...),
    start_date: date = Query(...),
    end_date: date = Query(...),
    format: str = Query("pdf", regex="^(pdf|excel)$"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.TEACHER])),
):
    """Download attendance report for a section (PDF or Excel)."""
    # Get section info
    section = (await db.execute(select(Section).where(Section.id == section_id))).scalar_one_or_none()
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")

    parent_class = (await db.execute(select(Class).where(Class.id == section.class_id))).scalar_one()
    section_name = f"{parent_class.name} - Section {section.name}"

    # Get students in section
    students_result = await db.execute(
        select(Student, User.first_name, User.last_name)
        .join(User, Student.user_id == User.id)
        .where(Student.current_section_id == section_id)
        .order_by(User.last_name)
    )
    students = students_result.all()

    rows = []
    for student, fn, ln in students:
        # Count attendance statuses
        counts = {}
        for status in AttendanceStatus:
            count = (await db.execute(
                select(func.count(Attendance.id)).where(
                    and_(
                        Attendance.student_id == student.id,
                        Attendance.date >= start_date,
                        Attendance.date <= end_date,
                        Attendance.status == status,
                    )
                )
            )).scalar() or 0
            counts[status.value] = count

        total = sum(counts.values())
        pct = ((counts["present"] + counts["late"]) / total * 100) if total > 0 else 0

        rows.append({
            "student_name": f"{fn} {ln}",
            "admission_no": student.admission_no,
            "present": counts["present"],
            "absent": counts["absent"],
            "late": counts["late"],
            "excused": counts["excused"],
            "total": total,
            "percentage": round(pct, 1),
        })

    report_data = {
        "title": f"Attendance Report — {section_name}",
        "section_name": section_name,
        "start_date": start_date.strftime("%B %d, %Y"),
        "end_date": end_date.strftime("%B %d, %Y"),
        "rows": rows,
    }

    if format == "excel":
        content = generate_attendance_excel(report_data)
        return Response(
            content=content,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f'attachment; filename="attendance_report_{section_name}.xlsx"'},
        )
    else:
        content = generate_attendance_report_pdf(report_data)
        return Response(
            content=content,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="attendance_report_{section_name}.pdf"'},
        )


# ══════════════════════════════════════════
#  STUDENT LIST EXPORT (PDF / Excel)
# ══════════════════════════════════════════

@router.get("/students")
async def download_student_list(
    status_filter: Optional[StudentStatus] = Query(None, alias="status"),
    section_id: Optional[UUID] = None,
    format: str = Query("pdf", regex="^(pdf|excel)$"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN])),
):
    """Export student list as PDF or Excel."""
    query = (
        select(Student, User.first_name, User.last_name, User.email)
        .join(User, Student.user_id == User.id)
    )
    if status_filter:
        query = query.where(Student.status == status_filter)
    if section_id:
        query = query.where(Student.current_section_id == section_id)
    query = query.order_by(User.last_name)

    result = await db.execute(query)
    rows = result.all()

    students_list = []
    for student, fn, ln, email in rows:
        students_list.append({
            "name": f"{fn} {ln}",
            "admission_no": student.admission_no,
            "gender": student.gender.value,
            "status": student.status.value.capitalize(),
            "email": email,
            "enrollment_date": student.enrollment_date.strftime("%Y-%m-%d"),
        })

    report_data = {
        "title": "Student Directory",
        "students": students_list,
    }

    if format == "excel":
        content = generate_student_list_excel(report_data)
        return Response(
            content=content,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": 'attachment; filename="student_list.xlsx"'},
        )
    else:
        content = generate_student_list_pdf(report_data)
        return Response(
            content=content,
            media_type="application/pdf",
            headers={"Content-Disposition": 'attachment; filename="student_list.pdf"'},
        )


# ══════════════════════════════════════════
#  GRADES EXPORT (Excel)
# ══════════════════════════════════════════

@router.get("/grades/export")
async def download_grades_report(
    section_id: UUID = Query(...),
    term_id: UUID = Query(...),
    format: str = Query("excel", regex="^(excel)$"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.TEACHER])),
):
    """Export grades for a section in a term as Excel."""
    # Get term info
    term = (await db.execute(select(Term).where(Term.id == term_id))).scalar_one_or_none()
    if not term:
        raise HTTPException(status_code=404, detail="Term not found")

    # Get students
    students_result = await db.execute(
        select(Student, User.first_name, User.last_name)
        .join(User, Student.user_id == User.id)
        .where(Student.current_section_id == section_id)
        .order_by(User.last_name)
    )
    students = students_result.all()

    # Get subject-teacher assignments for this section
    st_result = await db.execute(select(SubjectTeacher).where(SubjectTeacher.section_id == section_id))
    subject_teachers = st_result.scalars().all()

    subjects = []
    for st in subject_teachers:
        subj = (await db.execute(select(Subject).where(Subject.id == st.subject_id))).scalar_one()
        subjects.append({"id": st.id, "name": subj.name})

    rows = []
    for student, fn, ln in students:
        subject_scores = []
        for subj_info in subjects:
            # Get categories for this subject-teacher and term
            cats = (await db.execute(
                select(AssignmentCategory).where(
                    and_(AssignmentCategory.subject_teacher_id == subj_info["id"], AssignmentCategory.term_id == term_id)
                )
            )).scalars().all()

            total_score = 0
            total_max = 0
            for cat in cats:
                assignments = (await db.execute(select(Assignment).where(Assignment.category_id == cat.id))).scalars().all()
                for assignment in assignments:
                    grade = (await db.execute(
                        select(Grade).where(and_(Grade.assignment_id == assignment.id, Grade.student_id == student.id))
                    )).scalar_one_or_none()
                    if grade:
                        total_score += float(grade.score)
                        total_max += float(assignment.max_score)

            pct = (total_score / total_max * 100) if total_max > 0 else 0
            subject_scores.append({"name": subj_info["name"], "score": round(pct, 1)})

        avg = sum(s["score"] for s in subject_scores) / len(subject_scores) if subject_scores else 0
        rows.append({
            "student_name": f"{fn} {ln}",
            "admission_no": student.admission_no,
            "subjects": subject_scores,
            "overall_grade": _score_to_letter(avg),
        })

    content = generate_grades_excel({
        "title": "Grades Report",
        "term_name": term.name,
        "rows": rows,
    })

    return Response(
        content=content,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="grades_{term.name}.xlsx"'},
    )


# ══════════════════════════════════════════
#  HELPER FUNCTIONS
# ══════════════════════════════════════════

def _score_to_letter(score: float) -> str:
    """Convert a percentage score to a letter grade."""
    if score >= 97: return "A+"
    elif score >= 93: return "A"
    elif score >= 90: return "A-"
    elif score >= 87: return "B+"
    elif score >= 83: return "B"
    elif score >= 80: return "B-"
    elif score >= 77: return "C+"
    elif score >= 73: return "C"
    elif score >= 70: return "C-"
    elif score >= 60: return "D"
    else: return "F"


def _score_to_gpa(score: float) -> float:
    """Convert a percentage score to GPA."""
    if score >= 93: return 4.0
    elif score >= 90: return 3.7
    elif score >= 87: return 3.3
    elif score >= 83: return 3.0
    elif score >= 80: return 2.7
    elif score >= 77: return 2.3
    elif score >= 73: return 2.0
    elif score >= 70: return 1.7
    elif score >= 60: return 1.0
    else: return 0.0
