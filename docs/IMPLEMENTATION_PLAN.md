# EduNexus School — Implementation Plan

## 1. Project Overview

**EduNexus School** is a production-ready Student Information System (SIS) for K-12 schools featuring multi-portal dashboards, academic management, gradebook, attendance, communication hub, fee management, and analytics.

---

## 2. Technology Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Python 3.11+, FastAPI, SQLAlchemy 2.0 (async), Alembic |
| **Database** | PostgreSQL 15 |
| **Auth** | JWT (access + refresh tokens), bcrypt, RBAC |
| **Frontend** | Next.js 14 (App Router), TypeScript, React Query, Zustand |
| **UI Library** | Material UI (MUI) v5 |
| **File Storage** | Google Cloud Storage (local: MinIO) |
| **Cache** | Redis |
| **Deployment** | Docker, docker-compose, GCP (Cloud Run + Cloud SQL + GCS) |
| **CI/CD** | Cloud Build |
| **Reports** | WeasyPrint (PDF), openpyxl (Excel) |

---

## 3. Folder Structure

```
edunexus/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # FastAPI entry
│   │   ├── config.py               # Settings (pydantic-settings)
│   │   ├── database.py             # Async engine & session
│   │   ├── dependencies.py         # Shared deps
│   │   ├── models/                 # SQLAlchemy models
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── student.py
│   │   │   ├── guardian.py
│   │   │   ├── teacher.py
│   │   │   ├── academic.py         # AcademicYear, Term, Subject
│   │   │   ├── classroom.py        # Class, Section, Schedule
│   │   │   ├── attendance.py
│   │   │   ├── gradebook.py
│   │   │   ├── communication.py    # Messages, Announcements, Events
│   │   │   └── finance.py          # Fees, Invoices, Payments
│   │   ├── schemas/                # Pydantic schemas
│   │   │   └── (mirrors models)
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── deps.py             # Auth deps, get_current_user
│   │   │   └── v1/
│   │   │       ├── __init__.py
│   │   │       ├── router.py       # Aggregated router
│   │   │       ├── auth.py
│   │   │       ├── users.py
│   │   │       ├── students.py
│   │   │       ├── guardians.py
│   │   │       ├── teachers.py
│   │   │       ├── academics.py
│   │   │       ├── classes.py
│   │   │       ├── attendance.py
│   │   │       ├── gradebook.py
│   │   │       ├── communication.py
│   │   │       ├── finance.py
│   │   │       └── reports.py
│   │   ├── services/               # Business logic
│   │   ├── utils/                  # Helpers (email, storage, pdf)
│   │   └── seeds/                  # Seed data scripts
│   ├── alembic/
│   │   ├── env.py
│   │   └── versions/
│   ├── alembic.ini
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── app/                    # Next.js App Router
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx            # Landing / Login
│   │   │   ├── (auth)/
│   │   │   │   ├── login/
│   │   │   │   └── forgot-password/
│   │   │   ├── (dashboard)/
│   │   │   │   ├── admin/
│   │   │   │   ├── teacher/
│   │   │   │   ├── student/
│   │   │   │   └── parent/
│   │   │   └── api/                # Next.js API routes (BFF proxy)
│   │   ├── components/
│   │   │   ├── ui/                 # Reusable UI atoms
│   │   │   ├── layout/             # Sidebar, Navbar, Footer
│   │   │   ├── dashboard/          # Dashboard widgets
│   │   │   ├── students/
│   │   │   ├── attendance/
│   │   │   ├── gradebook/
│   │   │   ├── communication/
│   │   │   └── reports/
│   │   ├── hooks/                  # Custom hooks
│   │   ├── lib/
│   │   │   ├── api.ts              # Axios instance
│   │   │   ├── auth.ts             # Token management
│   │   │   └── utils.ts
│   │   ├── stores/                 # Zustand stores
│   │   ├── types/                  # TypeScript interfaces
│   │   └── theme/                  # MUI theme config
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   └── .env.example
├── docker-compose.yml
├── docker-compose.prod.yml
├── cloudbuild.yaml
└── README.md
```

---

## 4. Database Schema

### 4.1 Users & Authentication

