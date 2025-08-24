import threading
import time
import uuid
from typing import Dict, Any, Callable

# Simple in-memory job queue for demo (not production safe)
jobs: Dict[str, Dict[str, Any]] = {}

def start_job(target: Callable, *args, **kwargs) -> str:
    job_id = str(uuid.uuid4())
    jobs[job_id] = {"status": "pending", "result": None, "error": None}
    def run():
        try:
            jobs[job_id]["status"] = "running"
            result = target(*args, **kwargs)
            jobs[job_id]["result"] = result
            jobs[job_id]["status"] = "completed"
        except Exception as e:
            import traceback as _tb
            jobs[job_id]["error"] = str(e)
            jobs[job_id]["traceback"] = _tb.format_exc()
            jobs[job_id]["status"] = "failed"
    thread = threading.Thread(target=run)
    thread.start()
    return job_id

def get_job_status(job_id: str) -> Dict[str, Any]:
    return jobs.get(job_id, {"status": "not_found"})
