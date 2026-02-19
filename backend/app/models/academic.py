"""
EduNexus School — Academic Models (AcademicYear, Term, Subject)
"""

import uuid
from datetime import datetime

from sqlalchemy import Boolean, Column, Date, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class AcademicYear(Base):
    """Represents an academic year (e.g., 2025-2026)."""
    __tablename__ = "academic_years"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(50), nullable=False, unique=True)  # e.g. "2025-2026"
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    is_current = Column(Boolean, default=False, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # ── Relationships ──
    terms = relationship("Term", back_populates="academic_year", cascade="all, delete-orphan")
    classes = relationship("Class", back_populates="academic_year")

    def __repr__(self) -> str:
        return f"<AcademicYear {self.name}>"


class Term(Base):
    """A term/semester within an academic year."""
    __tablename__ = "terms"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    academic_year_id = Column(UUID(as_uuid=True), ForeignKey("academic_years.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(50), nullable=False)  # e.g. "Term 1", "Semester 1"
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # ── Relationships ──
    academic_year = relationship("AcademicYear", back_populates="terms")
    assignment_categories = relationship("AssignmentCategory", back_populates="term")

    def __repr__(self) -> str:
        return f"<Term {self.name}>"


class Subject(Base):
    """A subject/course offered by the school."""
    __tablename__ = "subjects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    code = Column(String(20), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    credit_hours = Column(Integer, default=1, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # ── Relationships ──
    teacher_assignments = relationship("SubjectTeacher", back_populates="subject")

    def __repr__(self) -> str:
        return f"<Subject {self.code}: {self.name}>"
