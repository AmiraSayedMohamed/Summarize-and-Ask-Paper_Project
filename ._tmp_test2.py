import requests
url='http://127.0.0.1:8000'
req={"files":["ed32d037c3a5470bb7b0e2e78117c33a.pdf"]}
try:
    r=requests.post(url+'/start-analysis-job-sync/', json=req, timeout=60)
    print('status', r.status_code)
    try:
        print(r.json())
    except Exception:
        print(r.text)
except Exception as e:
    print('error', e)
