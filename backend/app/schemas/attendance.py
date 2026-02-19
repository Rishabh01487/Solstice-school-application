"""
EduNexus School — Attendance Schemas
"""

from datetime import date, datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.models.attendance import AttendanceStatus


class AttendanceEntry(BaseModel):
    """Single student attendance entry for bulk marking."""
    student_id: UUID
    status: AttendanceStatus
    remarks: Optional[str] = None


class BulkAttendanceRequest(BaseModel):
    """Mark attendance for multiple students at once."""
    section_id: UUID
    date: date
    entries: List[AttendanceEntry]


class AttendanceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    student_id: UUID
    section_id: UUID
    date: date
    status: AttendanceStatus
    remarks: Optional[str] = None
    marked_by: UUID
    created_at: datetime

    # Joined
    student_name: Optional[str] = None


class AttendanceSummary(BaseModel):
    """Attendance summary for a student or section."""
    total_days: int
    present: int
    absent: int
    late: int
    excused: int
    attendance_percentage: float
