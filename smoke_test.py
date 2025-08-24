import requests
import time

base = 'http://127.0.0.1:8000'

# 1. upload
files = {'file': open('test.pdf','rb')}
r = requests.post(base + '/upload/', files=files)
print('upload status', r.status_code, r.text)
res = r.json()
file_id = res.get('file_id')
file_path = res.get('file_path')
public_url = res.get('public_url')

# 2. start analysis job
payload = {'files': {file_id: file_path}, 'links': [], 'user_query': 'Summarize this paper.'}
r = requests.post(base + '/start-analysis-job/', json=payload)
print('start job', r.status_code, r.text)
job_id = r.json().get('job_id')

# 3. poll
for _ in range(20):
    r = requests.get(base + f'/job-status/{job_id}')
    print('status', r.status_code, r.text)
    js = r.json()
    if js.get('status') in ('completed','failed'):
        break
    time.sleep(1)

# 4. chat
payload = {'user_query': 'What is the paper about?', 'paper_files': {file_id: file_path}}
r = requests.post(base + '/chat-with-papers/', json=payload)
print('chat', r.status_code, r.text)
