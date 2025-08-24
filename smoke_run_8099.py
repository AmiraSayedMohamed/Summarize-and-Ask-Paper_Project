import requests, time
url='http://127.0.0.1:8099'
files={'file': open('test.pdf','rb')}
# upload
r=requests.post(url+'/upload/', files=files)
print('upload', r.status_code, r.text)
file_id=r.json()['file_id']
# start job
j=requests.post(url+'/start-analysis-job/', json={'files':{file_id: f'backend/uploaded_pdfs/{file_id}'}, 'user_query': 'Give me a one-sentence summary'})
print('start job', j.status_code, j.text)
job_id=j.json()['job_id']
for _ in range(30):
    s=requests.get(url+f'/job-status/{job_id}')
    print('status', s.status_code, s.text)
    st = s.json().get('status')
    if st and st != 'running':
        break
    time.sleep(1)
# chat
c=requests.post(url+'/chat-with-papers/', json={'user_query':'Summarize the paper in one paragraph','paper_files':{file_id: ''}})
print('chat', c.status_code, c.text)
