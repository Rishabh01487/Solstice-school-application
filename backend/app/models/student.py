"""
EduNexus School — Student Model
"""

import uuid
from datetime import datetime
import enum

from sqlalchemy import (
    Boolean, Column, Date, DateTime, Enum as SAEnum, ForeignKey, String, Text
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class Gender(str, enum.Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"


class StudentStatus(str, enum.Enum):
    ACTIVE = "active"
    TRANSFERRED = "transferred"
    GRADUATED = "graduated"
    SUSPENDED = "suspended"
    WITHDRAWN = "withdrawn"


class Student(Base):
    """
    Student profile linked to a User account.
    Contains demographic, enrollment, and health information.
    """
    __tablename__ = "students"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    admission_no = Column(String(50), unique=True, nullable=False, index=True)

    date_of_birth = Column(Date, nullable=False)
    gender = Column(SAEnum(Gender, name="gender"), nullable=False)
    blood_group = Column(String(10), nullable=True)

    address = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    zip_code = Column(String(20), nullable=True)

    enrollment_date = Column(Date, nullable=False)
    status = Column(
        SAEnum(StudentStatus, name="student_status"),
        default=StudentStatus.ACTIVE,
        nullable=False,
        index=True,
    )
    current_section_id = Column(UUID(as_uuid=True), ForeignKey("sections.id"), nullable=True)

    photo_url = Column(String(512), nullable=True)
    medical_notes = Column(Text, nullable=True)
    emergency_contact = Column(String(100), nullable=True)
    emergency_phone = Column(String(20), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # ── Relationships ──
    user = relationship("User", back_populates="student_profile")
    current_section = relationship("Section", foreign_keys=[current_section_id])
    guardian_links = relationship("StudentGuardian", back_populates="student", cascade="all, delete-orphan")
    attendance_records = relationship("Attendance", back_populates="student")
    grades = relationship("Grade", back_populates="student")

    def __repr__(self) -> str:
        return f"<Student {self.admission_no}>"


class StudentGuardian(Base):
    """Many-to-many link between students and guardians."""
    __tablename__ = "student_guardians"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    guardian_id = Column(UUID(as_uuid=True), ForeignKey("guardians.id", ondelete="CASCADE"), nullable=False, index=True)
    is_primary = Column(Boolean, default=False, nullable=False)

    # ── Relationships ──
    student = relationship("Student", back_populates="guardian_links")
    guardian = relationship("Guardian", back_populates="student_links")

    def __repr__(self) -> str:
        return f"<StudentGuardian student={self.student_id} guardian={self.guardian_id}>"
