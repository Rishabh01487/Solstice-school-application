"""
EduNexus School — Gradebook Schemas
"""

from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


# ── Grading Scale ──
class GradingScaleCreate(BaseModel):
    name: str = Field(..., max_length=100)
    academic_year_id: UUID
    grades: List[Dict[str, Any]]  # [{"letter":"A+","min_score":90,"max_score":100,"gpa":4.0}]

class GradingScaleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    name: str
    academic_year_id: UUID
    grades: List[Dict[str, Any]]
    created_at: datetime


# ── Assignment Category ──
class AssignmentCategoryCreate(BaseModel):
    name: str = Field(..., max_length=100)
    weight: float = Field(..., ge=0, le=100)
    term_id: UUID
    subject_teacher_id: UUID

class AssignmentCategoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    name: str
    weight: float
    term_id: UUID
    subject_teacher_id: UUID
    created_at: datetime


# ── Assignment ──
class AssignmentCreate(BaseModel):
    category_id: UUID
    title: str = Field(..., max_length=200)
    description: Optional[str] = None
    max_score: float = Field(..., gt=0)
    due_date: Optional[datetime] = None
    file_url: Optional[str] = None

class AssignmentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    max_score: Optional[float] = None
    due_date: Optional[datetime] = None
    file_url: Optional[str] = None

class AssignmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    category_id: UUID
    title: str
    description: Optional[str] = None
    max_score: float
    due_date: Optional[datetime] = None
    file_url: Optional[str] = None
    created_at: datetime


# ── Grade ──
class GradeEntry(BaseModel):
    student_id: UUID
    score: float
    remarks: Optional[str] = None

class BulkGradeRequest(BaseModel):
    assignment_id: UUID
    entries: List[GradeEntry]

class GradeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    assignment_id: UUID
    student_id: UUID
    score: float
    remarks: Optional[str] = None
    graded_by: UUID
    created_at: datetime
    student_name: Optional[str] = None


# ── Report Card ──
class SubjectGradeSummary(BaseModel):
    subject_name: str
    subject_code: str
    average_score: float
    letter_grade: Optional[str] = None
    gpa: Optional[float] = None

class ReportCardResponse(BaseModel):
    student_id: UUID
    student_name: str
    admission_no: str
    term_name: str
    academic_year: str
    subjects: List[SubjectGradeSummary]
    overall_average: float
    overall_gpa: Optional[float] = None
