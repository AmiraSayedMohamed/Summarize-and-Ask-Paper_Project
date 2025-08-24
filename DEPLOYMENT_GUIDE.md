# Deployment Guide: Vercel (Frontend), Railway (Backend), MongoDB Atlas, Supabase Storage

## 1. Frontend (Vercel)
- Sign up at https://vercel.com (no credit card needed)
- Connect your repo, set env var `NEXT_PUBLIC_API_BASE` to your backend URL
- Deploy (Vercel auto-builds Next.js)

## 2. Backend (Railway)
- Sign up at https://railway.app (no credit card needed)
- Create a new project, link your backend repo
- Set env vars:
  - `MONGODB_URI` (from MongoDB Atlas)
  - `MONGODB_DB` (e.g., researchai)
  - `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` (from Supabase)
  - `OPENAI_API_KEY`, `GROQ_API_KEY` (if used)
- Deploy (Railway auto-builds Dockerfile)

## 3. Database (MongoDB Atlas)
- Sign up at https://cloud.mongodb.com
- Create a free cluster, DB, and user
- Get connection string for `MONGODB_URI`

## 4. File Storage (Supabase)
- Sign up at https://supabase.com
- Create a project, enable Storage, create a bucket (e.g., pdfs)
- Get `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`

## 5. Push to GitHub
- Initialize git if needed:
  ```powershell
  git init
  git remote add origin https://github.com/AmiraSayedMohamed/Summarize-and-Ask-Paper_Project.git
  git add .
  git commit -m "Initial deployable version"
  git push -u origin main
  ```

## 6. Test
- Open your Vercel and Railway URLs, upload a PDF, check DB and storage.

---

**Note:**
- Keep `.env` and secrets out of git (already in .gitignore)
- For production, rotate keys and restrict CORS to your Vercel domain.
