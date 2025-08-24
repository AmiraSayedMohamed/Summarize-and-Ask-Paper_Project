import os
from dotenv import load_dotenv
import uuid
import json
import shutil
import traceback
from typing import Dict, Any, List, Optional

import os
import uuid
import json
import shutil
from typing import Dict, Any, List, Optional

from fastapi import FastAPI, UploadFile, File, HTTPException, Body, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, PlainTextResponse
from starlette.staticfiles import StaticFiles

import pdfplumber
import openai

from backend.job_queue import start_job, get_job_status
from backend.chat_utils import extract_texts_from_files, build_ieee_reference_prompt
from backend.groq_rag import chunk_text, index_file_chunks, _call_groq_embeddings, search, _call_groq_generate


app = FastAPI()

# Load .env from backend directory (if present)
# ROOT is defined below; defer loading until after ROOT is set

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Upload directory and static mount
ROOT = os.path.dirname(__file__)
UPLOAD_DIR = os.path.join(ROOT, "uploaded_pdfs")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploaded_pdfs", StaticFiles(directory=UPLOAD_DIR), name="uploaded_pdfs")

# now load .env so environment variables from backend/.env are available
load_dotenv(os.path.join(ROOT, '.env'))


def call_openai_chat(prompt: str) -> str:
    """Small wrapper that supports old and new openai python clients and returns text.
    Returns an empty string when no API key is set, or a string starting with
    '[OpenAI error:' on exception.
    """
    openai_key = os.environ.get("OPENAI_API_KEY")
    if not openai_key:
        return ""
    # construct modern v1 client explicitly with api key and call the chat completions API
    try:
        if not hasattr(openai, 'OpenAI'):
            return ""
        try:
            client = openai.OpenAI(api_key=openai_key)
        except Exception:
            client = openai.OpenAI()

        # prefer client.chat.create, fallback to client.chat.completions.create
        resp = None
        try:
            resp = client.chat.create(
                model=os.environ.get("OPENAI_MODEL", "gpt-4o"),
                messages=[{"role": "system", "content": "You are an academic assistant."}, {"role": "user", "content": prompt}],
                max_tokens=1500,
            )
        except Exception:
            resp = client.chat.completions.create(
                model=os.environ.get("OPENAI_MODEL", "gpt-4o"),
                messages=[{"role": "system", "content": "You are an academic assistant."}, {"role": "user", "content": prompt}],
                max_tokens=1500,
            )

        # normalize choices
        choices = None
        if isinstance(resp, dict):
            choices = resp.get('choices', [])
        else:
            choices = getattr(resp, 'choices', None) or []

        if not choices:
            return ''
        choice = choices[0]
        # extract content robustly
        if isinstance(choice, dict):
            msg = choice.get('message')
            if isinstance(msg, dict) and msg.get('content'):
                return msg.get('content', '')
            if choice.get('text'):
                return choice.get('text', '')
        else:
            # object-like access
            msg = getattr(choice, 'message', None)
            if isinstance(msg, dict) and msg.get('content'):
                return msg.get('content', '')
            if hasattr(msg, 'content'):
                return getattr(msg, 'content', '') or ''
            if hasattr(choice, 'text'):
                return getattr(choice, 'text', '') or ''
        return ''
    except Exception as e:
        return f"[OpenAI error: {e}]"


