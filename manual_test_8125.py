import requests
url='http://127.0.0.1:8125'
files={'file': open('test.pdf','rb')}
r=requests.post(url+'/upload/', files=files)
print('upload', r.status_code)
print(r.text)
if r.status_code!=200:
    raise SystemExit
file_id=r.json()['file_id']
print('file_id', file_id)
# start job
j=requests.post(url+'/start-analysis-job/', json={'files':{file_id: f'backend/uploaded_pdfs/{file_id}'}, 'user_query': 'Give me a one-sentence summary'})
print('start job', j.status_code)
print(j.text)
job_id=j.json()['job_id']
print('job_id', job_id)
# poll once
s=requests.get(url+f'/job-status/{job_id}')
print('status', s.status_code, s.text)
# chat
c=requests.post(url+'/chat-with-papers/', json={'user_query':'Summarize the paper in one paragraph','paper_files':{file_id: ''}})
print('chat', c.status_code)
print(c.text)