```
┌──────────────────────────┐
│         users             │
├──────────────────────────┤
│ id            UUID PK     │
│ email         VARCHAR UQ  │
│ password_hash VARCHAR     │
│ role          ENUM        │  ← admin | teacher | student | parent
│ first_name    VARCHAR     │
│ last_name     VARCHAR     │
│ phone         VARCHAR     │
│ avatar_url    VARCHAR     │
│ is_active     BOOLEAN     │
│ last_login    TIMESTAMP   │
│ created_at    TIMESTAMP   │
│ updated_at    TIMESTAMP   │
└──────────────────────────┘

┌──────────────────────────┐
│     refresh_tokens        │
├──────────────────────────┤
│ id            UUID PK     │
│ user_id       UUID FK→users│
│ token         VARCHAR UQ  │
│ expires_at    TIMESTAMP   │
│ created_at    TIMESTAMP   │
└──────────────────────────┘
```

### 4.2 Students & Guardians

```
┌─────────────────────────────┐        ┌──────────────────────────┐
│         students             │        │       guardians           │
├─────────────────────────────┤        ├──────────────────────────┤
│ id             UUID PK       │        │ id            UUID PK     │
│ user_id        UUID FK→users │        │ user_id       UUID FK→users│
│ admission_no   VARCHAR UQ    │        │ occupation    VARCHAR     │
│ date_of_birth  DATE          │        │ relationship  VARCHAR     │
│ gender         ENUM          │        │ address       TEXT        │
│ blood_group    VARCHAR       │        │ created_at    TIMESTAMP   │
│ address        TEXT           │        └──────────────────────────┘
│ enrollment_date DATE         │
│ status         ENUM          │  ← active | transferred | graduated | suspended
│ current_class_id UUID FK     │
│ photo_url      VARCHAR       │
│ medical_notes  TEXT           │
│ created_at     TIMESTAMP     │
│ updated_at     TIMESTAMP     │
└─────────────────────────────┘

┌──────────────────────────┐
│   student_guardians       │  (M2M join)
├──────────────────────────┤
│ student_id  UUID FK       │
│ guardian_id UUID FK       │
│ is_primary  BOOLEAN       │
└──────────────────────────┘
```

### 4.3 Academic Structure

```
┌────────────────────────┐     ┌────────────────────────┐
│    academic_years       │     │        terms             │
├────────────────────────┤     ├────────────────────────┤
│ id        UUID PK       │     │ id          UUID PK     │
│ name      VARCHAR       │     │ year_id     UUID FK     │
│ start     DATE          │     │ name        VARCHAR     │
│ end       DATE          │     │ start       DATE        │
│ is_current BOOLEAN      │     │ end         DATE        │
└────────────────────────┘     └────────────────────────┘

┌────────────────────────┐     ┌────────────────────────┐
│      classes            │     │      sections           │
├────────────────────────┤     ├────────────────────────┤
│ id        UUID PK       │     │ id          UUID PK     │
│ name      VARCHAR       │     │ class_id    UUID FK     │
│ grade_level INT         │     │ name        VARCHAR     │
│ year_id   UUID FK       │     │ teacher_id  UUID FK     │  ← class teacher
│ capacity  INT           │     │ capacity    INT         │
└────────────────────────┘     └────────────────────────┘

┌────────────────────────┐     ┌────────────────────────┐
│      subjects           │     │   subject_teachers      │
├────────────────────────┤     ├────────────────────────┤
│ id        UUID PK       │     │ id          UUID PK     │
│ name      VARCHAR       │     │ subject_id  UUID FK     │
│ code      VARCHAR UQ    │     │ teacher_id  UUID FK     │
│ description TEXT        │     │ section_id  UUID FK     │
└────────────────────────┘     └────────────────────────┘

┌─────────────────────────────┐
│       schedules              │
├─────────────────────────────┤
│ id            UUID PK        │
│ section_id    UUID FK        │
│ subject_teacher_id UUID FK   │
│ day_of_week   INT            │  ← 0=Mon..4=Fri
│ start_time    TIME           │
│ end_time      TIME           │
│ room          VARCHAR        │
└─────────────────────────────┘
```

### 4.4 Attendance

