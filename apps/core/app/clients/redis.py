"""
Redis Cache Client
"""

import json
from typing import Any
from functools import lru_cache

import redis.asyncio as redis

from ..config import get_settings


class RedisManager:
    """Manager for Redis caching operations."""
    
    def __init__(self):
        settings = get_settings()
        self.client = redis.Redis(
            host=settings.redis_host,
            port=settings.redis_port,
            password=settings.redis_password,
            db=settings.redis_db,
            decode_responses=True,
        )
        self.default_ttl = 86400  # 24 hours
    
    # Chat History Operations
    async def get_chat_history(self, session_id: str, limit: int = 10) -> list[dict]:
        """Get chat history for a session."""
        key = f"chat:{session_id}"
        messages = await self.client.lrange(key, -limit, -1)
        return [json.loads(msg) for msg in messages]
    
    async def add_chat_message(
        self,
        session_id: str,
        role: str,
        content: str,
    ) -> None:
        """Add a message to chat history."""
        key = f"chat:{session_id}"
        message = json.dumps({"role": role, "content": content})
        await self.client.rpush(key, message)
        await self.client.expire(key, self.default_ttl)
    
    async def clear_chat_history(self, session_id: str) -> None:
        """Clear chat history for a session."""
        key = f"chat:{session_id}"
        await self.client.delete(key)
    
    # Job Status Operations
    async def set_job_status(
        self,
        job_id: str,
        status: str,
        data: dict | None = None,
    ) -> None:
        """Set job status."""
        key = f"job:{job_id}"
        value = json.dumps({"status": status, "data": data or {}})
        await self.client.set(key, value, ex=3600)  # 1 hour TTL
    
    async def get_job_status(self, job_id: str) -> dict | None:
        """Get job status."""
        key = f"job:{job_id}"
        value = await self.client.get(key)
        if value:
            return json.loads(value)
        return None
    
    # Lesson Cache Operations
    async def cache_lesson(self, lesson_id: str, content: str) -> None:
        """Cache lesson content."""
        key = f"lesson:{lesson_id}"
        await self.client.set(key, content, ex=self.default_ttl)
    
    async def get_cached_lesson(self, lesson_id: str) -> str | None:
        """Get cached lesson content."""
        key = f"lesson:{lesson_id}"
        return await self.client.get(key)
    
    # Generic Cache Operations
    async def set(self, key: str, value: Any, ttl: int | None = None) -> None:
        """Set a generic key-value pair."""
        if isinstance(value, (dict, list)):
            value = json.dumps(value)
        await self.client.set(key, value, ex=ttl or self.default_ttl)
    
    async def get(self, key: str) -> Any:
        """Get a generic value."""
        value = await self.client.get(key)
        if value:
            try:
                return json.loads(value)
            except json.JSONDecodeError:
                return value
        return None
    
    async def close(self) -> None:
        """Close the Redis connection."""
        await self.client.close()


@lru_cache
def get_redis_client() -> RedisManager:
    """Get cached Redis manager instance."""
    return RedisManager()







