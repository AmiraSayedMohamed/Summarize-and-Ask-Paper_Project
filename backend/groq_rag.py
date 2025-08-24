import os
import json
import math
import uuid
from typing import List, Dict, Any

import requests

ROOT = os.path.dirname(__file__)
# Use /tmp for writable storage on container-based platforms like Hugging Face Spaces
INDEX_DIR = "/tmp/index"
os.makedirs(INDEX_DIR, exist_ok=True)


def chunk_text(text: str, chunk_size: int = 800, overlap: int = 200) -> List[str]:
    text = text or ""
    chunks: List[str] = []
    i = 0
    L = len(text)
    if L == 0:
        return []
    while i < L:
        end = min(i + chunk_size, L)
        chunks.append(text[i:end])
        i += chunk_size - overlap
    return chunks


def _call_groq_embeddings(texts: List[str]) -> List[List[float]]:
    key = os.environ.get("GROQ_API_KEY")
    if not key:
        # fallback to a deterministic local embedding for offline/dev testing
        return _dummy_embeddings(texts)
    url = os.environ.get("GROQ_EMBEDDING_URL", "https://api.groq.com/v1/embeddings")
    headers = {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}
    payload = {"input": texts}
    resp = requests.post(url, headers=headers, json=payload, timeout=30)
    resp.raise_for_status()
    data = resp.json()
    # try common response shapes
    embeddings: List[List[float]] = []
    if isinstance(data, dict):
        if "data" in data and isinstance(data["data"], list):
            for item in data["data"]:
                emb = item.get("embedding") or item.get("vector")
                if emb:
                    embeddings.append(emb)
        elif "embeddings" in data and isinstance(data["embeddings"], list):
            embeddings = data["embeddings"]
    if not embeddings or len(embeddings) != len(texts):
        raise RuntimeError(f"Unexpected embeddings response from Groq: {list(data.keys())}")
    return embeddings


def _call_groq_generate(prompt: str) -> str:
    key = os.environ.get("GROQ_API_KEY")
    if not key:
        # fallback to a local generator that returns an extractive summary of the prompt/snippets
        return _dummy_generate(prompt)
    url = os.environ.get("GROQ_GENERATE_URL", "https://api.groq.com/v1/generate")
    headers = {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}
    payload = {"prompt": prompt, "max_tokens": 512}
    resp = requests.post(url, headers=headers, json=payload, timeout=60)
    resp.raise_for_status()
    data = resp.json()
    # normalize response
    if isinstance(data, dict):
        if "output" in data and isinstance(data["output"], str):
            return data["output"]
        if "text" in data and isinstance(data["text"], str):
            return data["text"]
        if "choices" in data and isinstance(data["choices"], list) and data["choices"]:
            first = data["choices"][0]
            if isinstance(first, dict):
                return first.get("text") or (first.get("message") or {}).get("content") or json.dumps(first)
    return json.dumps(data)


def _dummy_embeddings(texts: List[str], dim: int = 64) -> List[List[float]]:
    """Deterministic lightweight embedding: hash-based vectors for offline testing."""
    import hashlib

    out: List[List[float]] = []
    for t in texts:
        h = hashlib.sha256((t or "").encode("utf-8")).digest()
        vec = []
        # produce 'dim' floats from the digest (repeat if needed)
        i = 0
        while len(vec) < dim:
            chunk = h[(i * 4) % len(h) : ((i + 1) * 4) % len(h)]
            if not chunk:
                chunk = h[0:4]
            val = int.from_bytes(chunk, "big") / float(2 ** 32)
            vec.append(val)
            i += 1
        out.append(vec[:dim])
    return out


def _dummy_generate(prompt: str, max_len: int = 512) -> str:
    """Very small generator that extracts and returns the top snippets from the prompt for offline testing."""
    # naive heuristic: find 'Snippets:' section and return concatenated snippets up to max_len
    marker = "Snippets:"
    if marker in prompt:
        tail = prompt.split(marker, 1)[1]
        # take first few lines as the 'answer'
        lines = [l.strip() for l in tail.splitlines() if l.strip()]
        # pick lines that look like snippets (start with [n])
        picks = [l for l in lines if l.startswith("[")][:6]
        out = " \n".join(picks)
        if not out:
            out = " ".join(lines[:6])
        return (out[:max_len]).strip()
    # fallback: simple echo of user question
    qmark = "User question:"
    if qmark in prompt:
        return prompt.split(qmark, 1)[1].strip()[:max_len]
    return prompt[:max_len]


def upsert_index(file_id: str, entries: List[Dict[str, Any]]) -> int:
    """Write index entries for a file as JSON. entries is list of {'id','vector','text','meta'}"""
    path = os.path.join(INDEX_DIR, f"{file_id}.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(entries, f, ensure_ascii=False)
    return len(entries)


def load_index_for_files(file_ids: List[str]) -> List[Dict[str, Any]]:
    out: List[Dict[str, Any]] = []
    for fid in file_ids:
        path = os.path.join(INDEX_DIR, f"{fid}.json")
        if not os.path.exists(path):
            continue
        try:
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
                out.extend(data)
        except Exception:
            continue
    return out


def _cosine(a: List[float], b: List[float]) -> float:
    if not a or not b:
        return 0.0
    dot = sum(x * y for x, y in zip(a, b))
    na = math.sqrt(sum(x * x for x in a))
    nb = math.sqrt(sum(y * y for y in b))
    if na == 0 or nb == 0:
        return 0.0
    return dot / (na * nb)


def search(file_ids: List[str], query_embedding: List[float], top_k: int = 5) -> List[Dict[str, Any]]:
    candidates = load_index_for_files(file_ids)
    scored = []
    for c in candidates:
        vec = c.get("vector")
        if not isinstance(vec, list):
            continue
        score = _cosine(query_embedding, vec)
        scored.append((score, c))
    scored.sort(key=lambda x: x[0], reverse=True)
    results = []
    for s, c in scored[:top_k]:
        results.append({"score": s, "id": c.get("id"), "text": c.get("text"), "meta": c.get("meta")})
    return results


def index_file_chunks(file_id: str, chunks: List[str], metas: List[Dict[str, Any]]) -> int:
    if not chunks:
        return 0
    # call embeddings in batches
    B = 64
    embeddings: List[List[float]] = []
    for i in range(0, len(chunks), B):
        batch = chunks[i : i + B]
        embs = _call_groq_embeddings(batch)
        embeddings.extend(embs)
    entries = []
    for i, (ch, emb, meta) in enumerate(zip(chunks, embeddings, metas)):
        entries.append({"id": f"{file_id}_{i}", "vector": emb, "text": ch, "meta": meta})
    upsert_index(file_id, entries)
    return len(entries)