```
┌─────────────────────────────┐
│       attendance             │
├─────────────────────────────┤
│ id            UUID PK        │
│ student_id    UUID FK        │
│ section_id    UUID FK        │
│ date          DATE           │
│ status        ENUM           │  ← present | absent | late | excused
│ remarks       VARCHAR        │
│ marked_by     UUID FK→users  │
│ created_at    TIMESTAMP      │
│ UNIQUE(student_id, date)     │
└─────────────────────────────┘
```

### 4.5 Gradebook

```
┌────────────────────────┐     ┌─────────────────────────────┐
│   grading_scales        │     │   assignment_categories      │
├────────────────────────┤     ├─────────────────────────────┤
│ id       UUID PK        │     │ id          UUID PK          │
│ name     VARCHAR        │     │ name        VARCHAR          │  ← Homework, Quiz, Exam
│ grades   JSONB          │     │ weight      DECIMAL          │  ← percentage weight
│ year_id  UUID FK        │     │ term_id     UUID FK          │
└────────────────────────┘     │ subject_teacher_id UUID FK   │
                                └─────────────────────────────┘

┌─────────────────────────────┐     ┌────────────────────────┐
│       assignments            │     │       grades            │
├─────────────────────────────┤     ├────────────────────────┤
│ id            UUID PK        │     │ id          UUID PK     │
│ category_id   UUID FK        │     │ assignment_id UUID FK   │
│ title         VARCHAR        │     │ student_id  UUID FK     │
│ description   TEXT           │     │ score       DECIMAL     │
│ max_score     DECIMAL        │     │ remarks     VARCHAR     │
│ due_date      TIMESTAMP      │     │ graded_by   UUID FK     │
│ file_url      VARCHAR        │     │ created_at  TIMESTAMP   │
│ created_at    TIMESTAMP      │     └────────────────────────┘
└─────────────────────────────┘
```

### 4.6 Communication

```
┌─────────────────────────────┐     ┌────────────────────────┐
│       announcements          │     │       messages          │
├─────────────────────────────┤     ├────────────────────────┤
│ id            UUID PK        │     │ id          UUID PK     │
│ title         VARCHAR        │     │ sender_id   UUID FK     │
│ content       TEXT           │     │ receiver_id UUID FK     │
│ target_role   ENUM[]         │     │ subject     VARCHAR     │
│ author_id     UUID FK        │     │ body        TEXT        │
│ is_pinned     BOOLEAN        │     │ is_read     BOOLEAN     │
│ published_at  TIMESTAMP      │     │ created_at  TIMESTAMP   │
│ created_at    TIMESTAMP      │     └────────────────────────┘
└─────────────────────────────┘

┌─────────────────────────────┐
│         events               │
├─────────────────────────────┤
│ id            UUID PK        │
│ title         VARCHAR        │
│ description   TEXT           │
│ start_time    TIMESTAMP      │
│ end_time      TIMESTAMP      │
│ location      VARCHAR        │
│ target_role   ENUM[]         │
│ created_by    UUID FK        │
│ created_at    TIMESTAMP      │
└─────────────────────────────┘
```

### 4.7 Finance

```
┌────────────────────────┐     ┌─────────────────────────────┐
│     fee_structures      │     │        invoices              │
├────────────────────────┤     ├─────────────────────────────┤
│ id       UUID PK        │     │ id            UUID PK        │
│ name     VARCHAR        │     │ student_id    UUID FK        │
│ amount   DECIMAL        │     │ fee_id        UUID FK        │
│ year_id  UUID FK        │     │ amount        DECIMAL        │
│ class_id UUID FK (opt)  │     │ due_date      DATE           │
│ term_id  UUID FK (opt)  │     │ status        ENUM           │  ← pending | paid | overdue
│ type     VARCHAR        │     │ paid_at       TIMESTAMP      │
│ created_at TIMESTAMP    │     │ created_at    TIMESTAMP      │
└────────────────────────┘     └─────────────────────────────┘

┌─────────────────────────────┐
│        payments              │
├─────────────────────────────┤
│ id            UUID PK        │
│ invoice_id    UUID FK        │
│ amount        DECIMAL        │
│ method        VARCHAR        │  ← cash | bank | online
│ reference     VARCHAR        │
│ created_at    TIMESTAMP      │
└─────────────────────────────┘
```

