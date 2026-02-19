"""
EduNexus School — Academic & Classroom Schemas
"""

from datetime import date, datetime, time
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


# ── Academic Year ──
class AcademicYearCreate(BaseModel):
    name: str = Field(..., max_length=50)
    start_date: date
    end_date: date
    is_current: bool = False

class AcademicYearUpdate(BaseModel):
    name: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_current: Optional[bool] = None

class AcademicYearResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    name: str
    start_date: date
    end_date: date
    is_current: bool
    created_at: datetime


# ── Term ──
class TermCreate(BaseModel):
    academic_year_id: UUID
    name: str = Field(..., max_length=50)
    start_date: date
    end_date: date

class TermUpdate(BaseModel):
    name: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None

class TermResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    academic_year_id: UUID
    name: str
    start_date: date
    end_date: date
    created_at: datetime


# ── Subject ──
class SubjectCreate(BaseModel):
    name: str = Field(..., max_length=100)
    code: str = Field(..., max_length=20)
    description: Optional[str] = None
    credit_hours: int = 1

class SubjectUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None
    credit_hours: Optional[int] = None

class SubjectResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    name: str
    code: str
    description: Optional[str] = None
    credit_hours: int
    created_at: datetime


# ── Class ──
class ClassCreate(BaseModel):
    name: str = Field(..., max_length=50)
    grade_level: int = Field(..., ge=1, le=12)
    academic_year_id: UUID
    capacity: int = 40

class ClassUpdate(BaseModel):
    name: Optional[str] = None
    grade_level: Optional[int] = None
    capacity: Optional[int] = None

class ClassResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    name: str
    grade_level: int
    academic_year_id: UUID
    capacity: int
    created_at: datetime


# ── Section ──
class SectionCreate(BaseModel):
    class_id: UUID
    name: str = Field(..., max_length=20)
    class_teacher_id: Optional[UUID] = None
    capacity: int = 40

class SectionUpdate(BaseModel):
    name: Optional[str] = None
    class_teacher_id: Optional[UUID] = None
    capacity: Optional[int] = None

class SectionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    class_id: UUID
    name: str
    class_teacher_id: Optional[UUID] = None
    capacity: int
    created_at: datetime


# ── Subject Teacher Assignment ──
class SubjectTeacherCreate(BaseModel):
    subject_id: UUID
    teacher_id: UUID
    section_id: UUID

class SubjectTeacherResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    subject_id: UUID
    teacher_id: UUID
    section_id: UUID
    created_at: datetime


# ── Schedule ──
class ScheduleCreate(BaseModel):
    section_id: UUID
    subject_teacher_id: UUID
    day_of_week: int = Field(..., ge=0, le=4)
    start_time: time
    end_time: time
    room: Optional[str] = None

class ScheduleUpdate(BaseModel):
    day_of_week: Optional[int] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    room: Optional[str] = None

class ScheduleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    section_id: UUID
    subject_teacher_id: UUID
    day_of_week: int
    start_time: time
    end_time: time
    room: Optional[str] = None
    created_at: datetime


# ── Teacher ──
class TeacherCreate(BaseModel):
    email: str
    password: str = Field(..., min_length=8)
    first_name: str = Field(..., max_length=100)
    last_name: str = Field(..., max_length=100)
    phone: Optional[str] = None
    employee_id: str = Field(..., max_length=50)
    department: Optional[str] = None
    qualification: Optional[str] = None
    specialization: Optional[str] = None
    date_of_joining: Optional[date] = None
    bio: Optional[str] = None

class TeacherUpdate(BaseModel):
    department: Optional[str] = None
    qualification: Optional[str] = None
    specialization: Optional[str] = None
    bio: Optional[str] = None

class TeacherResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    user_id: UUID
    employee_id: str
    department: Optional[str] = None
    qualification: Optional[str] = None
    specialization: Optional[str] = None
    date_of_joining: Optional[date] = None
    bio: Optional[str] = None
    created_at: datetime
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
