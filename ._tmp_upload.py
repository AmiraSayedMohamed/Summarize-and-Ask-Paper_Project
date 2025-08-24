import requests
url='http://127.0.0.1:8000'
files={'file': open('test.pdf','rb')}
try:
    r=requests.post(url+'/upload/', files=files, timeout=30)
    print('status', r.status_code)
    try:
        print(r.json())
    except Exception:
        print(r.text)
except Exception as e:
    print('error', e)
