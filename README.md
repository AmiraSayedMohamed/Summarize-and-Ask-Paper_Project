# ResearchAI — Scientific Literature Analysis Platform

 project link:
https://summarize-paper-and-ask-it.vercel.app
![Website Image](path/to/image.png](https://github.com/AmiraSayedMohamed/Summarize-and-Ask-Paper_Project/blob/master/TransformScientific-image-website.jpg)


This repository contains ResearchAI, an AI-powered web application for analyzing scientific PDFs, extracting anchors and structured summaries, and providing an LLM-powered chat interface with clickable citations and a RAG (retrieval-augmented generation) pipeline.

## Project aim
- Allow users to upload scientific PDFs, automatically extract text and page-level anchors, and perform background analysis to produce readable summaries (title, authors, abstract excerpt, methods, findings).
- Provide an interactive chat interface that answers user questions about uploaded papers and links each citation to the exact location (page/anchor) in the PDF viewer.
- Improve answer accuracy and latency using a RAG pipeline (Groq-based embeddings/search and generation). The system ships with local fallbacks for offline development.

## High-level architecture
- Frontend: Next.js application (app directory, React/TSX components) that handles file upload, project dashboards, chat UI, and viewer with clickable anchors.
- Backend: FastAPI (Python) that accepts file uploads, builds anchors, runs analysis jobs (sync and background), offers chat endpoints, and supports a Groq-based RAG helper for embeddings, indexing and retrieval.
- Index storage: simple per-file JSON indexes under `backend/index/` (vector entries + metadata).

## Main technologies and libraries used
- Frontend
  - Next.js (App Router) — React pages/components live in the `app/` and `components/` directories. Server-side rendering + client components are used.
  - React / TypeScript — components are `.tsx` files; typed props and components in the codebase.
  - pnpm — package manager used for frontend dependencies and scripts.
  - Modern CSS pipeline — global styles in `app/globals.css` and component styles. Fonts use `next/font/google`.

- Backend
  - Python 3.x with FastAPI — provides REST endpoints and viewer pages (`backend/main.py`).
  - Uvicorn — ASGI server for development and deployment.
  - Requests — used for calling external APIs (e.g., Groq endpoints) from `backend/groq_rag.py`.
  - pdf text extraction utilities (project uses helpers to read PDF pages and build anchors; sample code references pdf extraction logic).

- Retrieval & LLM integration
  - Groq (optional, production RAG): helper `backend/groq_rag.py` implements chunking, Groq embeddings/generation wrappers, local JSON index upsert, and cosine-similarity search.
  - Local fallbacks: a deterministic local embedding and a tiny generator are implemented for offline development if `GROQ_API_KEY` is not provided.
  - Prompt construction and citation mapping is performed server-side in chat endpoints.

## Key files and directories
- `app/` — Next.js app pages and top-level layout (`app/layout.tsx`, `app/page.tsx`, and `app/dashboard/...`).
- `components/` — Reusable UI components, e.g., upload zone, chat UI, viewer highlight, dashboard widgets.
- `backend/` — Python backend code and helpers.
  - `backend/main.py` — FastAPI application with endpoints for upload, analysis, viewer, chat and RAG endpoints (`/index-papers/`, `/chat-with-papers-rag/`).
  - `backend/groq_rag.py` — RAG helper: chunking, embeddings/generation wrappers, indexing, and search. Includes local fallbacks when Groq key is absent.
  - `backend/index/` — JSON index files (created by `index_file_chunks` / `/index-papers/`).
  - `backend/uvicorn_out.log` (if present) — server logs when running with uvicorn.

## Environment variables
- `GROQ_API_KEY` — (optional) API key for Groq. If set, `backend/groq_rag.py` will call Groq embedding and generate endpoints. If not set, the code uses local deterministic fallbacks for offline testing.
- `GROQ_EMBEDDING_URL`, `GROQ_GENERATE_URL` — optional override endpoints for Groq embedding/generation APIs.
- Other env vars (not committed): any API keys for OpenAI or other LLMs if you decide to use them.

> Security: Never commit API keys. Use your environment, .env loader, or orchestration secrets.

## How to run (development)
Prerequisites: Node & pnpm installed (frontend), Python 3.x and virtualenv for backend.

1) Start the frontend (from repo root):

```powershell
cd D:\projects\v1
pnpm dev
```

Default URL: http://localhost:3000/ (Next may prompt to use a different port if 3000 is in use).

2) Start the backend (from repo root; ensures `backend` package is importable):

```powershell
cd D:\projects\v1
# If you have a venv, prefer its python; otherwise use system python
backend\venv\Scripts\python.exe -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

Backend API base: http://127.0.0.1:8000/

Useful endpoints
- `POST /index-papers/` — create vector index for files (body: { files: {file_id: file_path}, chunk_size?:int })
- `POST /chat-with-papers-rag/` — RAG-based chat (body: { user_query: str, paper_files: {file_id: path} })
- `/viewer/<file_id>` — viewer page for a PDF with anchors (served by backend viewer route).

## Speed & performance tips
- Index papers once (use `/index-papers/`) so chat queries reuse embeddings and are much faster.
- Tune `chunk_size` and `overlap` when indexing: smaller `chunk_size` (e.g., 400) and lower overlap (e.g., 100) speeds up embeddings but may affect retrieval granularity.
- Increase embedding batch size in `backend/groq_rag.py` (variable `B`) to reduce network calls when using a remote embedding API.
- Consider parallelizing indexing across files (ThreadPool/ProcessPool) to speed multi-file indexing.

## Notes on hydration error and recent fix
A client-side DOM class (`mdl-js`) was being injected after hydration and caused a Next.js hydration mismatch. A minimal fix was applied by adding `mdl-js` to the server-rendered `<html>` element in `app/layout.tsx` so server and client markup match. A longer-term fix is to remove the client-side mutation or move it into a client-only effect.

## Next improvements / TODO
- Improve RAG prompt engineering for IEEE-style citations and succinct answers.
- Map vector index entries back to precise PDF anchors/pages so chat responses link directly to viewer anchors.
- Add persistent database-backed index or an ANN index (FAISS / Milvus) for large-scale retrieval.
- Add tests for the extraction, indexing and chat endpoints.

## Contact / contribution
- The repo is set up for local development on Windows (commands above use PowerShell paths). If you'd like, I can:
  - Auto-index on upload (so indexing runs once during upload).
  - Parallelize indexing and increase embedding batch sizes.
  - Add production deployment notes (Docker, process manager) and CI.


