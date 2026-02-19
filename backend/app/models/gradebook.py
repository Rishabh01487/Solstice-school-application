"""
EduNexus School — Gradebook Models (GradingScale, AssignmentCategory, Assignment, Grade)
"""

import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from app.database import Base


class GradingScale(Base):
    """
    Customizable grading scale per academic year.
    `grades` is a JSONB field like:
    [{"letter": "A+", "min_score": 90, "max_score": 100, "gpa": 4.0}, ...]
    """
    __tablename__ = "grading_scales"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    academic_year_id = Column(UUID(as_uuid=True), ForeignKey("academic_years.id"), nullable=False, index=True)
    grades = Column(JSONB, nullable=False)  # Array of grade definitions

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def __repr__(self) -> str:
        return f"<GradingScale {self.name}>"


class AssignmentCategory(Base):
    """
    Category of assignments (Homework, Quiz, Exam, Project, etc.)
    with a weight that contributes to the final grade.
    """
    __tablename__ = "assignment_categories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)  # e.g. "Homework", "Final Exam"
    weight = Column(Numeric(5, 2), nullable=False)  # Percentage weight (e.g. 25.00)
    term_id = Column(UUID(as_uuid=True), ForeignKey("terms.id", ondelete="CASCADE"), nullable=False, index=True)
    subject_teacher_id = Column(UUID(as_uuid=True), ForeignKey("subject_teachers.id", ondelete="CASCADE"), nullable=False, index=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # ── Relationships ──
    term = relationship("Term", back_populates="assignment_categories")
    subject_teacher = relationship("SubjectTeacher", back_populates="assignment_categories")
    assignments = relationship("Assignment", back_populates="category", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<AssignmentCategory {self.name} weight={self.weight}%>"


class Assignment(Base):
    """An individual assignment/test/exam within a category."""
    __tablename__ = "assignments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    category_id = Column(UUID(as_uuid=True), ForeignKey("assignment_categories.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    max_score = Column(Numeric(7, 2), nullable=False)
    due_date = Column(DateTime, nullable=True)
    file_url = Column(String(512), nullable=True)  # Attachment (uploaded to GCS)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # ── Relationships ──
    category = relationship("AssignmentCategory", back_populates="assignments")
    grades = relationship("Grade", back_populates="assignment", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Assignment {self.title}>"


class Grade(Base):
    """A student's score on a specific assignment."""
    __tablename__ = "grades"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    assignment_id = Column(UUID(as_uuid=True), ForeignKey("assignments.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    score = Column(Numeric(7, 2), nullable=False)
    remarks = Column(String(255), nullable=True)
    graded_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # ── Relationships ──
    assignment = relationship("Assignment", back_populates="grades")
    student = relationship("Student", back_populates="grades")
    grader = relationship("User", foreign_keys=[graded_by])

    def __repr__(self) -> str:
        return f"<Grade student={self.student_id} score={self.score}>"
