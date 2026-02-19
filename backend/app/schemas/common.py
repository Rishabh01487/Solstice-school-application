"""
EduNexus School — Common/shared Pydantic schemas (pagination, responses).
"""

from datetime import datetime
from typing import Generic, List, Optional, TypeVar
from uuid import UUID

from pydantic import BaseModel, ConfigDict

T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    """Standard paginated list response."""
    items: List[T]
    total: int
    page: int
    per_page: int
    pages: int


class MessageResponse(BaseModel):
    """Simple message response for operations like delete."""
    message: str
    detail: Optional[str] = None


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    version: str
    timestamp: datetime
