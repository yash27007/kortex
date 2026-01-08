"""
Qdrant Vector Database Client
"""

from typing import Any
from functools import lru_cache

from qdrant_client import QdrantClient, AsyncQdrantClient
from qdrant_client.models import (
    Distance,
    VectorParams,
    PointStruct,
    Filter,
    FieldCondition,
    MatchValue,
)

from ..config import get_settings


class QdrantManager:
    """Manager for Qdrant vector database operations."""
    
    def __init__(self):
        settings = get_settings()
        self.client = AsyncQdrantClient(
            host=settings.qdrant_host,
            port=settings.qdrant_port,
            api_key=settings.qdrant_api_key,
        )
        self.embedding_dim = settings.embedding_dimensions
    
    async def create_collection(self, collection_name: str) -> bool:
        """Create a collection for a course."""
        try:
            # Check if exists
            collections = await self.client.get_collections()
            existing = [c.name for c in collections.collections]
            
            if collection_name in existing:
                return True
            
            # Create new collection
            await self.client.create_collection(
                collection_name=collection_name,
                vectors_config=VectorParams(
                    size=self.embedding_dim,
                    distance=Distance.COSINE,
                ),
            )
            return True
        except Exception as e:
            print(f"Error creating collection: {e}")
            return False
    
    async def upsert_chunks(
        self,
        collection_name: str,
        chunks: list[dict],
        embeddings: list[list[float]],
    ) -> bool:
        """Upsert chunks with their embeddings."""
        try:
            points = [
                PointStruct(
                    id=i,
                    vector=embedding,
                    payload={
                        "text": chunk["text"],
                        "source": chunk.get("source", "unknown"),
                        "page": chunk.get("page", 0),
                        "lesson_id": chunk.get("lesson_id", ""),
                        "module_id": chunk.get("module_id", ""),
                    },
                )
                for i, (chunk, embedding) in enumerate(zip(chunks, embeddings))
            ]
            
            await self.client.upsert(
                collection_name=collection_name,
                points=points,
            )
            return True
        except Exception as e:
            print(f"Error upserting chunks: {e}")
            return False
    
    async def search(
        self,
        collection_name: str,
        query_vector: list[float],
        limit: int = 5,
        filter_conditions: dict | None = None,
    ) -> list[dict]:
        """Search for similar chunks."""
        try:
            # Build filter if provided
            search_filter = None
            if filter_conditions:
                conditions = [
                    FieldCondition(
                        key=key,
                        match=MatchValue(value=value),
                    )
                    for key, value in filter_conditions.items()
                ]
                search_filter = Filter(must=conditions)
            
            results = await self.client.search(
                collection_name=collection_name,
                query_vector=query_vector,
                limit=limit,
                query_filter=search_filter,
            )
            
            return [
                {
                    "text": hit.payload.get("text", ""),
                    "source": hit.payload.get("source", ""),
                    "page": hit.payload.get("page", 0),
                    "score": hit.score,
                }
                for hit in results
            ]
        except Exception as e:
            print(f"Error searching: {e}")
            return []
    
    async def delete_collection(self, collection_name: str) -> bool:
        """Delete a collection."""
        try:
            await self.client.delete_collection(collection_name=collection_name)
            return True
        except Exception:
            return False


@lru_cache
def get_qdrant_client() -> QdrantManager:
    """Get cached Qdrant manager instance."""
    return QdrantManager()







