import os
import requests
from typing import List

class EmbeddingClient:
    def __init__(self):
        self.api_key = os.getenv("EMBEDDING_API_KEY")
        if not self.api_key:
            raise ValueError("EMBEDDING_API_KEY environment variable not set.")
        self.endpoint = "https://api.embedding-provider.com/v1/embed"
        self.embedding_dim = 1536  # As per the AI SPEC

    def embed_text(self, text: str) -> List[float]:
        response = requests.post(
            self.endpoint,
            json={"text": text},
            headers={"Authorization": f"Bearer {self.api_key}"}
        )
        if response.status_code != 200:
            raise RuntimeError(f"Failed to embed text: {response.text}")
        embedding = response.json().get("embedding")
        if len(embedding) != self.embedding_dim:
            raise ValueError(f"Embedding dimension mismatch: expected {self.embedding_dim}, got {len(embedding)}")
        return embedding

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        response = requests.post(
            self.endpoint,
            json={"texts": texts},
            headers={"Authorization": f"Bearer {self.api_key}"}
        )
        if response.status_code != 200:
            raise RuntimeError(f"Failed to embed batch: {response.text}")
        embeddings = response.json().get("embeddings")
        if any(len(embedding) != self.embedding_dim for embedding in embeddings):
            raise ValueError("Embedding dimension mismatch in batch.")
        return embeddings

def get_embedding(texts: List[str]) -> List[List[float]]:
    client = EmbeddingClient()
    return client.embed_batch(texts)