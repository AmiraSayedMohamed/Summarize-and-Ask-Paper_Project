import os
from backend.main import analyze_papers_job

upload_dir = os.path.join(os.path.dirname(__file__), 'backend', 'uploaded_pdfs')
files = [f for f in os.listdir(upload_dir) if f.endswith('.pdf')]
if not files:
    print('no pdfs found')
else:
    f = files[-1]
    file_path = os.path.join(upload_dir, f)
    print('testing file', f, file_path)
    try:
        res = analyze_papers_job([(f, file_path)], [], 'Summarize')
        print('result:', res)
    except Exception as e:
        import traceback
        traceback.print_exc()
