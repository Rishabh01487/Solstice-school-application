# 🚀 Solstice School — Complete Deployment Guide (Option B: Full Stack)

## Overview
Deploy your Solstice School SIS for **₹0/month** with shared data across all devices:

| Service | Purpose | Cost |
|---------|---------|------|
| **Vercel** | Frontend hosting | ₹0 |
| **Supabase** | PostgreSQL Database + File Storage | ₹0 |
| **Render** | Python Backend (FastAPI) | ₹0 |
| **Firebase** | Google Sign-In Authentication | ₹0 |

---

## Step 1: Set Up Firebase (Google Sign-In) — 3 minutes

### 1.1 Create Firebase Project
1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Create a project"**
3. Name: `solstice-school` → Click Continue
4. Disable Google Analytics → Click **Create Project**
5. Wait for project to be created → Click **Continue**

### 1.2 Add Web App
1. On the project dashboard, click the **Web icon `</>`** 
2. App nickname: `solstice-web`
3. ✅ Check "Also set up Firebase Hosting" (optional)
4. Click **Register app**
5. You'll see a `firebaseConfig` object — **copy these values**

### 1.3 Enable Google Sign-In
1. In the left sidebar → **Authentication** → **Get Started**
2. Click **Sign-in method** tab
3. Click **Google** → Toggle **Enable** → Add your email as project support email
4. Click **Save**

### 1.4 Add Config to Your Project
Open `frontend/.env.local` and add these lines (replace with YOUR values):

```env
NEXT_PUBLIC_APP_NAME=Solstice School

# Firebase Config (from Step 1.2)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyB_your_actual_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=solstice-school.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=solstice-school
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=solstice-school.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 1.5 Test Google Sign-In
1. Restart your dev server: `npm run dev`
2. Go to `http://localhost:3000/preview`
3. Click **Sign In** → **Sign in with Google**
4. The **real Google account picker** will now appear! 🎉

---

## Step 2: Set Up Supabase Database — 5 minutes

### 2.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com) → Sign up with GitHub
2. Click **New Project**
3. Name: `solstice-school`
4. Database Password: Choose a strong password (**save this!**)
5. Region: Mumbai (closest to you)
6. Click **Create new project** → Wait 2 minutes

### 2.2 Get Database URL
1. Go to **Settings** → **Database**
2. Scroll to **Connection string** → **URI** tab
3. Copy the connection string. It looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
4. Replace `[YOUR-PASSWORD]` with the password you set in Step 2.1

### 2.3 For the backend, you need TWO versions:
```
# Async (for FastAPI)
DATABASE_URL=postgresql+asyncpg://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres

# Sync (for Alembic migrations)
DATABASE_URL_SYNC=postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres
```

---

## Step 3: Deploy Backend to Render — 5 minutes

### 3.1 Push Code to GitHub
```bash
cd c:\Users\risha\OneDrive\Desktop\Edusphere_nexus
git init
git add .
git commit -m "Solstice School v1.0"
```
Then create a repo on [github.com](https://github.com/new) named `solstice-school` and:
```bash
git remote add origin https://github.com/YOUR_USERNAME/solstice-school.git
git branch -M main
git push -u origin main
```

### 3.2 Create Render Web Service
1. Go to [render.com](https://render.com) → Sign up with GitHub
2. Click **New** → **Web Service**
3. Connect your `solstice-school` GitHub repo
4. Settings:
   - **Name:** `solstice-school-api`
   - **Root Directory:** `backend`
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### 3.3 Add Environment Variables on Render
Click **Environment** → Add these:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | `postgresql+asyncpg://postgres:PASS@db.xxx.supabase.co:5432/postgres` |
| `DATABASE_URL_SYNC` | `postgresql://postgres:PASS@db.xxx.supabase.co:5432/postgres` |
| `SECRET_KEY` | (any random 64-char string, use: `openssl rand -hex 32`) |
| `ALLOWED_ORIGINS` | `https://solstice-school.vercel.app` |
| `REDIS_URL` | (leave empty for now, or use [upstash.com](https://upstash.com) free Redis) |

5. Click **Create Web Service** → Wait for deployment (5-10 minutes)
6. Your backend will be at: `https://solstice-school-api.onrender.com`

---

## Step 4: Deploy Frontend to Vercel — 3 minutes

### 4.1 Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
2. Click **Add New** → **Project**
3. Import your `solstice-school` repo
4. Settings:
   - **Root Directory:** `frontend`
   - **Framework:** Next.js (auto-detected)

### 4.2 Add Environment Variables on Vercel
Click **Environment Variables** → Add:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | `https://solstice-school-api.onrender.com/api/v1` |
| `NEXT_PUBLIC_APP_NAME` | `Solstice School` |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | (your Firebase API key) |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | (your Firebase auth domain) |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | (your Firebase project ID) |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | (your Firebase storage bucket) |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | (your Firebase sender ID) |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | (your Firebase app ID) |

5. Click **Deploy** → Wait 2-3 minutes
6. Your site is live at: `https://solstice-school.vercel.app` 🎉

### 4.3 Update Firebase Authorized Domains
1. Go back to [Firebase Console](https://console.firebase.google.com)
2. **Authentication** → **Settings** → **Authorized domains**
3. Click **Add domain** → Add `solstice-school.vercel.app`

### 4.4 Update Render CORS
1. Go to Render → Your service → Environment
2. Update `ALLOWED_ORIGINS` to: `https://solstice-school.vercel.app`

---

## Done! Your Deployment Architecture

```
    Users (Phone/Laptop/Tablet)
            │
            ▼
  ┌─────────────────────┐
  │   Vercel (Frontend)  │  FREE
  │   solstice.vercel.app│
  └─────────┬───────────┘
            │ API calls
            ▼
  ┌─────────────────────┐
  │   Render (Backend)   │  FREE
  │   FastAPI + Python   │
  └─────────┬───────────┘
            │
     ┌──────┴──────┐
     ▼              ▼
┌─────────┐  ┌───────────┐
│Supabase │  │ Firebase  │
│PostgreSQL│  │Google Auth│
│ 500MB   │  │   FREE    │
│  FREE   │  └───────────┘
└─────────┘

Monthly Cost: ₹0
```

---

## Quick Reference — All URLs You'll Need

| Service | URL | Purpose |
|---------|-----|---------|
| Firebase Console | console.firebase.google.com | Google Auth setup |
| Supabase Dashboard | supabase.com/dashboard | Database management |
| Render Dashboard | dashboard.render.com | Backend logs/config |
| Vercel Dashboard | vercel.com/dashboard | Frontend deployment |
| Your Live Site | solstice-school.vercel.app | The actual website |

---

## Troubleshooting

### "Google Sign-In not working"
- Check Firebase config values in `.env.local`
- Ensure Google sign-in is **enabled** in Firebase Authentication
- Add your domain to Firebase **Authorized domains**

### "API calls failing"
- Check Render backend logs for errors
- Verify `NEXT_PUBLIC_API_URL` in Vercel matches your Render URL
- Check `ALLOWED_ORIGINS` on Render includes your Vercel URL

### "Database connection error"
- Verify Supabase connection string has correct password
- Use `postgresql+asyncpg://` for `DATABASE_URL` (not plain `postgresql://`)
- Check Supabase is not paused (free tier pauses after 7 days of inactivity)

### Preview page not using backend?
The `/preview` page works **independently** with localStorage. 
For the full backend-connected dashboard, use `/login` and `/dashboard/*` routes.

---

## ⏱️ Total Time: ~15 minutes | 💰 Total Cost: ₹0/month
