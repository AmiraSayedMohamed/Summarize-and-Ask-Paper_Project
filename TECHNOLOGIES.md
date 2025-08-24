# Technologies Used in ResearchAI

This document lists and briefly describes the technologies used in the ResearchAI project, where each is used in the repository, and why it was chosen.

## Frontend

- Next.js (v15)
  - Location: `app/`, `components/`
  - Purpose: React-based framework for server-side rendering, routing (App Router), and static optimizations. Hosts UI pages (dashboard, upload, viewer).

- React (v19)
  - Location: `components/` (TSX files)
  - Purpose: UI library for building interactive components like the upload zone, chat UI, and viewer highlights.

- TypeScript
  - Location: `.tsx` files across `app/` and `components/`
  - Purpose: static typing for safer component contracts.

- pnpm
  - Purpose: package manager used to manage frontend dependencies and run scripts (see `package.json`).

- Tailwind CSS and utility ecosystem
  - Packages: `tailwindcss`, `autoprefixer`, `tailwind-merge`, `tailwindcss-animate`
  - Location: `styles/globals.css`, `postcss.config.mjs`
  - Purpose: Rapid utility-first styling and animations.

- Radix UI primitives
  - Packages: `@radix-ui/*` components
  - Purpose: accessible UI building blocks (dialogs, popovers, menus, etc.).

- UI helper libraries
  - `clsx`, `class-variance-authority`, `lucide-react`, `recharts`, `embla-carousel-react`, `sonner` (toasts)
  - Purpose: styling helpers, icons, charts, carousels, and notifications.

- react-hook-form and zod
  - Purpose: form handling and schema validation for forms (upload/register/login forms).

## Backend

- Python 3.x
  - Location: `backend/`
  - Purpose: server-side API and worker code for PDF processing, indexing and chat endpoints.

- FastAPI
  - Location: `backend/main.py`
  - Purpose: lightweight ASGI framework used to implement REST endpoints for file upload, analysis, viewer, and chat.

- Uvicorn
  - Purpose: ASGI server used to run the FastAPI app in development and production.

- Requests
  - Location: `backend/groq_rag.py`
  - Purpose: HTTP client library used to call Groq (or other) APIs for embeddings and generation.

- pdf parsing utilities (project helper files)
  - Location: `backend/` helper modules (e.g., `file-processing.py`, `pdf` helpers)
  - Purpose: extract page-wise text, compute anchor rectangles and metadata used for the viewer and citation mapping.

## RAG / LLM Integration

- Groq (optional)
  - Location: integration in `backend/groq_rag.py`
  - Purpose: production-grade embeddings and generation. The project expects a `GROQ_API_KEY` environment variable. Endpoints: `/index-papers/` and `/chat-with-papers-rag/` are provided to index and run RAG queries.

- Local fallbacks
  - Location: `backend/groq_rag.py`
  - Purpose: deterministic embedding and a tiny generator for offline testing when `GROQ_API_KEY` is not set.

- Simple JSON index files
  - Location: `backend/index/`
  - Purpose: store per-file vectors and metadata for retrieval (lightweight, suitable for dev/prototyping). Can be replaced with FAISS, Milvus, or other ANN backends for scale.

## Dev & Tooling

- Node.js ecosystem tools
  - `next`, `pnpm`, `postcss`, `tailwind` — used for frontend build and dev server.

- Python tooling
  - Virtualenv recommended for isolating Python deps (not included in repo). Use `python -m venv backend/venv` then `pip install -r requirements.txt` (create `requirements.txt` if needed).

- Storybook (optional)
  - Some components include stories (e.g., `components/analysis/analysis-results.stories.tsx`) for UI previewing.

## Storage & Data

- Uploaded PDFs: stored under a project-specific upload folder (see backend upload handler).
- Index files: stored under `backend/index/` as JSON files (`<file_id>.json`) — entries include `id`, `vector`, `text`, and `meta`.

## Recommended production/scale upgrades

- Replace JSON indexes with an ANN store (FAISS, Milvus, Pinecone, or Weaviate) for large document sets.
- Move file storage to S3/Blob storage for persistence and scale.
- Add worker queue (Redis + RQ / Celery / Dramatiq) for durable background processing of indexing and analysis jobs.
- Securely manage secrets with environment variables, Vault, or cloud secret managers.

## Where to look in the repo
- `app/layout.tsx` — top-level layout and font setup.
- `components/` — UI components (upload, chat, viewer highlight).
- `backend/main.py` — API endpoints and orchestration.
- `backend/groq_rag.py` — RAG helper.
- `backend/index/` — vector JSON index files.
- `README.md` — project overview and run instructions (added earlier).

---

If you want, I can also produce:
- A `requirements.txt` for the backend with pinned Python deps.
- A short `deploy.md` describing Docker/production steps.

Tell me which additional artifact you want next.
