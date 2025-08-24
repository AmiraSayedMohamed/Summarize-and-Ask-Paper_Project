import pdfplumber
from typing import List, Dict, Any
import os


def extract_texts_from_files(files: List) -> Dict[str, Dict[str, Any]]:
    """
    Given a list of (file_id, file_path), extract text per page and return a dict:
    { file_id: { 'title': filename, 'pages': [page_text, ...] } }
    This function is defensive: if a file can't be opened, it still returns a dict entry
    with an error message in the pages list.
    """
    result: Dict[str, Dict[str, Any]] = {}
    for file_id, file_path in files:
        try:
            pages: List[str] = []
            title = os.path.basename(file_path)
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    try:
                        text = page.extract_text() or ""
                    except Exception:
                        text = ""
                    pages.append(text)
            result[file_id] = {"title": title, "pages": pages}
        except Exception as e:
            # Always return a dict so callers can safely do info.get(...)
            result[file_id] = {"title": os.path.basename(str(file_path)), "pages": [f"[Error extracting text: {e}]"]}
    return result


def build_ieee_reference_prompt(paper_texts: Dict[str, Any], user_query: str, max_chars_per_paper: int = 8000) -> str:
    """
    Build a prompt for the LLM to answer the user query using only the provided papers,
    referencing them as [1], [2], ... in IEEE style.

    This function accepts paper_texts values that are either dicts with keys 'title' and
    'pages', or plain strings. It's defensive and will not call .get on strings.
    """
    numbered_parts: List[str] = []
    for i, (file_id, info) in enumerate((paper_texts or {}).items()):
        if isinstance(info, dict):
            title = info.get("title", file_id)
            pages = info.get("pages", []) or []
            if not isinstance(pages, list):
                pages = [str(pages)]
            full_text = "\n\n".join([str(p or "") for p in pages])
        else:
            # if info is a string or other type, coerce to string
            title = str(file_id)
            full_text = str(info)

        excerpt = (full_text[:max_chars_per_paper] + "...") if len(full_text) > max_chars_per_paper else full_text
        numbered_parts.append(f"[{i+1}] {title}:\n{excerpt}")

    refs = "\n\n".join(numbered_parts)
    prompt = f"""
You are an academic assistant. Answer the user's question using ONLY the provided research papers below.
When you use information from a paper, cite it in IEEE style as [n], where n is the paper number below.
If the user asks for a literature review, synthesize information from the papers and cite each claim with the appropriate [n].

User question: {user_query}

Papers:
{refs}

Your answer (use short inline citations like [1], [2] referring to the papers above):
"""
    return prompt
