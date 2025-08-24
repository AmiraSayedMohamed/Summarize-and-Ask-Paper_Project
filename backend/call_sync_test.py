import requests, os
base = 'http://127.0.0.1:8000'
test_pdf = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'test.pdf')
files = {'file': open(test_pdf, 'rb')}
r = requests.post(base + '/upload/', files=files)
print('upload', r.status_code, r.text)
res = r.json()
file_id = res.get('file_id')
file_path = res.get('file_path')
payload = {'files': {file_id: file_path}, 'user_query': 'Summarize this paper.'}
r = requests.post(base + '/start-analysis-job-sync/', json=payload)
print('sync result', r.status_code, r.text)
