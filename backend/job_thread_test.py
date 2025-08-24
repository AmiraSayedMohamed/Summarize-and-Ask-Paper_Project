import time, os, json, sys
# ensure project root is on sys.path so 'backend' package imports work
ROOT = os.path.dirname(os.path.dirname(__file__))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)
from backend import job_queue
from backend.main import analyze_papers_job
upload_dir = os.path.join(os.path.dirname(__file__), 'uploaded_pdfs')
files = [f for f in os.listdir(upload_dir) if f.endswith('.pdf')]
if not files:
    print('no pdfs to test')
    raise SystemExit(0)
f = files[-1]
file_path = os.path.join(upload_dir, f)
print('starting job for', f)
job_id = job_queue.start_job(analyze_papers_job, [(f, file_path)], [], 'Summarize')
print('job_id', job_id)
for _ in range(30):
    j = job_queue.jobs.get(job_id)
    print('status', j.get('status'))
    if j.get('status') in ('completed','failed'):
        print('final job:', json.dumps(j, indent=2))
        break
    time.sleep(1)
else:
    print('timed out, last state:', job_queue.jobs.get(job_id))
