"""
EduNexus School — Communication API Routes (Announcements, Messages, Events)
"""

from datetime import datetime
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import and_, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User, UserRole
from app.models.communication import Announcement, Message, Event
from app.schemas.communication import *
from app.api.deps import get_current_user, require_role

router = APIRouter(prefix="/communication", tags=["Communication"])


# ──────────────── Announcements ────────────────
@router.get("/announcements", response_model=list[AnnouncementResponse])
async def list_announcements(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get announcements visible to the current user's role."""
    result = await db.execute(
        select(Announcement, User.first_name, User.last_name)
        .join(User, Announcement.author_id == User.id)
        .where(Announcement.target_roles.contains([current_user.role.value]))
        .order_by(Announcement.is_pinned.desc(), Announcement.created_at.desc())
    )
    items = []
    for ann, fn, ln in result.all():
        resp = AnnouncementResponse.model_validate(ann)
        resp.author_name = f"{fn} {ln}"
        items.append(resp)
    return items


@router.post("/announcements", response_model=AnnouncementResponse, status_code=201)
async def create_announcement(
    body: AnnouncementCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.TEACHER])),
):
    ann = Announcement(
        **body.model_dump(),
        author_id=current_user.id,
    )
    if not ann.published_at:
        ann.published_at = datetime.utcnow()
    db.add(ann)
    await db.flush()
    await db.refresh(ann)
    resp = AnnouncementResponse.model_validate(ann)
    resp.author_name = f"{current_user.first_name} {current_user.last_name}"
    return resp


@router.put("/announcements/{announcement_id}", response_model=AnnouncementResponse)
async def update_announcement(
    announcement_id: UUID,
    body: AnnouncementUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.TEACHER])),
):
    result = await db.execute(select(Announcement).where(Announcement.id == announcement_id))
    ann = result.scalar_one_or_none()
    if not ann:
        raise HTTPException(status_code=404, detail="Announcement not found")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(ann, k, v)
    await db.flush()
    await db.refresh(ann)
    return AnnouncementResponse.model_validate(ann)

@router.delete("/announcements/{announcement_id}")
async def delete_announcement(announcement_id: UUID, db: AsyncSession = Depends(get_db), _: User = Depends(require_role([UserRole.ADMIN]))):
    result = await db.execute(select(Announcement).where(Announcement.id == announcement_id))
    ann = result.scalar_one_or_none()
    if not ann:
        raise HTTPException(status_code=404, detail="Announcement not found")
    await db.delete(ann)
    return {"message": "Announcement deleted"}


# ──────────────── Messages ────────────────
@router.get("/messages/inbox", response_model=list[MessageResponse])
async def get_inbox(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get messages received by the current user."""
    result = await db.execute(
        select(Message, User.first_name, User.last_name)
        .join(User, Message.sender_id == User.id)
        .where(Message.receiver_id == current_user.id)
        .order_by(Message.created_at.desc())
    )
    items = []
    for msg, fn, ln in result.all():
        resp = MessageResponse.model_validate(msg)
        resp.sender_name = f"{fn} {ln}"
        items.append(resp)
    return items


@router.get("/messages/sent", response_model=list[MessageResponse])
async def get_sent(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Message, User.first_name, User.last_name)
        .join(User, Message.receiver_id == User.id)
        .where(Message.sender_id == current_user.id)
        .order_by(Message.created_at.desc())
    )
    items = []
    for msg, fn, ln in result.all():
        resp = MessageResponse.model_validate(msg)
        resp.receiver_name = f"{fn} {ln}"
        items.append(resp)
    return items


@router.post("/messages", response_model=MessageResponse, status_code=201)
async def send_message(
    body: MessageCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    msg = Message(
        sender_id=current_user.id,
        receiver_id=body.receiver_id,
        subject=body.subject,
        body=body.body,
    )
    db.add(msg)
    await db.flush()
    await db.refresh(msg)
    resp = MessageResponse.model_validate(msg)
    resp.sender_name = f"{current_user.first_name} {current_user.last_name}"
    return resp


@router.patch("/messages/{message_id}/read")
async def mark_message_read(
    message_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Message).where(Message.id == message_id, Message.receiver_id == current_user.id))
    msg = result.scalar_one_or_none()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    msg.is_read = True
    await db.flush()
    return {"message": "Marked as read"}


# ──────────────── Events ────────────────
@router.get("/events", response_model=list[EventResponse])
async def list_events(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Event)
        .where(Event.target_roles.contains([current_user.role.value]))
        .order_by(Event.start_time)
    )
    return [EventResponse.model_validate(e) for e in result.scalars().all()]


@router.post("/events", response_model=EventResponse, status_code=201)
async def create_event(
    body: EventCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.TEACHER])),
):
    event = Event(**body.model_dump(), created_by=current_user.id)
    db.add(event)
    await db.flush()
    await db.refresh(event)
    return EventResponse.model_validate(event)

@router.put("/events/{event_id}", response_model=EventResponse)
async def update_event(event_id: UUID, body: EventUpdate, db: AsyncSession = Depends(get_db), _: User = Depends(require_role([UserRole.ADMIN]))):
    result = await db.execute(select(Event).where(Event.id == event_id))
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(event, k, v)
    await db.flush()
    await db.refresh(event)
    return EventResponse.model_validate(event)

@router.delete("/events/{event_id}")
async def delete_event(event_id: UUID, db: AsyncSession = Depends(get_db), _: User = Depends(require_role([UserRole.ADMIN]))):
    result = await db.execute(select(Event).where(Event.id == event_id))
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    await db.delete(event)
    return {"message": "Event deleted"}
