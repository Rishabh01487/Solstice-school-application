"""
EduNexus School — Communication Schemas
"""

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


# ── Announcement ──
class AnnouncementCreate(BaseModel):
    title: str = Field(..., max_length=200)
    content: str
    target_roles: List[str]  # ["admin","teacher","student","parent"]
    is_pinned: bool = False
    published_at: Optional[datetime] = None

class AnnouncementUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    target_roles: Optional[List[str]] = None
    is_pinned: Optional[bool] = None

class AnnouncementResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    title: str
    content: str
    target_roles: List[str]
    author_id: UUID
    is_pinned: bool
    published_at: Optional[datetime] = None
    created_at: datetime
    author_name: Optional[str] = None


# ── Message ──
class MessageCreate(BaseModel):
    receiver_id: UUID
    subject: str = Field(..., max_length=200)
    body: str

class MessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    sender_id: UUID
    receiver_id: UUID
    subject: str
    body: str
    is_read: bool
    created_at: datetime
    sender_name: Optional[str] = None
    receiver_name: Optional[str] = None


# ── Event ──
class EventCreate(BaseModel):
    title: str = Field(..., max_length=200)
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    location: Optional[str] = None
    target_roles: List[str]

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    location: Optional[str] = None
    target_roles: Optional[List[str]] = None

class EventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    location: Optional[str] = None
    target_roles: List[str]
    created_by: UUID
    created_at: datetime
