"""
EduNexus School — Models Package
Imports all models so Alembic can discover them via Base.metadata.
"""

from app.models.user import User, RefreshToken
from app.models.student import Student, StudentGuardian
from app.models.guardian import Guardian
from app.models.teacher import Teacher
from app.models.academic import AcademicYear, Term, Subject
from app.models.classroom import Class, Section, SubjectTeacher, Schedule
from app.models.attendance import Attendance
from app.models.gradebook import GradingScale, AssignmentCategory, Assignment, Grade
from app.models.communication import Announcement, Message, Event
from app.models.finance import FeeStructure, Invoice, Payment

__all__ = [
    "User", "RefreshToken",
    "Student", "StudentGuardian", "Guardian", "Teacher",
    "AcademicYear", "Term", "Subject",
    "Class", "Section", "SubjectTeacher", "Schedule",
    "Attendance",
    "GradingScale", "AssignmentCategory", "Assignment", "Grade",
    "Announcement", "Message", "Event",
    "FeeStructure", "Invoice", "Payment",
]
