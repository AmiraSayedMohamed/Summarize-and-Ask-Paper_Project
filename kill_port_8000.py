import subprocess, re
out = subprocess.check_output('netstat -ano', shell=True, text=True)
pids = set()
for line in out.splitlines():
    if ':8000' in line and 'LISTENING' in line:
        parts = re.split(r'\s+', line.strip())
        pid = parts[-1]
        try:
            p = int(pid)
            pids.add(p)
        except Exception:
            pass
if not pids:
    print('no pids')
else:
    print('found pids:', pids)
    for p in pids:
        try:
            print('killing', p)
            subprocess.check_call(['taskkill', '/PID', str(p), '/F'])
        except Exception as e:
            print('failed kill', p, e)
