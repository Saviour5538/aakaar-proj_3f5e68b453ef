import os
import pandas as pd
from .embeddings import get_embedding
from pgvector import PGVector

VECTOR_DIM = 1536
CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200

def chunk(document):
    """
    Chunk a document using overlapping strategy.
    Args:
        document (str): The document text to be chunked.
    Returns:
        list: List of chunks.
    """
    chunks = []
    start = 0
    while start < len(document):
        end = min(start + CHUNK_SIZE, len(document))
        chunks.append(document[start:end])
        start += CHUNK_SIZE - CHUNK_OVERLAP
    return chunks

def ingest_excel(file_path, session_id, user_id):
    """
    Ingest an Excel file, chunk its sheets, embed the chunks, and upsert into the vector store.
    Args:
        file_path (str): Path to the Excel file.
        session_id (str): Session ID for the user.
        user_id (str): User ID.
    """
    # Lazy load the vector store credentials
    vector_store_url = os.getenv("VECTOR_STORE_URL")
    vector_store = PGVector(vector_store_url, VECTOR_DIM)

    # Read the Excel file
    excel_data = pd.ExcelFile(file_path)

    for sheet_name in excel_data.sheet_names:
        sheet_data = excel_data.parse(sheet_name)
        text_data = sheet_data.to_string(index=False, header=False)

        # Chunk the sheet data
        chunks = chunk(text_data)

        # Embed and upsert each chunk
        for chunk_text in chunks:
            embedding = get_embedding(chunk_text)
            vector_store.upsert(
                embedding=embedding,
                metadata={
                    "session_id": session_id,
                    "user_id": user_id,
                    "sheet_name": sheet_name,
                    "chunk_text": chunk_text
                }
            )