def build_page_anchors_for_file(file_path: str, max_pages_per_file: int = 20) -> List[Dict[str, Any]]:
    anchors: List[Dict[str, Any]] = []
    try:
        with pdfplumber.open(file_path) as pdf:
            for i, page in enumerate(pdf.pages[:max_pages_per_file]):
                try:
                    words = page.extract_words()
                except Exception:
                    words = []
                if not words:
                    continue
                # create multiple anchors by grouping consecutive words to improve precision
                page_width = float(getattr(page, 'width', 1.0)) or 1.0
                page_height = float(getattr(page, 'height', 1.0)) or 1.0
                group_size = 6
                for g in range(0, len(words), group_size):
                    group = words[g:g+group_size]
                    try:
                        x0 = min(float(w.get("x0", 0)) for w in group)
                        x1 = max(float(w.get("x1", 0)) for w in group)
                        top = min(float(w.get("top", 0)) for w in group)
                        bottom = max(float(w.get("bottom", 0)) for w in group)
                    except Exception:
                        continue
                    anchors.append({
                        "id": len(anchors),
                        "page": i + 1,
                        "bbox": {"x0": x0, "y0": top, "x1": x1, "y1": bottom},
                        "page_dim": {"width": page_width, "height": page_height},
                        "bbox_norm": {"x0": x0 / page_width, "y0": top / page_height, "x1": x1 / page_width, "y1": bottom / page_height},
                    })
    except Exception as e:
        print("build anchors error:", e)
    return anchors


def _ensure_paper_texts_dict(paper_texts: Dict[str, Any]) -> Dict[str, Dict[str, Any]]:
    """Normalize the output of extract_texts_from_files to a dict of {file_id: {title, pages:list}}.
    If values are strings or malformed, wrap them into a dict with pages list containing that string.
    """
    normalized: Dict[str, Dict[str, Any]] = {}
    for fid, info in (paper_texts or {}).items():
        if isinstance(info, dict):
            title = info.get('title', fid)
            pages = info.get('pages', []) or []
            # ensure pages is a list of strings
            if not isinstance(pages, list):
                pages = [str(pages)]
            pages = [str(p or '') for p in pages]
            normalized[fid] = {'title': title, 'pages': pages}
        else:
            # wrap string or other types
            normalized[fid] = {'title': str(fid), 'pages': [str(info)]}
    return normalized


def _pages_from_info(info: Any) -> List[str]:
    if isinstance(info, dict):
        pages = info.get('pages', []) or []
        if not isinstance(pages, list):
            return [str(pages)]
        return [str(p or '') for p in pages]
    return [str(info)]


def _safe_title(info: Any, fallback: str = '') -> str:
    if isinstance(info, dict):
        return str(info.get('title', fallback) or fallback)
    return str(fallback or info)


def _safe_pages(info: Any) -> List[str]:
    # reuse _pages_from_info semantics but ensure list of strings
    pages = _pages_from_info(info)
    if not isinstance(pages, list):
        return [str(pages)]
    return [str(p or '') for p in pages]


def _normalize_files_list(files: Any) -> List[tuple]:
    """
    Ensure we have a list of (file_id, file_path) tuples. Accepts several input shapes
    (dict.items list, list of tuples, or other). For any missing/empty paths, assume
    the file lives in UPLOAD_DIR/<file_id> so downstream code doesn't receive an empty string.
    """
    normalized: List[tuple] = []
    if not files:
        return normalized
    # if it's a dict-like mapping
    if isinstance(files, dict):
        items = list(files.items())
    else:
        try:
            items = list(files)
        except Exception:
            return normalized

    for it in items:
        try:
            if isinstance(it, tuple) or isinstance(it, list):
                fid = str(it[0])
                path = it[1] if len(it) > 1 else ''
            else:
                # single scalar: treat as file id and assume path in UPLOAD_DIR
                fid = str(it)
                path = ''
        except Exception:
            continue
        # Normalize common shapes where frontend sends a public_url or a leading-slash path
        if not path:
            path = os.path.join(UPLOAD_DIR, fid)
        else:
            p = str(path)
            # If path is a public URL path like '/uploaded_pdfs/xxx.pdf' or 'uploaded_pdfs/xxx.pdf'
            # or a full http(s) URL, convert it to the filesystem path under UPLOAD_DIR
            try:
                if p.startswith('/uploaded_pdfs/') or p.startswith('uploaded_pdfs/') or p.startswith('/uploaded_pdfs'):
                    basename = os.path.basename(p)
                    path = os.path.join(UPLOAD_DIR, basename)
                elif p.startswith('http://') or p.startswith('https://'):
                    basename = os.path.basename(p)
                    path = os.path.join(UPLOAD_DIR, basename)
                elif p.startswith('/') and p.endswith('.pdf'):
                    # generic leading-slash pdf path
                    basename = os.path.basename(p)
                    path = os.path.join(UPLOAD_DIR, basename)
            except Exception:
                # fallback: leave path as-is
                pass
        normalized.append((fid, path))
    return normalized


