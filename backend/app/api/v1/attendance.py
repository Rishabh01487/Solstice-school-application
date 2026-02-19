"""
EduNexus School — Attendance API Routes
"""

from datetime import date
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User, UserRole
from app.models.student import Student
from app.models.attendance import Attendance, AttendanceStatus
from app.schemas.attendance import (
    AttendanceResponse, BulkAttendanceRequest, AttendanceSummary,
)
from app.api.deps import get_current_user, require_role

router = APIRouter(prefix="/attendance", tags=["Attendance"])


@router.post("/bulk", response_model=list[AttendanceResponse])
async def mark_bulk_attendance(
    body: BulkAttendanceRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.TEACHER])),
):
    """Mark attendance for an entire section on a given date."""
    results = []
    for entry in body.entries:
        # Upsert: check if record exists
        existing = await db.execute(
            select(Attendance).where(
                and_(Attendance.student_id == entry.student_id, Attendance.date == body.date)
            )
        )
        record = existing.scalar_one_or_none()

        if record:
            record.status = entry.status
            record.remarks = entry.remarks
            record.marked_by = current_user.id
        else:
            record = Attendance(
                student_id=entry.student_id,
                section_id=body.section_id,
                date=body.date,
                status=entry.status,
                remarks=entry.remarks,
                marked_by=current_user.id,
            )
            db.add(record)

        await db.flush()
        await db.refresh(record)
        results.append(AttendanceResponse.model_validate(record))

    return results


@router.get("/section/{section_id}", response_model=list[AttendanceResponse])
async def get_section_attendance(
    section_id: UUID,
    attendance_date: date = Query(..., alias="date"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.TEACHER])),
):
    """Get attendance records for a section on a specific date."""
    result = await db.execute(
        select(Attendance, User.first_name, User.last_name)
        .join(Student, Attendance.student_id == Student.id)
        .join(User, Student.user_id == User.id)
        .where(and_(Attendance.section_id == section_id, Attendance.date == attendance_date))
    )
    rows = result.all()

    items = []
    for att, fn, ln in rows:
        resp = AttendanceResponse.model_validate(att)
        resp.student_name = f"{fn} {ln}"
        items.append(resp)
    return items


@router.get("/student/{student_id}/summary", response_model=AttendanceSummary)
async def get_student_attendance_summary(
    student_id: UUID,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get attendance summary for a specific student."""
    query = select(Attendance.status, func.count()).where(
        Attendance.student_id == student_id
    ).group_by(Attendance.status)

    if start_date:
        query = query.where(Attendance.date >= start_date)
    if end_date:
        query = query.where(Attendance.date <= end_date)

    result = await db.execute(query)
    counts = {row[0]: row[1] for row in result.all()}

    present = counts.get(AttendanceStatus.PRESENT, 0)
    absent = counts.get(AttendanceStatus.ABSENT, 0)
    late = counts.get(AttendanceStatus.LATE, 0)
    excused = counts.get(AttendanceStatus.EXCUSED, 0)
    total = present + absent + late + excused

    return AttendanceSummary(
        total_days=total,
        present=present,
        absent=absent,
        late=late,
        excused=excused,
        attendance_percentage=round((present + late) / total * 100, 2) if total > 0 else 0,
    )
