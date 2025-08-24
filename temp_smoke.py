import requests, time
url='http://127.0.0.1:8000'
# upload
files={'file': open('test.pdf','rb')}
r=requests.post(url+'/upload/', files=files)
print('upload', r.status_code, r.text)
if r.status_code!=200:
    raise SystemExit
file_id=r.json()['file_id']
# start job
j=requests.post(url+'/start-analysis-job/', json={'files':{file_id: f'backend/uploaded_pdfs/{file_id}'}})
print('start job', j.status_code, j.text)
job_id=j.json()['job_id']
# poll
for _ in range(15):
    s=requests.get(url+f'/job-status/{job_id}'); print('status', s.status_code, s.text)
    if s.json().get('status')!='running': break
    time.sleep(1)
# chat
c=requests.post(url+'/chat-with-papers/', json={'user_query':'Summarize the paper in one paragraph','paper_files':{file_id: ''}})
print('chat', c.status_code, c.text)
