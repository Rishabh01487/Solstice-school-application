"""
EduNexus School — Student & Guardian Schemas
"""

from datetime import date, datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.models.student import Gender, StudentStatus


# ── Student Schemas ──

class StudentCreateRequest(BaseModel):
    """Create a new student (also creates user account)."""
    # User fields
    email: str
    password: str = Field(..., min_length=8)
    first_name: str = Field(..., max_length=100)
    last_name: str = Field(..., max_length=100)
    phone: Optional[str] = None

    # Student fields
    admission_no: str = Field(..., max_length=50)
    date_of_birth: date
    gender: Gender
    blood_group: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    enrollment_date: date
    section_id: Optional[UUID] = None
    medical_notes: Optional[str] = None
    emergency_contact: Optional[str] = None
    emergency_phone: Optional[str] = None


class StudentUpdateRequest(BaseModel):
    date_of_birth: Optional[date] = None
    gender: Optional[Gender] = None
    blood_group: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    section_id: Optional[UUID] = None
    medical_notes: Optional[str] = None
    emergency_contact: Optional[str] = None
    emergency_phone: Optional[str] = None


class StudentStatusUpdate(BaseModel):
    status: StudentStatus


class StudentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    admission_no: str
    date_of_birth: date
    gender: Gender
    blood_group: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    enrollment_date: date
    status: StudentStatus
    current_section_id: Optional[UUID] = None
    photo_url: Optional[str] = None
    medical_notes: Optional[str] = None
    emergency_contact: Optional[str] = None
    emergency_phone: Optional[str] = None
    created_at: datetime

    # Joined fields
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None


# ── Guardian Schemas ──

class GuardianCreateRequest(BaseModel):
    email: str
    password: str = Field(..., min_length=8)
    first_name: str = Field(..., max_length=100)
    last_name: str = Field(..., max_length=100)
    phone: Optional[str] = None
    occupation: Optional[str] = None
    relationship_type: Optional[str] = None
    address: Optional[str] = None
    workplace: Optional[str] = None


class GuardianUpdateRequest(BaseModel):
    occupation: Optional[str] = None
    relationship_type: Optional[str] = None
    address: Optional[str] = None
    workplace: Optional[str] = None


class GuardianResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    occupation: Optional[str] = None
    relationship_type: Optional[str] = None
    address: Optional[str] = None
    workplace: Optional[str] = None
    created_at: datetime

    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None


class LinkGuardianRequest(BaseModel):
    student_id: UUID
    is_primary: bool = False
