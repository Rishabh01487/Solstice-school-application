"""
EduNexus School — Finance Schemas
"""

from datetime import date, datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.models.finance import InvoiceStatus


# ── Fee Structure ──
class FeeStructureCreate(BaseModel):
    name: str = Field(..., max_length=100)
    amount: float = Field(..., gt=0)
    academic_year_id: UUID
    class_id: Optional[UUID] = None
    term_id: Optional[UUID] = None
    fee_type: str = Field(..., max_length=50)

class FeeStructureUpdate(BaseModel):
    name: Optional[str] = None
    amount: Optional[float] = None
    fee_type: Optional[str] = None

class FeeStructureResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    name: str
    amount: float
    academic_year_id: UUID
    class_id: Optional[UUID] = None
    term_id: Optional[UUID] = None
    fee_type: str
    created_at: datetime


# ── Invoice ──
class InvoiceCreate(BaseModel):
    student_id: UUID
    fee_structure_id: UUID
    amount: float = Field(..., gt=0)
    due_date: date

class InvoiceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    invoice_number: str
    student_id: UUID
    fee_structure_id: UUID
    amount: float
    due_date: date
    status: InvoiceStatus
    paid_at: Optional[datetime] = None
    created_at: datetime
    student_name: Optional[str] = None


# ── Payment ──
class PaymentCreate(BaseModel):
    invoice_id: UUID
    amount: float = Field(..., gt=0)
    method: str = Field(..., max_length=50)
    reference: Optional[str] = None

class PaymentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    invoice_id: UUID
    amount: float
    method: str
    reference: Optional[str] = None
    received_by: Optional[UUID] = None
    created_at: datetime
