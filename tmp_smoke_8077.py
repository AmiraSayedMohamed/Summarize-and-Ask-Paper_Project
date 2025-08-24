import requests, time
url='http://127.0.0.1:8077'
files={'file': open('test.pdf','rb')}
try:
    r=requests.post(url+'/upload/', files=files, timeout=30)
    print('upload', r.status_code, r.text)
    if r.status_code!=200:
        raise SystemExit('upload failed')
    file_id=r.json()['file_id']

    j=requests.post(url+'/start-analysis-job/', json={'files':{file_id: f'backend/uploaded_pdfs/{file_id}'}})
    print('start job', j.status_code, j.text)
    job_id=j.json()['job_id']

    for _ in range(20):
        s=requests.get(url+f'/job-status/{job_id}')
        print('status', s.status_code, s.text)
        st = s.json().get('status')
        if st and st != 'running':
            break
        time.sleep(1)

    c=requests.post(url+'/chat-with-papers/', json={'user_query':'Summarize the paper in one paragraph','paper_files':{file_id: ''}})
    print('chat', c.status_code, c.text)
except Exception as e:
    print('smoke error:', e)
