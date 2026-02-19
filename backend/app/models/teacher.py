"""
EduNexus School — Teacher Model
"""

import uuid
from datetime import datetime

from sqlalchemy import Column, Date, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class Teacher(Base):
    """
    Teacher profile linked to a User account.
    Teachers are assigned to sections via SubjectTeacher.
    """
    __tablename__ = "teachers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)

    employee_id = Column(String(50), unique=True, nullable=False, index=True)
    department = Column(String(100), nullable=True)
    qualification = Column(String(200), nullable=True)
    specialization = Column(String(200), nullable=True)
    date_of_joining = Column(Date, nullable=True)
    bio = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # ── Relationships ──
    user = relationship("User", back_populates="teacher_profile")
    subject_assignments = relationship("SubjectTeacher", back_populates="teacher")
    class_teacher_sections = relationship("Section", back_populates="class_teacher")

    def __repr__(self) -> str:
        return f"<Teacher {self.employee_id}>"
