"""
EduNexus School — Finance Models (FeeStructure, Invoice, Payment)
"""

import uuid
from datetime import datetime
import enum

from sqlalchemy import Column, Date, DateTime, Enum as SAEnum, ForeignKey, Numeric, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class InvoiceStatus(str, enum.Enum):
    PENDING = "pending"
    PAID = "paid"
    OVERDUE = "overdue"
    CANCELLED = "cancelled"


class FeeStructure(Base):
    """Defines a fee type and amount for a given academic year / class."""
    __tablename__ = "fee_structures"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)  # e.g. "Tuition Fee", "Lab Fee"
    amount = Column(Numeric(10, 2), nullable=False)
    academic_year_id = Column(UUID(as_uuid=True), ForeignKey("academic_years.id"), nullable=False, index=True)
    class_id = Column(UUID(as_uuid=True), ForeignKey("classes.id"), nullable=True)  # Optional: class-specific
    term_id = Column(UUID(as_uuid=True), ForeignKey("terms.id"), nullable=True)  # Optional: term-specific
    fee_type = Column(String(50), nullable=False)  # tuition, transport, lab, etc.

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # ── Relationships ──
    invoices = relationship("Invoice", back_populates="fee_structure")

    def __repr__(self) -> str:
        return f"<FeeStructure {self.name} ${self.amount}>"


class Invoice(Base):
    """A fee invoice issued to a student."""
    __tablename__ = "invoices"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    invoice_number = Column(String(50), unique=True, nullable=False, index=True)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    fee_structure_id = Column(UUID(as_uuid=True), ForeignKey("fee_structures.id"), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    due_date = Column(Date, nullable=False)
    status = Column(SAEnum(InvoiceStatus, name="invoice_status"), default=InvoiceStatus.PENDING, nullable=False, index=True)
    paid_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # ── Relationships ──
    student = relationship("Student")
    fee_structure = relationship("FeeStructure", back_populates="invoices")
    payments = relationship("Payment", back_populates="invoice", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Invoice {self.invoice_number} {self.status.value}>"


class Payment(Base):
    """Records a payment against an invoice."""
    __tablename__ = "payments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    invoice_id = Column(UUID(as_uuid=True), ForeignKey("invoices.id", ondelete="CASCADE"), nullable=False, index=True)
    amount = Column(Numeric(10, 2), nullable=False)
    method = Column(String(50), nullable=False)  # cash, bank, online
    reference = Column(String(100), nullable=True)  # Transaction reference
    received_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # ── Relationships ──
    invoice = relationship("Invoice", back_populates="payments")
    receiver = relationship("User", foreign_keys=[received_by])

    def __repr__(self) -> str:
        return f"<Payment ${self.amount} via {self.method}>"
