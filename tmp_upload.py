import requests
files = {'file': open('test.pdf','rb')}
r = requests.post('http://127.0.0.1:8000/upload/', files=files, timeout=30)
print(r.status_code)
try:
    print(r.json())
except Exception:
    print(r.text)
