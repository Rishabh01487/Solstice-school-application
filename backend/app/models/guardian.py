"""
EduNexus School — Guardian Model
"""

import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class Guardian(Base):
    """
    Guardian / Parent profile linked to a User account.
    Can be linked to multiple students via StudentGuardian.
    """
    __tablename__ = "guardians"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)

    occupation = Column(String(150), nullable=True)
    relationship_type = Column(String(50), nullable=True)  # father, mother, legal guardian
    address = Column(Text, nullable=True)
    workplace = Column(String(200), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # ── Relationships ──
    user = relationship("User", back_populates="guardian_profile")
    student_links = relationship("StudentGuardian", back_populates="guardian", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Guardian user={self.user_id}>"
