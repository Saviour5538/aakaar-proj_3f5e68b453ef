import os
from .embeddings import get_embedding
from pgvector import PGVector
import openai

VECTOR_DIM = 1536

def retrieve_context(query, top_k, session_id, user_id):
    """
    Retrieve relevant context for a query from the vector store.
    Args:
        query (str): The query string.
        top_k (int): Number of top results to retrieve.
        session_id (str): Session ID for the user.
        user_id (str): User ID.
    Returns:
        list: List of retrieved contexts.
    """
    # Lazy load the vector store credentials
    vector_store_url = os.getenv("VECTOR_STORE_URL")
    vector_store = PGVector(vector_store_url, VECTOR_DIM)

    # Embed the query
    query_embedding = get_embedding(query)

    # Search the vector store
    results = vector_store.search(
        embedding=query_embedding,
        top_k=top_k,
        metadata_filter={"session_id": session_id, "user_id": user_id}
    )
    return results

def answer_question(query: str, session_id: str, user_id: str) -> dict:
    """
    Answer a question using the runtime LLM and retrieved context.
    Args:
        query (str): The query string.
        session_id (str): Session ID for the user.
        user_id (str): User ID.
    Returns:
        dict: Dictionary containing the answer and sources.
    """
    # Retrieve context
    top_k = 5
    contexts = retrieve_context(query, top_k, session_id, user_id)

    # Build the prompt
    context_texts = [context["chunk_text"] for context in contexts]
    sources = [context["sheet_name"] for context in contexts]
    prompt = f"Answer the following question based on the context:\n\nContext:\n{''.join(context_texts)}\n\nQuestion:\n{query}"

    # Lazy load the OpenAI API key
    openai_api_key = os.getenv("OPENAI_API_KEY")
    openai.api_key = openai_api_key

    # Call the runtime LLM
    response = openai.ChatCompletion.create(
        model="gpt-4o-mini",
        messages=[{"role": "system", "content": "You are a helpful assistant."},
                  {"role": "user", "content": prompt}]
    )

    # Extract the answer
    answer = response["choices"][0]["message"]["content"]

    return {"answer": answer, "sources": sources}