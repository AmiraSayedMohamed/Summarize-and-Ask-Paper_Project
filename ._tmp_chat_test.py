import requests
url='http://127.0.0.1:8000'
# replace with an uploaded file id you have
req={"paper_files":{"938e578daf0243c9b20d4d77eb9589d5.pdf":""}, "user_query":"Give me a one-sentence summary"}
try:
    r=requests.post(url+'/chat-with-papers/', json=req, timeout=60)
    print('status', r.status_code)
    try:
        print(r.json())
    except Exception:
        print(r.text)
except Exception as e:
    print('error', e)
