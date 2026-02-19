"""
EduNexus School — Attendance Model
"""

import uuid
from datetime import datetime
import enum

from sqlalchemy import Column, Date, DateTime, Enum as SAEnum, ForeignKey, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class AttendanceStatus(str, enum.Enum):
    PRESENT = "present"
    ABSENT = "absent"
    LATE = "late"
    EXCUSED = "excused"


class Attendance(Base):
    """
    Daily attendance record for a student in their section.
    Enforces one record per student per date.
    """
    __tablename__ = "attendance"
    __table_args__ = (
        UniqueConstraint("student_id", "date", name="uq_attendance_student_date"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    section_id = Column(UUID(as_uuid=True), ForeignKey("sections.id", ondelete="CASCADE"), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    status = Column(SAEnum(AttendanceStatus, name="attendance_status"), nullable=False)
    remarks = Column(String(255), nullable=True)
    marked_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # ── Relationships ──
    student = relationship("Student", back_populates="attendance_records")
    section = relationship("Section", back_populates="attendance_records")
    marker = relationship("User", foreign_keys=[marked_by])

    def __repr__(self) -> str:
        return f"<Attendance {self.student_id} {self.date} {self.status.value}>"
