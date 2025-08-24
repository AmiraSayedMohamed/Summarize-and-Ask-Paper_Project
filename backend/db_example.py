"""
Example MongoDB Atlas and Supabase Storage integration for FastAPI backend.
Install: pip install pymongo supabase
"""
import os
from pymongo import MongoClient
from supabase import create_client, Client

# MongoDB Atlas setup
MONGODB_URI = os.environ.get("MONGODB_URI")
MONGODB_DB = os.environ.get("MONGODB_DB", "researchai")
client = MongoClient(MONGODB_URI)
db = client[MONGODB_DB]

# Example: insert a chunk
def save_chunk(paper_id, text, page, anchor_id, embedding):
    doc = {"paper_id": paper_id, "text": text, "page": page, "anchor_id": anchor_id, "embedding": embedding}
    db.chunks.insert_one(doc)

# Supabase Storage setup
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")
sb: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# Example: upload a PDF file
def upload_pdf(file_path, dest_name):
    with open(file_path, "rb") as f:
        res = sb.storage.from_("pdfs").upload(dest_name, f)
    return res
