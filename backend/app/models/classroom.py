"""
EduNexus School — Classroom Models (Class, Section, SubjectTeacher, Schedule)
"""

import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Time
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class Class(Base):
    """
    A class/grade level (e.g., Grade 5, Class 10).
    Each class belongs to an academic year and can have multiple sections.
    """
    __tablename__ = "classes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(50), nullable=False)  # e.g. "Grade 5"
    grade_level = Column(Integer, nullable=False)  # numeric level: 1-12
    academic_year_id = Column(UUID(as_uuid=True), ForeignKey("academic_years.id"), nullable=False, index=True)
    capacity = Column(Integer, default=40, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # ── Relationships ──
    academic_year = relationship("AcademicYear", back_populates="classes")
    sections = relationship("Section", back_populates="parent_class", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Class {self.name}>"


class Section(Base):
    """
    A section within a class (e.g., Grade 5 - Section A).
    Has a class teacher and enrolled students.
    """
    __tablename__ = "sections"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    class_id = Column(UUID(as_uuid=True), ForeignKey("classes.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(20), nullable=False)  # e.g. "A", "B"
    class_teacher_id = Column(UUID(as_uuid=True), ForeignKey("teachers.id"), nullable=True)
    capacity = Column(Integer, default=40, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # ── Relationships ──
    parent_class = relationship("Class", back_populates="sections")
    class_teacher = relationship("Teacher", back_populates="class_teacher_sections")
    subject_teachers = relationship("SubjectTeacher", back_populates="section")
    students = relationship("Student", foreign_keys="Student.current_section_id")
    schedules = relationship("Schedule", back_populates="section", cascade="all, delete-orphan")
    attendance_records = relationship("Attendance", back_populates="section")

    def __repr__(self) -> str:
        return f"<Section {self.name}>"


class SubjectTeacher(Base):
    """
    Maps a teacher to a subject in a specific section.
    This is the core teaching assignment record.
    """
    __tablename__ = "subject_teachers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    subject_id = Column(UUID(as_uuid=True), ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False, index=True)
    teacher_id = Column(UUID(as_uuid=True), ForeignKey("teachers.id", ondelete="CASCADE"), nullable=False, index=True)
    section_id = Column(UUID(as_uuid=True), ForeignKey("sections.id", ondelete="CASCADE"), nullable=False, index=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # ── Relationships ──
    subject = relationship("Subject", back_populates="teacher_assignments")
    teacher = relationship("Teacher", back_populates="subject_assignments")
    section = relationship("Section", back_populates="subject_teachers")
    schedules = relationship("Schedule", back_populates="subject_teacher")
    assignment_categories = relationship("AssignmentCategory", back_populates="subject_teacher")

    def __repr__(self) -> str:
        return f"<SubjectTeacher subject={self.subject_id} teacher={self.teacher_id}>"


class Schedule(Base):
    """
    A single timetable slot — links a subject-teacher to a time in a section.
    """
    __tablename__ = "schedules"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    section_id = Column(UUID(as_uuid=True), ForeignKey("sections.id", ondelete="CASCADE"), nullable=False, index=True)
    subject_teacher_id = Column(UUID(as_uuid=True), ForeignKey("subject_teachers.id", ondelete="CASCADE"), nullable=False)
    day_of_week = Column(Integer, nullable=False)  # 0=Monday .. 4=Friday
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    room = Column(String(50), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # ── Relationships ──
    section = relationship("Section", back_populates="schedules")
    subject_teacher = relationship("SubjectTeacher", back_populates="schedules")

    def __repr__(self) -> str:
        return f"<Schedule day={self.day_of_week} {self.start_time}-{self.end_time}>"