@app.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    try:
        ext = os.path.splitext(file.filename)[1] or ".pdf"
        # Basic server-side validation
        if ext.lower() != ".pdf" or (hasattr(file, 'content_type') and file.content_type and 'pdf' not in file.content_type.lower()):
            raise HTTPException(status_code=400, detail="PDF files only, max 50MB each")

        filename = f"{uuid.uuid4().hex}{ext}"
        dest_path = os.path.join(UPLOAD_DIR, filename)
        # Stream save to disk
        with open(dest_path, "wb") as out_f:
            shutil.copyfileobj(file.file, out_f)

        # Enforce max size (50 MB)
        try:
            size = os.path.getsize(dest_path)
            if size > 50 * 1024 * 1024:
                try:
                    os.remove(dest_path)
                except Exception:
                    pass
                raise HTTPException(status_code=400, detail="PDF files only, max 50MB each")
        except OSError:
            # if size can't be determined, allow for now
            pass

        # build anchors and save
        try:
            anchors = build_page_anchors_for_file(dest_path)
            anchors_path = os.path.join(UPLOAD_DIR, f"anchors_{filename}.json")
            with open(anchors_path, "w", encoding="utf-8") as af:
                json.dump({"anchors": anchors}, af)
        except Exception as e:
            print("anchors save failed:", e)

        public_url = f"/uploaded_pdfs/{filename}"
        return {"file_path": dest_path, "public_url": public_url, "file_id": filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/anchors/{file_id}")
async def get_anchors(file_id: str):
    anchors_path = os.path.join(UPLOAD_DIR, f"anchors_{file_id}.json")
    if not os.path.exists(anchors_path):
        return {"anchors": []}
    try:
        with open(anchors_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data
    except Exception as e:
        return {"anchors": [], "error": str(e)}


@app.get("/viewer/{file_id}")
async def viewer_page(file_id: str):
    pdf_url = f"/uploaded_pdfs/{file_id}"
    # Keep JS braces un-interpolated by using placeholders and then replacing
    html = """<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>PDF Viewer</title>
    <style>
      body { margin:0; padding:0; }
      #viewer { position:relative; width: 100vw; height: 100vh; overflow:auto; background:#777; }
      canvas.pdf-canvas { display:block; margin:0 auto; }
      .anchor-rect { position:absolute; border:2px solid rgba(255,0,0,0.8); background: rgba(255,0,0,0.12); pointer-events:none; }
    </style>
  </head>
  <body>
    <div id="viewer"></div>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.14.305/pdf.min.js"></script>
    <script>
      const url = 'PDF_URL_PLACEHOLDER';
      const fileId = 'FILE_ID_PLACEHOLDER';
      const viewer = document.getElementById('viewer');
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.14.305/pdf.worker.min.js';
      async function load() {
        const pdf = await pdfjsLib.getDocument(url).promise;
        const hashPage = (window.location.hash || '').replace('#page=','') || 1;
        const pageNumber = parseInt(hashPage,10) || 1;
        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({scale:1.5});
        const canvas = document.createElement('canvas');
        canvas.className = 'pdf-canvas';
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        viewer.appendChild(canvas);
        const ctx = canvas.getContext('2d');
        await page.render({canvasContext: ctx, viewport}).promise;
                try {
                    const res = await fetch(`/anchors/${fileId}`);
                    const data = await res.json();
                    const anchors = data.anchors || [];
                    // read anchor query param
                    const urlParams = new URLSearchParams(window.location.hash.replace('#',''));
                    const anchorParam = urlParams.get('anchor');
                    anchors.filter(a => a.page === pageNumber).forEach(a => {
                        const bbox = a.bbox;
                        const el = document.createElement('div');
                        el.className = 'anchor-rect';
                        // set id attribute for direct selection
                        if (a.id !== undefined && a.id !== null) el.setAttribute('data-anchor-id', String(a.id));
                        const x = bbox.x0 * (canvas.width / viewport.width);
                        const y = bbox.y0 * (canvas.height / viewport.height);
                        const w = (bbox.x1 - bbox.x0) * (canvas.width / viewport.width);
                        const h = (bbox.y1 - bbox.y0) * (canvas.height / viewport.height);
                        el.style.left = x + 'px';
                        el.style.top = y + 'px';
                        el.style.width = Math.max(10, w) + 'px';
                        el.style.height = Math.max(8, h) + 'px';
                        el.style.position = 'absolute';
                        viewer.style.position = 'relative';
                        viewer.appendChild(el);
                        // if this is the anchor requested, highlight and scroll
                        if (anchorParam && String(a.id) === String(anchorParam)) {
                            el.style.border = '3px solid rgba(0,200,0,0.9)';
                            el.style.background = 'rgba(0,200,0,0.12)';
                            // scroll canvas into view and offset to show the anchor
                            const rect = el.getBoundingClientRect();
                            window.scrollTo({ top: window.scrollY + rect.top - 100, behavior: 'smooth' });
                        }
                    });
                } catch(e){ console.error(e); }
      }
      load().catch(e=>{console.error('viewer error',e)});
    </script>
  </body>
</html>"""
    html = html.replace('PDF_URL_PLACEHOLDER', pdf_url).replace('FILE_ID_PLACEHOLDER', file_id)
    return HTMLResponse(content=html, status_code=200)


def analyze_papers_job(files, links, user_query=None):
    # files: list of (file_id, file_path)
    files = _normalize_files_list(files)
    try:
        paper_texts = extract_texts_from_files(files)
    except Exception as e:
        # defensive: if extractor fails, build minimal dict entries so callers can use .get safely
        paper_texts = {fid: {"title": fid, "pages": [f"[Error extracting file: {e}]"]} for fid, _ in files}
    paper_texts = _ensure_paper_texts_dict(paper_texts)
    combined = []
    for fid, info in paper_texts.items():
        # use safe accessors to avoid AttributeError when info is a string
        title = _safe_title(info, '')
        pages = _safe_pages(info)
        combined.append(f"[{fid}] {title}: " + " ".join(pages[:3]))
    all_text = "\n\n".join(combined)

    # set OpenAI key if provided
    openai_key = os.environ.get("OPENAI_API_KEY")
    # note: v1 client is constructed inside call_openai_chat with api_key

    # use module-level call_openai_chat

    if user_query:
        prompt = build_ieee_reference_prompt(paper_texts, user_query)
        answer = call_openai_chat(prompt)
        if not answer or answer.startswith('[OpenAI error:'):
            # fallback to local snippet summary
            snippets = []
            for fid, info in paper_texts.items():
                if isinstance(info, dict):
                    first = (_safe_pages(info)[0] or '').strip()
                else:
                    first = str(info)[:400]
                snippets.append(f"[{fid}] " + (first[:400] + ('...' if len(first) > 400 else '')))
            answer = "\n\n".join(snippets) or "[No text available]"

        refs = {}
        for i, (fid, info) in enumerate(paper_texts.items()):
            public_url = f"/uploaded_pdfs/{fid}"
            page_snippets = []
            pages_iter = _safe_pages(info)
            for pi, page_text in enumerate(pages_iter):
                if not page_text:
                    continue
                snippet = str(page_text).strip().replace('\n',' ')[:250]
                page_snippets.append({"page": pi+1, "snippet": snippet})
                if len(page_snippets) >= 3:
                    break
            refs[i+1] = {"file_id": fid, "public_url": public_url, "pages": page_snippets}
        return {"answer": answer, "references": refs}
    else:
        refs = {}
        summaries = {}
        formatted_parts = []
        for i, (fid, info) in enumerate(paper_texts.items()):
            public_url = f"/uploaded_pdfs/{fid}"
            pages = _safe_pages(info)
            first_page = (pages[0] or '').strip() if pages else ''
            # Improved heuristics:
            # - Title: look for lines in the first page that are likely title (longer than 3 words and uppercase/capitalized)
            # - Authors: lines after title up to a line that contains 'abstract' or is short/contains affiliation keywords
            # - Abstract: locate 'abstract' token and take the paragraph after it
            lines = [ln.strip() for ln in first_page.splitlines() if ln.strip()]
            title = ''
            authors = ''
            abstract = ''
            # find candidate title lines: prefer centered/capitalized lines (heuristic)
            for idx_ln, ln in enumerate(lines[:8]):
                words = ln.split()
                if len(words) >= 3 and sum(1 for w in words if w[0].isupper()) / max(1, len(words)) > 0.5:
                    title = ln
                    title_idx = idx_ln
                    break
            if not title and lines:
                title = lines[0]
                title_idx = 0

            # authors: take following 1-3 lines until an 'abstract' marker or a long dash or affiliation keywords
            author_lines = []
            for ln in lines[title_idx+1:title_idx+6]:
                lowln = ln.lower()
                if any(k in lowln for k in ['abstract', 'introduction', 'keywords']):
                    break
                if len(ln) < 200 and (',' in ln or ' and ' in ln or any(k in lowln for k in ['university', 'institute', 'lab', 'department', 'school'])):
                    author_lines.append(ln)
                elif len(author_lines) == 0 and 2 <= len(ln.split()) <= 6:
                    # possible author line even without commas
                    author_lines.append(ln)
                else:
                    # stop on long non-author content
                    if len(author_lines) > 0:
                        break
            authors = '; '.join(author_lines)

            # abstract: search 'abstract' token and extract following paragraph
            lowfull = first_page.lower()
            if 'abstract' in lowfull:
                aidx = lowfull.find('abstract')
                # take substring after the word 'abstract'
                aft = first_page[aidx:]
                # remove the header 'abstract' word and any colon
                aft = aft.split('\n', 1)[-1] if '\n' in aft else aft
                # heuristically take up to 1000 chars or until 'introduction'
                cut = aft
                li = cut.lower().find('introduction')
                if li >= 0:
                    cut = cut[:li]
                abstract = cut.replace('\n', ' ').strip()[:1200]
            else:
                # attempt to find an abstract-like paragraph within first 2 pages
                joined = '\n\n'.join(pages[:2])
                lowj = joined.lower()
                if 'abstract' in lowj:
                    aidx = lowj.find('abstract')
                    cut = joined[aidx:]
                    li = cut.lower().find('introduction')
                    if li >= 0:
                        cut = cut[:li]
                    abstract = cut.replace('\n', ' ').strip()[:1200]

            # create lightweight local summary from first page text
            one_sentence = ''
            if first_page:
                # pick first 2 sentences as short summary
                sents = first_page.replace('\n', ' ').split('.')
                sents = [s.strip() for s in sents if s.strip()]
                if sents:
                    one_sentence = (sents[0] + ('.' if not sents[0].endswith('.') else ''))
                    if len(sents) > 1:
                        one_sentence = one_sentence + ' ' + sents[1][:200] + ('.' if not sents[1].endswith('.') else '')

            methods = ''
            findings = ''
            # look for simple keywords for methods/findings in the whole pages text
            full_text = '\n\n'.join(pages)
            lowfull = full_text.lower()
            for kw in ['methods', 'methodology', 'materials and methods', 'approach']:
                if kw in lowfull:
                    start = lowfull.find(kw)
                    methods = full_text[start:start+600].replace('\n', ' ').strip()
                    break
            for kw in ['results', 'findings', 'conclusion', 'conclusions']:
                if kw in lowfull:
                    start = lowfull.find(kw)
                    findings = full_text[start:start+600].replace('\n', ' ').strip()
                    break

            # construct formatted summary for this paper
            part_lines = []
            part_lines.append(f"Title: {title}")
            if authors:
                part_lines.append(f"Authors: {authors}")
            if abstract:
                part_lines.append(f"Abstract (excerpt): {abstract[:800]}")
            if one_sentence:
                part_lines.append(f"One-line summary: {one_sentence}")
            if methods:
                part_lines.append(f"Methods (excerpt): {methods[:500]}")
            if findings:
                part_lines.append(f"Key findings (excerpt): {findings[:500]}")
            part_lines.append(f"Link: {public_url}")
            formatted = "\n".join(part_lines)
            formatted_parts.append(formatted)

            snippet = (pages[0] or '')[:250]
            # try to find anchors file and include nearest anchor id for better navigation
            anchors_path = os.path.join(UPLOAD_DIR, f"anchors_{fid}.json")
            anchor_id = None
            try:
                if os.path.exists(anchors_path):
                    with open(anchors_path, 'r', encoding='utf-8') as af:
                        data = json.load(af)
                        anchors_list = data.get('anchors') or []
                        # pick first anchor on page 1 if present
                        for a in anchors_list:
                            if a.get('page') == 1:
                                anchor_id = a.get('id')
                                break
            except Exception:
                anchor_id = None

            ref_entry = {"file_id": fid, "public_url": public_url, "pages": [{"page": 1, "snippet": snippet}]}
            if anchor_id is not None:
                ref_entry['anchor_id'] = anchor_id
            refs[i+1] = ref_entry
            summaries[fid] = {"title": title, "authors": authors, "abstract": abstract, "one_line": one_sentence}

        formatted_text = "\n\n-----\n\n".join(formatted_parts) if formatted_parts else all_text
        return {"text": formatted_text, "references": refs, "summaries": summaries}


@app.post("/start-analysis-job/")
async def start_analysis_job(req: Dict = Body(...)):
    # coerce body to mapping to avoid AttributeError when clients send malformed bodies
    if not isinstance(req, dict):
        try:
            req = json.loads(req) if isinstance(req, str) else dict(req)
        except Exception:
            req = {}
    files = req.get('files', {})
    links = req.get('links', [])
    user_query = req.get('user_query')
    # files expected as {file_id: file_path}
    # normalize files into list of tuples before starting job
    job_files = _normalize_files_list(files)
    job_id = start_job(analyze_papers_job, job_files, links, user_query)
    return {"job_id": job_id}


@app.post("/start-analysis-job-sync/")
async def start_analysis_job_sync(req: Dict = Body(...)):
    """Run the analysis synchronously for debugging (development only)."""
    if not isinstance(req, dict):
        try:
            req = json.loads(req) if isinstance(req, str) else dict(req)
        except Exception:
            req = {}
    files = req.get('files', {})
    links = req.get('links', [])
    user_query = req.get('user_query')
    try:
        res = analyze_papers_job(_normalize_files_list(files), links, user_query)
        return {"status": "ok", "result": res}
    except Exception as e:
        import traceback as _tb
        return {"status": "error", "error": str(e), "traceback": _tb.format_exc()}


@app.get("/job-status/{job_id}")
async def job_status(job_id: str):
    return get_job_status(job_id)


@app.get("/debug/job/{job_id}")
async def debug_job(job_id: str):
    """Development-only endpoint to return the raw job dict including traceback."""
    from backend import job_queue
    return job_queue.jobs.get(job_id, {"status": "not_found"})


@app.post("/chat-with-papers/")
async def chat_with_papers(req: Dict = Body(...)):
    # coerce body to mapping to avoid AttributeError when clients send malformed bodies
    if not isinstance(req, dict):
        try:
            req = json.loads(req) if isinstance(req, str) else dict(req)
        except Exception:
            req = {}
    user_query = req.get('user_query', '')
    paper_files = req.get('paper_files', {})
    # Normalize incoming paper_files (accepts public URLs like '/uploaded_pdfs/x.pdf' or http(s) URLs)
    files_for_extraction = _normalize_files_list(paper_files)

    paper_texts = extract_texts_from_files(files_for_extraction)
    paper_texts = _ensure_paper_texts_dict(paper_texts)
    prompt = build_ieee_reference_prompt(paper_texts, user_query)

    openai_key = os.environ.get("OPENAI_API_KEY")
    if openai_key:
        openai.api_key = openai_key

    # call the module-level OpenAI wrapper
    answer = call_openai_chat(prompt)
    if not answer or answer.startswith('[OpenAI error:'):
        snippets = []
        for fid, info in paper_texts.items():
            first = (_safe_pages(info)[0] or '').strip()
            snippets.append(f"[{fid}] " + (first[:400] + ('...' if len(first) > 400 else '')))
        answer = "\n\n".join(snippets) or answer

    refs = {}
    for i, fid in enumerate(paper_files.keys()):
        refs[i+1] = {"file_id": fid, "public_url": f"/uploaded_pdfs/{fid}", "pages": [{"page": 1}]}

    return {"answer": answer, "references": refs}


@app.post("/index-papers/")
async def index_papers(req: Dict = Body(...)):
    """Index uploaded papers for RAG. Body: { files: {file_id: file_path}, chunk_size?:int }"""
    if not isinstance(req, dict):
        try:
            req = json.loads(req) if isinstance(req, str) else dict(req)
        except Exception:
            req = {}
    files = req.get('files', {})
    chunk_size = int(req.get('chunk_size') or 800)
    files_list = _normalize_files_list(files)
    # extract texts
    paper_texts = extract_texts_from_files(files_list)
    paper_texts = _ensure_paper_texts_dict(paper_texts)
    results = {}
    for fid, info in paper_texts.items():
        pages = _safe_pages(info)
        # join pages into a single text for chunking, but keep page metadata
        joined = '\n\n'.join([p for p in pages if p])
        chunks = chunk_text(joined, chunk_size=chunk_size, overlap=int(chunk_size*0.25))
        metas = [{"file_id": fid, "page": None, "source": fid, "title": _safe_title(info, fid)} for _ in chunks]
        try:
            count = index_file_chunks(fid, chunks, metas)
            results[fid] = {"chunks_indexed": count}
        except Exception as e:
            results[fid] = {"error": str(e)}
    return {"status": "ok", "results": results}


@app.post("/chat-with-papers-rag/")
async def chat_with_papers_rag(req: Dict = Body(...)):
    """RAG-based chat using Groq embeddings and generation. Body: { user_query: str, paper_files: {file_id: path} }"""
    if not isinstance(req, dict):
        try:
            req = json.loads(req) if isinstance(req, str) else dict(req)
        except Exception:
            req = {}
    user_query = req.get('user_query', '')
    paper_files = req.get('paper_files', {})
    files_list = _normalize_files_list(paper_files)
    file_ids = [fid for fid, _ in files_list]
    # embed query
    try:
        query_emb = _call_groq_embeddings([user_query])[0]
    except Exception as e:
        return {"error": f"Embedding error: {e}"}
    # search
    hits = search(file_ids, query_emb, top_k=6)
    # build prompt
    snippets = []
    ref_map = {}
    for i, h in enumerate(hits, start=1):
        meta = h.get('meta') or {}
        fid = meta.get('file_id') or meta.get('source') or 'unknown'
        snippets.append(f"[{i}] {fid}: \"{(h.get('text') or '')[:400].replace('\n',' ')}\"")
        ref_map[i] = {"file_id": fid, "meta": meta}
    prompt = "You are an assistant. Use only the snippets below to answer the user's question. Cite snippets using numbered brackets like [1].\n\nSnippets:\n" + "\n".join(snippets) + f"\n\nUser question: {user_query}\n\nAnswer concisely and include citation brackets."
    try:
        answer = _call_groq_generate(prompt)
    except Exception as e:
        return {"error": f"Generation error: {e}", "refs": ref_map}
    return {"answer": answer, "references": ref_map}


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    # simple handler to help debugging while developing
    tb = ''.join(exc.__class__.__name__ + ': ' + str(exc) + '\n')
    print('Unhandled exception:', exc)
    return PlainTextResponse(str(exc), status_code=500)
