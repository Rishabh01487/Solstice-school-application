# 🏫 EduNexus School — Student Information System

A modern, production-ready Student Information System (SIS) for K-12 schools. Built with **FastAPI** (Python) + **Next.js** (TypeScript) + **PostgreSQL**.

![EduNexus](https://img.shields.io/badge/EduNexus-School-7C4DFF?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)

---

## ✨ Features

- **Multi-Portal Dashboards** — Admin, Teacher, Student, Parent
- **Student Lifecycle** — Admissions, enrollment, transfers, graduation
- **Academic Management** — Years, terms, classes, sections, timetabling
- **Attendance System** — Bulk marking, multiple statuses, reports
- **Gradebook** — Grading scales, weighted categories, report cards
- **Communication Hub** — Announcements, messaging, events calendar
- **Fee Management** — Fee structures, invoices, payment tracking
- **Reports & Analytics** — Dashboard metrics, exportable reports
- **JWT Authentication** — Access + refresh token rotation, RBAC
- **Responsive UI** — Dark theme, glassmorphism, MUI components

---

## 🏗️ Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Next.js    │────▶│   FastAPI    │────▶│  PostgreSQL  │
│  Frontend    │     │   Backend    │     │   Database   │
│  (Port 3000) │     │  (Port 8000) │     │  (Port 5432) │
└──────────────┘     └──────┬───────┘     └──────────────┘
                            │
                     ┌──────┴───────┐
                     │  Redis/MinIO │
                     └──────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local frontend dev)
- Python 3.11+ (for local backend dev)

### Option 1: Docker Compose (Recommended)

```bash
# Clone & navigate
cd Edusphere_nexus

# Copy env files
cp backend/.env.example backend/.env

# Start all services
docker-compose up --build

# Access:
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
# MinIO Console: http://localhost:9001
```

### Option 2: Local Development

**Backend:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your local PostgreSQL URL
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Database Setup:**
```bash
cd backend
alembic upgrade head
python -m app.seeds.seed_data
```

---

## 🔑 Demo Credentials

| Role     | Email                                        | Password     |
|----------|----------------------------------------------|-------------|
| Admin    | admin@edunexus.school                        | admin123    |
| Teacher  | sarah.johnson@edunexus.school                | teacher123  |
| Student  | aiden.martinez@student.edunexus.school        | student123  |
| Parent   | robert.martinez.parent@edunexus.school        | parent123   |

---

## 📁 Project Structure

```
Edusphere_nexus/
├── backend/                    # FastAPI Backend
│   ├── app/
│   │   ├── api/v1/            # API route handlers
│   │   ├── models/            # SQLAlchemy ORM models
│   │   ├── schemas/           # Pydantic validation schemas
│   │   ├── seeds/             # Demo data seeding
│   │   ├── utils/             # Helpers (security, storage)
│   │   ├── config.py          # Environment config
│   │   ├── database.py        # DB engine & session
│   │   └── main.py            # FastAPI app entry
│   ├── alembic/               # Database migrations
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/                   # Next.js Frontend
│   ├── src/
│   │   ├── app/               # App Router pages
│   │   │   ├── login/         # Login page
│   │   │   └── dashboard/     # Role-based dashboards
│   │   ├── lib/               # API client, utilities
│   │   ├── stores/            # Zustand state management
│   │   ├── theme/             # MUI theme configuration
│   │   └── types/             # TypeScript interfaces
│   ├── Dockerfile
│   └── .env.local
├── docker-compose.yml
├── docs/
│   └── IMPLEMENTATION_PLAN.md
└── README.md
```

---

## 🔌 API Endpoints

| Module          | Base Path                     | Key Operations         |
|----------------|-------------------------------|------------------------|
| Auth            | `/api/v1/auth`               | Login, Refresh, Logout |
| Users           | `/api/v1/users`              | CRUD (admin)           |
| Students        | `/api/v1/students`           | CRUD + Status          |
| Guardians       | `/api/v1/guardians`          | CRUD + Link            |
| Teachers        | `/api/v1/teachers`           | CRUD                   |
| Academics       | `/api/v1/academics`          | Years, Terms, Subjects |
| Attendance      | `/api/v1/attendance`         | Bulk Mark, Reports     |
| Gradebook       | `/api/v1/gradebook`          | Grades, Report Cards   |
| Communication   | `/api/v1/communication`      | Messages, Events       |
| Finance         | `/api/v1/finance`            | Fees, Invoices         |
| Reports         | `/api/v1/reports`            | Analytics              |

Full API documentation available at **http://localhost:8000/docs** (Swagger UI).

---

## 🔧 Environment Variables

See `backend/.env.example` and `frontend/.env.local` for all configuration options.

---

## 🐳 Docker Services

| Service   | Image             | Port  | Purpose          |
|-----------|-------------------|-------|------------------|
| db        | postgres:15       | 5432  | Database         |
| redis     | redis:7           | 6379  | Cache            |
| minio     | minio/minio       | 9000  | Object Storage   |
| backend   | python:3.11       | 8000  | API Server       |
| frontend  | node:20           | 3000  | Web UI           |

---

## 📜 License

MIT License — Free for educational and commercial use.
