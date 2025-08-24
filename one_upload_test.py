import requests
url='http://127.0.0.1:8077'
files={'file': open('test.pdf','rb')}
try:
    r=requests.post(url+'/upload/', files=files, timeout=20)
    print('upload', r.status_code)
    print(r.text)
except Exception as e:
    print('error', e)
