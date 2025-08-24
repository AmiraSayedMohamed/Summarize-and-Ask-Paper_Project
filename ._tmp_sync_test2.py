import requests
url='http://127.0.0.1:8000'
req={"files":["938e578daf0243c9b20d4d77eb9589d5.pdf"]}
try:
    r=requests.post(url+'/start-analysis-job-sync/', json=req, timeout=60)
    print('status', r.status_code)
    try:
        print(r.json())
    except Exception:
        print(r.text)
except Exception as e:
    print('error', e)
