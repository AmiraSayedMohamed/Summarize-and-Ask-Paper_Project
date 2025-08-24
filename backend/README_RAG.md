This file documents the Groq-based RAG endpoints added to the FastAPI backend.

Endpoints

- POST /index-papers/
  - Body: { files: { file_id: file_path }, chunk_size?: int }
  - Action: Reads text for each file (uses existing text-extraction helpers), chunks the text, calls Groq embeddings (or a local fallback if GROQ_API_KEY is not set), and writes a JSON index to backend/index/<file_id>.json
  - Response: { status: 'ok', results: { <file_id>: { chunks_indexed: N } } }

- POST /chat-with-papers-rag/
  - Body: { user_query: str, paper_files: { file_id: file_path } }
  - Action: Embeds the query, searches the local JSON indexes for top-k chunks, builds a prompt with snippets, and calls Groq generation (or local fallback if GROQ_API_KEY missing). Returns answer + references map.
  - Response: { answer: str, references: { n: { file_id, meta } } }

Environment

- To use real Groq APIs set:
  - GROQ_API_KEY
  - Optionally: GROQ_EMBEDDING_URL and GROQ_GENERATE_URL

Local fallback

- If GROQ_API_KEY is not set the code uses deterministic local embedding and a simple generator for development and testing. This is NOT a substitute for Groq's models but allows offline testing.

Security

- Do NOT commit GROQ_API_KEY to version control. Set it in your deployment environment or a local .env file loaded securely.
