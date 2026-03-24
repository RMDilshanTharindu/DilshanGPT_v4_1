# chat.py
import pickle
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_chroma import Chroma

# Import only what's needed for chatting
from dilshangpt_v4_1 import hybrid_retrieve, generate_answer, generate_proper_question , get_existing_vector_store , load_saved_chunks

def start_chat():
    # Load resources
    # Load the DB From the local Storage
    vectorStore = get_existing_vector_store()
    # Load the chunks From the local Storage
    chunks = load_saved_chunks()


    chat_history = []
    
    print("Chatbot Ready! Type exit to quit.")

    while True:
        query = input("User: ")
        if query.lower() == "exit": break
        
        # Using the imported functions
        proper_query = generate_proper_question(query,chat_history)
        prop_que_to_history = f"User asked : {proper_query}"
        chat_history.append(prop_que_to_history)
        docs = hybrid_retrieve(proper_query, vectorStore , chunks) # Pass it here!

        response = generate_answer(query, docs)
        gen_ans_to_history = f"DilshanGPT response: {response}"
        chat_history.append(gen_ans_to_history)
        print(f"DilshanGPT: {response}")

if __name__ == "__main__":
    start_chat()