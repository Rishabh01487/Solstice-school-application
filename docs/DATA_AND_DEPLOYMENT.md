# 📦 Solstice School — Data Storage & Free Deployment Guide

## Where Is All The Data Stored?

### Current State (Preview Mode)
Right now the preview at `/preview` uses **browser `localStorage`**:

| Data | Storage Key | Location |
|------|-------------|----------|
| Teachers | `sol_teachers` | Browser localStorage |
| Students | `sol_students` | Browser localStorage |
| Fees | `sol_fees` | Browser localStorage |
| Attendance | `sol_attendance` | Browser localStorage |
| Notices | `sol_notices` | Browser localStorage |
| Admissions | `sol_admissions` | Browser localStorage |
| Payment QR | `sol_qrcode` | Browser localStorage (base64) |
| Event Images | embedded in notices | Browser localStorage (base64) |

**⚠️ Limitation:** Data lives only in YOUR browser. Clear browser data = data gone. 
Different devices/browsers = different data.

### Production Architecture (Backend Mode)
When using the full backend (`docker-compose up`), data is stored in:

| Data | Storage | Technology |
|------|---------|------------|
| Users, Students, Teachers | **PostgreSQL Database** | Tables with relations |
| Attendance Records | **PostgreSQL** | Indexed by date |
| Fee Records | **PostgreSQL** | Linked to students |
| Notices, Events | **PostgreSQL** | With timestamps |
| Uploaded Images/QR | **MinIO / Cloud Storage** | S3-compatible object store |
| Session Tokens | **Redis** | In-memory cache |

---

## 🆓 Free Deployment Options (No Cost, Fully Functional)

### Option 1: Vercel + Supabase (RECOMMENDED — Best Free Tier)

**Total Cost: ₹0/month**

#### Step 1: Database — Supabase (Free)
1. Go to [supabase.com](https://supabase.com) → Sign up with GitHub
2. Create a new project → Name: `solstice-school`
3. Copy the **Database URL** from Settings → Database → Connection String
4. Free tier: **500 MB database**, **1 GB file storage**, **50,000 monthly active users**

#### Step 2: Frontend — Vercel (Free)
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
3. Click "New Project" → Import your GitHub repo
4. Set Root Directory: `frontend`
5. Add Environment Variable:
   - `NEXT_PUBLIC_API_URL` = your backend URL (from Step 3)
   - `NEXT_PUBLIC_APP_NAME` = `Solstice School`
6. Click Deploy → Done! 
7. Free tier: **Unlimited deployments**, custom domain, HTTPS

#### Step 3: Backend — Render (Free)
1. Go to [render.com](https://render.com) → Sign up with GitHub
2. Create a new **Web Service**
3. Connect your GitHub repo → Root Directory: `backend`
4. Build Command: `pip install -r requirements.txt`
5. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add Environment Variables:
   ```
   DATABASE_URL=postgresql+asyncpg://USER:PASS@HOST:5432/DB  (from Supabase)
   DATABASE_URL_SYNC=postgresql://USER:PASS@HOST:5432/DB
   SECRET_KEY=your-random-64-char-string
   ALLOWED_ORIGINS=https://your-app.vercel.app
   ```
7. Free tier: **750 hours/month** (enough for 24/7)

### Option 2: Vercel Only (Frontend-Only, Current Preview Mode)

If you just want the interactive preview without a backend:

1. Push code to GitHub
2. Deploy on Vercel (frontend only)
3. Users access `/preview` — data stored in their browser
4. **Total Cost: ₹0**

**Limitations:** Data is per-browser, no shared database

### Option 3: Railway (All-in-One Free)
1. Go to [railway.app](https://railway.app) → Sign up with GitHub
2. Create new project → Add **PostgreSQL** (free)
3. Add **Backend** service (Docker, from your repo)
4. Add **Frontend** service (Docker, from your repo)
5. Free tier: **$5 credit/month** (enough for small school)

### Option 4: Netlify + PlanetScale
- Frontend: [netlify.com](https://netlify.com) — Free hosting
- Database: [planetscale.com](https://planetscale.com) — Free MySQL (5GB)
- Backend: Deploy on Render (free)

---

## 🚀 Quick Deploy: Vercel (5 Minutes)

### Step 1: Push to GitHub
```bash
cd c:\Users\risha\OneDrive\Desktop\Edusphere_nexus
git init
git add .
git commit -m "Solstice School SIS v1.0"
git remote add origin https://github.com/YOUR_USERNAME/solstice-school.git
git push -u origin main
```

### Step 2: Deploy to Vercel
```bash
# Install Vercel CLI (one time)
npm i -g vercel

# Deploy frontend
cd frontend
vercel --prod
```

### Step 3: Done!
Your site will be live at: `https://solstice-school.vercel.app`

---

## 📊 Free Tier Comparison

| Service | Free Tier | What You Get |
|---------|-----------|--------------|
| **Vercel** | Forever free | Hosting, HTTPS, CDN, custom domain |
| **Supabase** | Forever free | 500MB Postgres, auth, file storage |
| **Render** | 750 hrs/month | Backend hosting, auto-deploy |
| **Railway** | $5/month credit | Postgres + backend + frontend |
| **Netlify** | Forever free | Hosting, forms, edge functions |
| **Cloudinary** | Forever free | 25GB image/video storage |

---

## 🗄️ Data Flow Diagram

```
 Visitors          Parents           Teachers          Admin
    |                 |                  |                |
    v                 v                  v                v
┌─────────────────────────────────────────────────────────┐
│              Solstice School Frontend                    │
│              (Next.js on Vercel)                        │
└────────────────────┬────────────────────────────────────┘
                     │ API Calls
                     v
┌─────────────────────────────────────────────────────────┐
│              Solstice School Backend                     │
│              (FastAPI on Render)                         │
└────────────┬────────────────┬───────────────────────────┘
             │                │
             v                v
    ┌────────────────┐  ┌──────────────┐
    │  PostgreSQL    │  │  File Store  │
    │  (Supabase)    │  │  (Supabase)  │
    │  - Users       │  │  - QR codes  │
    │  - Students    │  │  - Images    │
    │  - Teachers    │  │  - Documents │
    │  - Attendance  │  │              │
    │  - Fees        │  │              │
    │  - Notices     │  │              │
    └────────────────┘  └──────────────┘
```

---

## 🔧 For the Current Preview (No Backend Needed)

The preview at `http://localhost:3000/preview` works **completely independently**:
- No backend server needed
- No database needed
- Data persists in browser localStorage  
- All features work: add teachers, students, mark attendance, collect fees, post notices, upload QR, admission forms
- Deploy to Vercel for free and it works immediately

**To deploy the preview version right now:**
```bash
cd frontend
npx vercel --prod
```

That's it! Your school website will be live in under 2 minutes.