---

## 5. API Endpoint Structure

### 5.1 Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/login` | Login → access + refresh tokens |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| POST | `/api/v1/auth/logout` | Revoke refresh token |
| GET  | `/api/v1/auth/me` | Current user profile |
| POST | `/api/v1/auth/forgot-password` | Password reset email |
| POST | `/api/v1/auth/reset-password` | Reset password |

### 5.2 Users (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/v1/users` | List users (paginated, filterable) |
| POST   | `/api/v1/users` | Create user |
| GET    | `/api/v1/users/{id}` | Get user |
| PUT    | `/api/v1/users/{id}` | Update user |
| DELETE | `/api/v1/users/{id}` | Soft-delete user |

### 5.3 Students
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/v1/students` | List (filter by class, status) |
| POST   | `/api/v1/students` | Admit new student |
| GET    | `/api/v1/students/{id}` | Student detail + guardians |
| PUT    | `/api/v1/students/{id}` | Update |
| PATCH  | `/api/v1/students/{id}/status` | Transfer / Graduate |
| GET    | `/api/v1/students/{id}/attendance` | Attendance history |
| GET    | `/api/v1/students/{id}/grades` | Grade summary |

### 5.4 Guardians
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/v1/guardians` | List |
| POST   | `/api/v1/guardians` | Create |
| PUT    | `/api/v1/guardians/{id}` | Update |
| POST   | `/api/v1/guardians/{id}/link` | Link to student |

### 5.5 Teachers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/v1/teachers` | List |
| POST   | `/api/v1/teachers` | Create |
| GET    | `/api/v1/teachers/{id}` | Detail |
| GET    | `/api/v1/teachers/{id}/classes` | Assigned classes |
| GET    | `/api/v1/teachers/{id}/schedule` | Timetable |

### 5.6 Academics
| Method | Endpoint | Description |
|--------|----------|-------------|
| CRUD   | `/api/v1/academic-years` | Academic years |
| CRUD   | `/api/v1/terms` | Terms |
| CRUD   | `/api/v1/classes` | Classes |
| CRUD   | `/api/v1/sections` | Sections |
| CRUD   | `/api/v1/subjects` | Subjects |
| CRUD   | `/api/v1/schedules` | Timetable entries |

### 5.7 Attendance
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/api/v1/attendance/bulk` | Mark attendance for section |
| GET    | `/api/v1/attendance/section/{id}` | Section attendance by date |
| GET    | `/api/v1/attendance/report` | Summary report |

### 5.8 Gradebook
| Method | Endpoint | Description |
|--------|----------|-------------|
| CRUD   | `/api/v1/grading-scales` | Grading scales |
| CRUD   | `/api/v1/assignment-categories` | Categories |
| CRUD   | `/api/v1/assignments` | Assignments |
| POST   | `/api/v1/grades/bulk` | Bulk grade entry |
| GET    | `/api/v1/grades/report-card/{student_id}` | Report card |

### 5.9 Communication
| Method | Endpoint | Description |
|--------|----------|-------------|
| CRUD   | `/api/v1/announcements` | Announcements |
| GET/POST | `/api/v1/messages` | Messaging |
| GET    | `/api/v1/messages/inbox` | Inbox |
| GET    | `/api/v1/messages/sent` | Sent |
| CRUD   | `/api/v1/events` | Events calendar |

### 5.10 Finance
| Method | Endpoint | Description |
|--------|----------|-------------|
| CRUD   | `/api/v1/fee-structures` | Fee setup |
| GET/POST | `/api/v1/invoices` | Invoices |
| POST   | `/api/v1/payments` | Record payment |
| GET    | `/api/v1/finance/report` | Finance summary |

### 5.11 Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/v1/reports/attendance` | Attendance report (PDF/Excel) |
| GET    | `/api/v1/reports/grades` | Grades report |
| GET    | `/api/v1/reports/students` | Student list export |
| GET    | `/api/v1/reports/analytics` | Dashboard analytics data |

---

## 6. Phased Delivery Plan

