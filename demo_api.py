from fastapi import FastAPI
from pydantic import BaseModel
import random
import time

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="DilshanGPT Demo API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],  # IMPORTANT (allows OPTIONS)
    allow_headers=["*"],
)

# Request format (same as your real API)
class ChatRequest(BaseModel):
    user_message: str


#  Sample fake responses
demo_responses = [
    "Dilshan aims to become a successful tech entrepreneur focusing on AI and cybersecurity.",
    "Cybersecurity basics include strong passwords, encryption, and regular updates.",
    "RAG systems combine retrieval and generation to answer questions more accurately.",
    "Vector databases store embeddings and help find similar content efficiently.",
    "AI applications include chatbots, recommendation systems, and fraud detection.",
    "I'm a demo response — your real API will generate smarter answers 😄",
    "Based on the provided documents, Dilshan Tharindu is passionate about the following:\n\n*   **The technology industry:** He is described as being \"deeply passionate\" about this field.\n*   **Building a foundation in specific tech areas:** He is actively working toward building a strong foundation in software engineering, artificial intelligence, and cybersecurity.\n*   **System internals:** He has a strong curiosity about how systems work internally, specifically how software interacts with memory, networks, and real-world users."
]


#  Fake typing delay (optional, feels real)
def fake_delay():
    time.sleep(random.uniform(0.5, 1.5))


#  Demo endpoint
@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    user_msg = request.user_message.lower()

    fake_delay()

    # Simple keyword-based responses (feels smarter than random)
    if "goal" in user_msg:
        response = "Dilshan's goal is to become a tech entrepreneur building AI and security solutions."
    elif "cyber" in user_msg:
        response = "Cybersecurity basics include authentication, encryption, and secure coding practices."
    elif "ai" in user_msg:
        response = "AI involves machine learning, data processing, and intelligent automation."
    elif "rag" in user_msg:
        response = "RAG combines vector search with LLMs to generate accurate answers."
    elif "test complex" in user_msg:
        response = "Based on the provided documents, Dilshan Tharindu is passionate about the following:\n\n*   **The technology industry:** He is described as being \"deeply passionate\" about this field.\n*   **Building a foundation in specific tech areas:** He is actively working toward building a strong foundation in software engineering, artificial intelligence, and cybersecurity.\n*   **System internals:** He has a strong curiosity about how systems work internally, specifically how software interacts with memory, networks, and real-world users."
    
    else:
        response = random.choice(demo_responses)

    return {
        "DilshanGPT": response
    }