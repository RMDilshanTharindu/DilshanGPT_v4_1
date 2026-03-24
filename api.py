import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List

# Import your core logic
from dilshangpt_v4_1 import (
    hybrid_retrieve, 
    generate_answer, 
    generate_proper_question, 
    get_existing_vector_store, 
    load_saved_chunks
)

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

# 1. Define the Request Structure (The JSON you send)
class ChatRequest(BaseModel):
    user_message: str

# 2. Initialize FastAPI
app = FastAPI(title="DilshanGPT API")

# 3. Global variables to hold our loaded DB (so we don't reload every request)
vectorStore = None
chunks = None
chat_history = [] # Note: This keeps history for ALL users. For a real app, you'd handle sessions.

# 4. Startup Event: Load the DB once when the server starts
@app.on_event("startup")
async def startup_event():
    global vectorStore, chunks
    print("Loading Local Storage Resources...")
    vectorStore = get_existing_vector_store()
    chunks = load_saved_chunks()
    print(f"{Post.SUCCESS}Resources Loaded. API Ready.{Post.ENDC}")

# 5. The API Endpoint
@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        query = request.user_message
        
        # Logic from your chat.py
        proper_query = generate_proper_question(query, chat_history)
        chat_history.append(f"User asked: {proper_query}")
        
        relevant_docs = hybrid_retrieve(proper_query, vectorStore, chunks)
        response_text = generate_answer(query, relevant_docs)
        
        chat_history.append(f"DilshanGPT response: {response_text}")

        # Return the exact JSON structure you asked for
        return {"DilshanGPT": response_text}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# To run this: uvicorn api:app --reload