### Phase 1 — Foundation (Scaffolding + Auth)
- Project structure, Docker setup, DB connection
- User model, JWT auth (login, refresh, logout)
- RBAC middleware, role-based route guards
- Alembic initial migration
- **Deliverables:** Backend skeleton, auth endpoints, docker-compose

### Phase 2 — Student Management
- Student, Guardian models + CRUD
- Student lifecycle (admit, transfer, graduate)
- Photo upload to GCS/MinIO
- Medical/health records
- **Deliverables:** Student & guardian endpoints, file upload

### Phase 3 — Academic Structure
- AcademicYear, Term, Class, Section, Subject models
- Teacher profile + subject/section assignment
- Timetable/schedule management
- **Deliverables:** Full academic CRUD, schedule builder

### Phase 4 — Gradebook & Attendance
- Attendance marking (bulk), status tracking
- Grading scales, assignment categories, assignments
- Grade entry (bulk), term averages
- **Deliverables:** Attendance + gradebook endpoints

### Phase 5 — Communication & Finance
- Announcements (role-targeted)
- Direct messaging (inbox/sent)
- Events calendar
- Fee structures, invoices, payments
- **Deliverables:** Communication + finance endpoints

### Phase 6 — Frontend UI
- Next.js project with MUI theme
- Login page, auth flow (token storage)
- Role-based dashboard layouts (Admin, Teacher, Student, Parent)
- CRUD UIs for all modules
- Responsive design, dark mode toggle
- **Deliverables:** Complete frontend application

### Phase 7 — Reports & Analytics
- Report card PDF generation
- Attendance summary exports (PDF + Excel)
- Student list exports
- Dashboard analytics (charts via Recharts)
- **Deliverables:** Reporting module

### Phase 8 — Integration & Deployment
- End-to-end testing, seed data
- Dockerfiles optimized for production
- Cloud Build CI/CD pipeline
- GCP deployment guide (Cloud Run + Cloud SQL + GCS)
- Comprehensive README
- **Deliverables:** Deployment configs, documentation

---

## 7. Authentication Flow

```
Client                    Backend                   Database
  │                         │                          │
  │── POST /auth/login ────►│                          │
  │   {email, password}     │── verify password ──────►│
  │                         │◄── user record ──────────│
  │                         │── generate JWT pair       │
  │◄── {access, refresh} ──│── store refresh_token ──►│
  │                         │                          │
  │── GET /api/... ────────►│                          │
  │   Authorization: Bearer │── validate JWT            │
  │                         │── check role permission   │
  │◄── response ───────────│                          │
  │                         │                          │
  │── POST /auth/refresh ──►│                          │
  │   {refresh_token}       │── validate + rotate ────►│
  │◄── {new access+refresh}│                          │
```

**Token Configuration:**
- Access token: 30 min expiry, contains `{user_id, role, email}`
- Refresh token: 7 days expiry, stored in DB, rotated on use

---

## 8. Key Design Decisions

1. **Async SQLAlchemy** — All DB operations use `async/await` for high concurrency
2. **UUID primary keys** — Avoid sequential ID exposure
3. **Soft deletes** — `is_active` flag instead of hard deletes
4. **JSONB for grading scales** — Flexible grade definitions per school
5. **Role-based middleware** — Decorator `@require_role(["admin", "teacher"])` on routes
6. **BFF pattern** — Next.js API routes proxy to FastAPI, keeping tokens secure
7. **Pagination** — All list endpoints return `{items, total, page, per_page}`

---

## 9. Environment Variables

```env
# Backend
DATABASE_URL=postgresql+asyncpg://edunexus:password@db:5432/edunexus
REDIS_URL=redis://redis:6379/0
SECRET_KEY=your-secret-key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
GCS_BUCKET=edunexus-files
GCS_CREDENTIALS_PATH=/app/credentials.json

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=EduNexus School
```

---

## 10. Docker Services

```yaml
services:
  db:        PostgreSQL 15
  redis:     Redis 7 (caching + sessions)
  minio:     MinIO (local GCS substitute)
  backend:   FastAPI (uvicorn, port 8000)
  frontend:  Next.js (port 3000)
```

---

**Ready for your review and approval before proceeding to Phase 1 implementation.**
