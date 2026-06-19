import os
import psycopg2
from typing import List, Dict, Any

class VectorStore:
    def __init__(self):
        self.connection_params = {
            "dbname": os.getenv("PGVECTOR_DB_NAME"),
            "user": os.getenv("PGVECTOR_DB_USER"),
            "password": os.getenv("PGVECTOR_DB_PASSWORD"),
            "host": os.getenv("PGVECTOR_DB_HOST"),
            "port": os.getenv("PGVECTOR_DB_PORT"),
        }
        if not all(self.connection_params.values()):
            raise ValueError("One or more PGVECTOR database environment variables are not set.")

    def _connect(self):
        return psycopg2.connect(**self.connection_params)

    def upsert(self, id: str, vector: List[float], metadata: Dict[str, Any]):
        with self._connect() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO vectors (id, embedding, metadata)
                    VALUES (%s, %s, %s)
                    ON CONFLICT (id) DO UPDATE
                    SET embedding = EXCLUDED.embedding,
                        metadata = EXCLUDED.metadata;
                    """,
                    (id, vector, metadata)
                )
                conn.commit()

    def search(self, query_embedding: List[float], top_k: int, **filters) -> List[Dict[str, Any]]:
        filter_conditions = " AND ".join([f"{key} = %s" for key in filters.keys()])
        filter_values = list(filters.values())
        with self._connect() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    f"""
                    SELECT id, metadata, embedding <-> %s AS distance
                    FROM vectors
                    WHERE {filter_conditions if filters else 'TRUE'}
                    ORDER BY distance ASC
                    LIMIT %s;
                    """,
                    [query_embedding] + filter_values + [top_k]
                )
                results = cur.fetchall()
        return [{"id": row[0], "metadata": row[1], "distance": row[2]} for row in results]