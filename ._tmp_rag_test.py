import sys, asyncio, os
sys.path.append('D:/projects/v1')
os.environ.pop('GROQ_API_KEY', None)
from backend import main

async def run_tests():
    print('index ->', await main.index_papers({'files':{}}))
    print('rag ->', await main.chat_with_papers_rag({'user_query':'Summarize main points','paper_files':{}}))

asyncio.get_event_loop().run_until_complete(run_tests())
