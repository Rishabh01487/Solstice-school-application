"""
EduNexus School — Finance API Routes (Fee Structures, Invoices, Payments)
"""

import uuid as uuid_lib
from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User, UserRole
from app.models.finance import FeeStructure, Invoice, InvoiceStatus, Payment
from app.models.student import Student
from app.schemas.finance import *
from app.schemas.common import PaginatedResponse
from app.api.deps import get_current_user, require_role

router = APIRouter(prefix="/finance", tags=["Finance"])


# ──────────────── Fee Structures ────────────────
@router.get("/fees", response_model=list[FeeStructureResponse])
async def list_fee_structures(
    year_id: UUID = None,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role([UserRole.ADMIN])),
):
    query = select(FeeStructure)
    if year_id:
        query = query.where(FeeStructure.academic_year_id == year_id)
    result = await db.execute(query.order_by(FeeStructure.name))
    return [FeeStructureResponse.model_validate(f) for f in result.scalars().all()]


@router.post("/fees", response_model=FeeStructureResponse, status_code=201)
async def create_fee_structure(
    body: FeeStructureCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role([UserRole.ADMIN])),
):
    fee = FeeStructure(**body.model_dump())
    db.add(fee)
    await db.flush()
    await db.refresh(fee)
    return FeeStructureResponse.model_validate(fee)


@router.put("/fees/{fee_id}", response_model=FeeStructureResponse)
async def update_fee_structure(
    fee_id: UUID,
    body: FeeStructureUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role([UserRole.ADMIN])),
):
    result = await db.execute(select(FeeStructure).where(FeeStructure.id == fee_id))
    fee = result.scalar_one_or_none()
    if not fee:
        raise HTTPException(status_code=404, detail="Fee structure not found")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(fee, k, v)
    await db.flush()
    await db.refresh(fee)
    return FeeStructureResponse.model_validate(fee)


# ──────────────── Invoices ────────────────
@router.get("/invoices", response_model=PaginatedResponse[InvoiceResponse])
async def list_invoices(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    student_id: UUID = None,
    invoice_status: InvoiceStatus = Query(None, alias="status"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(Invoice, User.first_name, User.last_name).join(
        Student, Invoice.student_id == Student.id
    ).join(User, Student.user_id == User.id)

    count_query = select(func.count(Invoice.id))

    if student_id:
        query = query.where(Invoice.student_id == student_id)
        count_query = count_query.where(Invoice.student_id == student_id)
    if invoice_status:
        query = query.where(Invoice.status == invoice_status)
        count_query = count_query.where(Invoice.status == invoice_status)

    total_result = await db.execute(count_query)
    total = total_result.scalar()

    query = query.order_by(Invoice.created_at.desc()).offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    rows = result.all()

    items = []
    for inv, fn, ln in rows:
        resp = InvoiceResponse.model_validate(inv)
        resp.student_name = f"{fn} {ln}"
        items.append(resp)

    return PaginatedResponse(
        items=items, total=total, page=page, per_page=per_page,
        pages=(total + per_page - 1) // per_page,
    )


@router.post("/invoices", response_model=InvoiceResponse, status_code=201)
async def create_invoice(
    body: InvoiceCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role([UserRole.ADMIN])),
):
    invoice_number = f"INV-{datetime.utcnow().strftime('%Y%m%d')}-{str(uuid_lib.uuid4())[:8].upper()}"
    invoice = Invoice(
        invoice_number=invoice_number,
        student_id=body.student_id,
        fee_structure_id=body.fee_structure_id,
        amount=body.amount,
        due_date=body.due_date,
    )
    db.add(invoice)
    await db.flush()
    await db.refresh(invoice)
    return InvoiceResponse.model_validate(invoice)


# ──────────────── Payments ────────────────
@router.post("/payments", response_model=PaymentResponse, status_code=201)
async def record_payment(
    body: PaymentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN])),
):
    """Record a payment against an invoice."""
    # Get invoice
    result = await db.execute(select(Invoice).where(Invoice.id == body.invoice_id))
    invoice = result.scalar_one_or_none()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    payment = Payment(
        invoice_id=body.invoice_id,
        amount=body.amount,
        method=body.method,
        reference=body.reference,
        received_by=current_user.id,
    )
    db.add(payment)

    # Check if fully paid
    existing_payments = await db.execute(select(func.sum(Payment.amount)).where(Payment.invoice_id == body.invoice_id))
    total_paid = (existing_payments.scalar() or 0) + body.amount

    if total_paid >= float(invoice.amount):
        invoice.status = InvoiceStatus.PAID
        invoice.paid_at = datetime.utcnow()

    await db.flush()
    await db.refresh(payment)
    return PaymentResponse.model_validate(payment)


@router.get("/report")
async def finance_report(
    year_id: UUID = None,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role([UserRole.ADMIN])),
):
    """Quick finance summary."""
    total_invoiced = await db.execute(select(func.sum(Invoice.amount)))
    total_paid_result = await db.execute(select(func.sum(Payment.amount)))
    pending_count = await db.execute(select(func.count(Invoice.id)).where(Invoice.status == InvoiceStatus.PENDING))
    overdue_count = await db.execute(select(func.count(Invoice.id)).where(Invoice.status == InvoiceStatus.OVERDUE))

    return {
        "total_invoiced": float(total_invoiced.scalar() or 0),
        "total_collected": float(total_paid_result.scalar() or 0),
        "pending_invoices": pending_count.scalar(),
        "overdue_invoices": overdue_count.scalar(),
    }
