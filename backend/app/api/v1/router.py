"""
EduNexus School — Aggregated API v1 Router
All sub-routers are included here and mounted in main.py.
"""

from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.users import router as users_router
from app.api.v1.students import router as students_router
from app.api.v1.guardians import router as guardians_router
from app.api.v1.teachers import router as teachers_router
from app.api.v1.academics import router as academics_router
from app.api.v1.attendance import router as attendance_router
from app.api.v1.gradebook import router as gradebook_router
from app.api.v1.communication import router as communication_router
from app.api.v1.finance import router as finance_router
from app.api.v1.reports import router as reports_router

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(students_router)
api_router.include_router(guardians_router)
api_router.include_router(teachers_router)
api_router.include_router(academics_router)
api_router.include_router(attendance_router)
api_router.include_router(gradebook_router)
api_router.include_router(communication_router)
api_router.include_router(finance_router)
api_router.include_router(reports_router)
