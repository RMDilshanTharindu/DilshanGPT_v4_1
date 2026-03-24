# ingest.py
import pickle
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_chroma import Chroma
# Import  functions from dilshangpt_v4_1
from dilshangpt_v4_1 import  build_and_save_db

class Post:
    """Terminal Color Helper"""
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    SUCCESS = '\033[92m'  # Green
    WARNING = '\033[93m'  # Yellow
    FAIL = '\033[91m'     # Red
    ENDC = '\033[0m'      # Resets color back to normal
    BOLD = '\033[1m'

def run_ingestion():

    build_and_save_db()

    print(f"{Post.SUCCESS} Ingestion Completed !!! {Post.ENDC}")

if __name__ == "__main__":
    run_ingestion()