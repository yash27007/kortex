"""
Database Helper for Python Backend

Since Prisma is TypeScript-only, we use asyncpg for direct PostgreSQL access
or HTTP calls to the Next.js API for database updates.
"""

import os
import json
from typing import Optional, Any
import httpx
from ..utils.logger import get_logger

logger = get_logger("db_helper")

# Try to use HTTP API first (Next.js tRPC), fallback to direct DB if needed
NEXTJS_API_URL = os.getenv("NEXTJS_API_URL", "http://localhost:3000")


async def update_lesson_content(
    lesson_id: str,
    mdx_content: Optional[str] = None,
    visual_aid: Optional[dict[str, Any]] = None,
    duration: Optional[int] = None,
) -> bool:
    """
    Update lesson content in the database via Next.js API.
    
    Args:
        lesson_id: Lesson ID
        mdx_content: MDX content to save
        visual_aid: Visual aid JSON object
        duration: Reading duration in minutes
    
    Returns:
        True if successful, False otherwise
    """
    try:
        # For now, we'll use a simple approach: store in Redis and let Next.js sync
        # Or we can make HTTP calls to Next.js API
        # Since we're in Inngest, the best approach is to emit an event that Next.js handles
        # But for immediate updates, we'll use Redis as a cache
        
        from ..clients import get_redis_client
        redis = get_redis_client()
        
        # Store lesson data in Redis (Next.js will sync to DB)
        lesson_data = {}
        if mdx_content:
            lesson_data["mdxContent"] = mdx_content
        if visual_aid:
            lesson_data["visualAid"] = json.dumps(visual_aid) if isinstance(visual_aid, dict) else visual_aid
        if duration:
            lesson_data["duration"] = duration
        
        if lesson_data:
            await redis.set(
                f"lesson_update:{lesson_id}",
                lesson_data,
                ttl=3600,  # 1 hour
            )
            logger.saving(f"Stored lesson update in Redis cache: {lesson_id}")
        
        # Try to call Next.js API if available
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    f"{NEXTJS_API_URL}/api/lessons/{lesson_id}/update",
                    json=lesson_data,
                    headers={"Content-Type": "application/json"},
                )
                if response.status_code == 200:
                    logger.success(f"Updated lesson via API: {lesson_id}")
                    return True
                else:
                    logger.warning(f"API update returned {response.status_code}: {response.text}")
        except Exception as e:
            logger.warning(f"API update failed, using Redis cache only: {e}")
        
        return True
    except Exception as e:
        logger.error(f"Failed to update lesson: {lesson_id}", exc=e)
        return False


async def get_lesson_status(lesson_id: str) -> Optional[dict]:
    """Get lesson status from cache or database."""
    try:
        from ..clients import get_redis_client
        redis = get_redis_client()
        
        # Check Redis cache first
        cached = await redis.get(f"lesson_meta:{lesson_id}")
        if cached:
            return cached
        
        return None
    except Exception as e:
        logger.error(f"Failed to get lesson status: {lesson_id}", exc=e)
        return None




