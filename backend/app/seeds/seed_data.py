"""
EduNexus School — Seed Data Script
Creates demo data: admin, teachers, students, classes, etc.
Run: python -m app.seeds.seed_data
"""

import asyncio
import sys
from datetime import date, datetime, time, timedelta
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from sqlalchemy import select
from app.database import async_session_factory, engine, Base
from app.models.user import User, UserRole
from app.models.student import Student, StudentGuardian
from app.models.student import Gender, StudentStatus
from app.models.guardian import Guardian
from app.models.teacher import Teacher
from app.models.academic import AcademicYear, Term, Subject
from app.models.classroom import Class, Section, SubjectTeacher, Schedule
from app.models.communication import Announcement, Event
from app.models.finance import FeeStructure
from app.models.gradebook import GradingScale
from app.utils.security import hash_password


async def seed():
    """Populate the database with demo data."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session_factory() as db:
        # Check if already seeded
        existing = await db.execute(select(User).where(User.email == "admin@edunexus.school"))
        if existing.scalar_one_or_none():
            print("⚠️  Database already seeded. Skipping.")
            return

        print("🌱 Seeding EduNexus database...")

        # ═══════════════ ADMIN ═══════════════
        admin_user = User(
            email="admin@edunexus.school",
            password_hash=hash_password("admin123"),
            role=UserRole.ADMIN,
            first_name="System",
            last_name="Administrator",
            phone="+1-555-0100",
        )
        db.add(admin_user)
        await db.flush()
        print("  ✅ Admin user created (admin@edunexus.school / admin123)")

        # ═══════════════ ACADEMIC YEAR & TERMS ═══════════════
        year = AcademicYear(
            name="2025-2026",
            start_date=date(2025, 8, 1),
            end_date=date(2026, 6, 30),
            is_current=True,
        )
        db.add(year)
        await db.flush()

        term1 = Term(academic_year_id=year.id, name="Term 1", start_date=date(2025, 8, 1), end_date=date(2025, 12, 20))
        term2 = Term(academic_year_id=year.id, name="Term 2", start_date=date(2026, 1, 5), end_date=date(2026, 6, 30))
        db.add_all([term1, term2])
        await db.flush()
        print("  ✅ Academic year 2025-2026 with 2 terms")

        # ═══════════════ SUBJECTS ═══════════════
        subjects_data = [
            ("Mathematics", "MATH101", 5),
            ("English Language", "ENG101", 5),
            ("Science", "SCI101", 4),
            ("Social Studies", "SOC101", 3),
            ("Physical Education", "PE101", 2),
            ("Art & Music", "ART101", 2),
            ("Computer Science", "CS101", 3),
        ]
        subjects = []
        for name, code, credits in subjects_data:
            subj = Subject(name=name, code=code, credit_hours=credits)
            db.add(subj)
            subjects.append(subj)
        await db.flush()
        print(f"  ✅ {len(subjects)} subjects created")

        # ═══════════════ TEACHERS ═══════════════
        teachers_data = [
            ("Sarah", "Johnson", "sarah.johnson@edunexus.school", "TCH001", "Mathematics"),
            ("Michael", "Chen", "michael.chen@edunexus.school", "TCH002", "Science"),
            ("Emily", "Williams", "emily.williams@edunexus.school", "TCH003", "English"),
            ("David", "Brown", "david.brown@edunexus.school", "TCH004", "Social Studies"),
            ("Jessica", "Davis", "jessica.davis@edunexus.school", "TCH005", "Computer Science"),
        ]
        teachers = []
        for fn, ln, email, emp_id, dept in teachers_data:
            user = User(
                email=email, password_hash=hash_password("teacher123"),
                role=UserRole.TEACHER, first_name=fn, last_name=ln,
            )
            db.add(user)
            await db.flush()
            teacher = Teacher(
                user_id=user.id, employee_id=emp_id, department=dept,
                qualification="M.Ed.", date_of_joining=date(2024, 8, 1),
            )
            db.add(teacher)
            teachers.append(teacher)
        await db.flush()
        print(f"  ✅ {len(teachers)} teachers created (password: teacher123)")

        # ═══════════════ CLASSES & SECTIONS ═══════════════
        classes = []
        sections = []
        for grade in range(1, 6):  # Grades 1-5
            cls = Class(name=f"Grade {grade}", grade_level=grade, academic_year_id=year.id, capacity=40)
            db.add(cls)
            await db.flush()
            classes.append(cls)

            for sec_name in ["A", "B"]:
                teacher_idx = (grade - 1) % len(teachers)
                section = Section(
                    class_id=cls.id, name=sec_name,
                    class_teacher_id=teachers[teacher_idx].id, capacity=30,
                )
                db.add(section)
                sections.append(section)
        await db.flush()
        print(f"  ✅ {len(classes)} classes with {len(sections)} sections")

        # ═══════════════ SUBJECT-TEACHER ASSIGNMENTS ═══════════════
        st_assignments = []
        for section in sections[:4]:  # Assign to first 4 sections
            for i, subject in enumerate(subjects[:5]):  # First 5 subjects
                teacher_idx = i % len(teachers)
                sta = SubjectTeacher(
                    subject_id=subject.id, teacher_id=teachers[teacher_idx].id,
                    section_id=section.id,
                )
                db.add(sta)
                st_assignments.append(sta)
        await db.flush()
        print(f"  ✅ {len(st_assignments)} subject-teacher assignments")

        # ═══════════════ STUDENTS ═══════════════
        student_names = [
            ("Aiden", "Martinez", "male"), ("Sophia", "Lee", "female"),
            ("Liam", "Patel", "male"), ("Olivia", "Garcia", "female"),
            ("Noah", "Wilson", "male"), ("Emma", "Taylor", "female"),
            ("Ethan", "Anderson", "male"), ("Ava", "Thomas", "female"),
            ("Mason", "Jackson", "male"), ("Isabella", "White", "female"),
            ("Lucas", "Harris", "male"), ("Mia", "Clark", "female"),
            ("James", "Lewis", "male"), ("Charlotte", "Walker", "female"),
            ("Benjamin", "Hall", "male"), ("Amelia", "Allen", "female"),
            ("Alexander", "Young", "male"), ("Harper", "King", "female"),
            ("William", "Wright", "male"), ("Evelyn", "Lopez", "female"),
        ]

        students = []
        for idx, (fn, ln, gender) in enumerate(student_names):
            email = f"{fn.lower()}.{ln.lower()}@student.edunexus.school"
            user = User(
                email=email, password_hash=hash_password("student123"),
                role=UserRole.STUDENT, first_name=fn, last_name=ln,
            )
            db.add(user)
            await db.flush()

            section_idx = idx % len(sections)
            student = Student(
                user_id=user.id,
                admission_no=f"EDU{2025}{idx+1:04d}",
                date_of_birth=date(2015, (idx % 12) + 1, (idx % 28) + 1),
                gender=Gender(gender),
                enrollment_date=date(2025, 8, 1),
                status=StudentStatus.ACTIVE,
                current_section_id=sections[section_idx].id,
                address=f"{100 + idx} School Street",
                city="Springfield",
                state="IL",
                zip_code="62701",
            )
            db.add(student)
            students.append(student)
        await db.flush()
        print(f"  ✅ {len(students)} students created (password: student123)")

        # ═══════════════ GUARDIANS ═══════════════
        guardian_data = [
            ("Robert", "Martinez", "Father"), ("Maria", "Martinez", "Mother"),
            ("James", "Lee", "Father"), ("Yuki", "Lee", "Mother"),
            ("Raj", "Patel", "Father"), ("Priya", "Patel", "Mother"),
        ]
        guardians = []
        for fn, ln, rel in guardian_data:
            email = f"{fn.lower()}.{ln.lower()}.parent@edunexus.school"
            user = User(
                email=email, password_hash=hash_password("parent123"),
                role=UserRole.PARENT, first_name=fn, last_name=ln,
            )
            db.add(user)
            await db.flush()

            guardian = Guardian(
                user_id=user.id, occupation="Professional",
                relationship_type=rel, address="123 Family Lane",
            )
            db.add(guardian)
            guardians.append(guardian)
        await db.flush()

        # Link guardians to students
        for i, guardian in enumerate(guardians):
            student_idx = i // 2
            if student_idx < len(students):
                link = StudentGuardian(
                    student_id=students[student_idx].id,
                    guardian_id=guardian.id,
                    is_primary=(i % 2 == 0),
                )
                db.add(link)
        await db.flush()
        print(f"  ✅ {len(guardians)} guardians created & linked (password: parent123)")

        # ═══════════════ GRADING SCALE ═══════════════
        scale = GradingScale(
            name="Standard K-12 Scale",
            academic_year_id=year.id,
            grades=[
                {"letter": "A+", "min_score": 97, "max_score": 100, "gpa": 4.0},
                {"letter": "A", "min_score": 93, "max_score": 96, "gpa": 4.0},
                {"letter": "A-", "min_score": 90, "max_score": 92, "gpa": 3.7},
                {"letter": "B+", "min_score": 87, "max_score": 89, "gpa": 3.3},
                {"letter": "B", "min_score": 83, "max_score": 86, "gpa": 3.0},
                {"letter": "B-", "min_score": 80, "max_score": 82, "gpa": 2.7},
                {"letter": "C+", "min_score": 77, "max_score": 79, "gpa": 2.3},
                {"letter": "C", "min_score": 73, "max_score": 76, "gpa": 2.0},
                {"letter": "C-", "min_score": 70, "max_score": 72, "gpa": 1.7},
                {"letter": "D", "min_score": 60, "max_score": 69, "gpa": 1.0},
                {"letter": "F", "min_score": 0, "max_score": 59, "gpa": 0.0},
            ],
        )
        db.add(scale)
        print("  ✅ Grading scale created")

        # ═══════════════ FEE STRUCTURES ═══════════════
        fees = [
            FeeStructure(name="Tuition Fee", amount=5000.00, academic_year_id=year.id, fee_type="tuition"),
            FeeStructure(name="Lab Fee", amount=500.00, academic_year_id=year.id, fee_type="lab"),
            FeeStructure(name="Transport Fee", amount=1200.00, academic_year_id=year.id, fee_type="transport"),
            FeeStructure(name="Activity Fee", amount=300.00, academic_year_id=year.id, fee_type="activity"),
        ]
        db.add_all(fees)
        print("  ✅ Fee structures created")

        # ═══════════════ ANNOUNCEMENTS ═══════════════
        announcements = [
            Announcement(
                title="Welcome to Academic Year 2025-2026!",
                content="Dear students, teachers, and parents — welcome to the new academic year at EduNexus School. We look forward to an exciting year of learning and growth.",
                target_roles=["admin", "teacher", "student", "parent"],
                author_id=admin_user.id,
                is_pinned=True,
                published_at=datetime.utcnow(),
            ),
            Announcement(
                title="Parent-Teacher Meeting — September 15",
                content="We invite all parents to join us for the first PTM of the year. Please check the events calendar for time slots.",
                target_roles=["parent", "teacher"],
                author_id=admin_user.id,
                published_at=datetime.utcnow(),
            ),
        ]
        db.add_all(announcements)
        print("  ✅ Announcements created")

        # ═══════════════ EVENTS ═══════════════
        events = [
            Event(
                title="Annual Sports Day",
                description="Join us for the annual inter-house sports competition!",
                start_time=datetime(2025, 10, 15, 8, 0),
                end_time=datetime(2025, 10, 15, 16, 0),
                location="School Sports Ground",
                target_roles=["admin", "teacher", "student", "parent"],
                created_by=admin_user.id,
            ),
            Event(
                title="Science Fair",
                description="Students showcase their science projects.",
                start_time=datetime(2025, 11, 20, 9, 0),
                end_time=datetime(2025, 11, 20, 15, 0),
                location="School Auditorium",
                target_roles=["admin", "teacher", "student", "parent"],
                created_by=admin_user.id,
            ),
        ]
        db.add_all(events)
        print("  ✅ Events created")

        await db.commit()
        print("\n🎉 EduNexus database seeded successfully!")
        print("\n📋 Login Credentials:")
        print("  Admin:   admin@edunexus.school / admin123")
        print("  Teacher: sarah.johnson@edunexus.school / teacher123")
        print("  Student: aiden.martinez@student.edunexus.school / student123")
        print("  Parent:  robert.martinez.parent@edunexus.school / parent123")


if __name__ == "__main__":
    asyncio.run(seed())
