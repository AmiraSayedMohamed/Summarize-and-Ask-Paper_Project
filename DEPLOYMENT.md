# Deployment Instructions

## Frontend Deployment (Vercel)
1. Ensure you have a Vercel account.
2. Link your GitHub repository to Vercel.
3. Add the following environment variables in Vercel:
   - `NEXT_PUBLIC_API_URL`: URL of the deployed backend.
4. Deploy the Next.js app.

## Backend Deployment (Railway)
1. Ensure you have a Railway account.
2. Create a new project and link your GitHub repository.
3. Add the following environment variables in Railway:
   - `MONGO_URI`: MongoDB connection string.
   - `SUPABASE_URL`: Supabase project URL.
   - `SUPABASE_KEY`: Supabase API key.
4. Deploy the FastAPI app.

## Database Setup (MongoDB Atlas)
1. Create a free-tier cluster on MongoDB Atlas.
2. Add a database user and whitelist your IP.
3. Copy the connection string and add it to your `.env` file as `MONGO_URI`.

## Storage Setup (Supabase)
1. Create a Supabase project.
2. Note the project URL and API key.
3. Add these to your `.env` file as `SUPABASE_URL` and `SUPABASE_KEY`.

## GitHub Repository
1. Push the entire project to GitHub.
2. Ensure `.env` is excluded using `.gitignore`.
