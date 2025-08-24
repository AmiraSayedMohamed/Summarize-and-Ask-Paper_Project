from starlette.testclient import TestClient
from backend import main
import os

client = TestClient(main.app)

# ensure test.pdf exists
pdf_path = os.path.join(os.path.dirname(__file__), 'test.pdf')
if not os.path.exists(pdf_path):
    print('test.pdf not found, aborting')
    raise SystemExit(1)

with open(pdf_path, 'rb') as f:
    files = {'file': ('test.pdf', f, 'application/pdf')}
    r = client.post('/upload/', files=files)
    print('upload', r.status_code)
    print(r.text)
    r.raise_for_status()
    file_id = r.json().get('file_id')
    print('file_id', file_id)

# start a synchronous analysis job to run code path directly
payload = {'files': {file_id: os.path.join('backend','uploaded_pdfs', file_id)}, 'user_query': 'Summarize this paper.'}
try:
    r2 = client.post('/start-analysis-job-sync/', json=payload)
    print('sync status', r2.status_code)
    print(r2.text)
except Exception as e:
    import traceback
    traceback.print_exc()

# call chat endpoint
payload2 = {'user_query': 'Summarize the paper in one paragraph', 'paper_files': {file_id: ''}}
try:
    r3 = client.post('/chat-with-papers/', json=payload2)
    print('chat status', r3.status_code)
    print(r3.text)
except Exception as e:
    import traceback
    traceback.print_exc()
