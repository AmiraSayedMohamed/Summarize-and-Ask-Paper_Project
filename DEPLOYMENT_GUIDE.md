# Deployment Guide

This guide explains how to deploy the project using the recommended stack:

## Frontend: Vercel
1. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```
2. Log in to Vercel:
   ```bash
   vercel login
   ```
3. Deploy the frontend:
   ```bash
   vercel --prod
   ```

## Backend: Railway
1. Install the Railway CLI:
   ```bash
   npm install -g railway
   ```
2. Log in to Railway:
   ```bash
   railway login
   ```
3. Create a new project and link it:
   ```bash
   railway init
   ```
4. Deploy the backend:
   ```bash
   railway up
   ```

## Database: MongoDB Atlas
1. Create a free cluster on MongoDB Atlas.
2. Add your connection string to the `.env` file under `MONGODB_URI`.

## File Storage: Supabase
1. Create a Supabase project.
2. Add your Supabase URL and API key to the `.env` file under `SUPABASE_URL` and `SUPABASE_KEY`.

## Final Steps
- Ensure all environment variables are correctly set in `.env`.
- Verify deployments by accessing the respective URLs.

---

**Note:**
- Keep `.env` and secrets out of git (already in .gitignore)
- For production, rotate keys and restrict CORS to your Vercel domain.
