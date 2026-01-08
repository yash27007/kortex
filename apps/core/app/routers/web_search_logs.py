"""
Web Search Logs API Endpoint

Provides access to web search logs stored in Redis for UI display.
"""

from fastapi import APIRouter, HTTPException
from ..clients import get_redis_client
from ..utils.logger import get_logger
import json

router = APIRouter(prefix="/api/web-search-logs", tags=["web-search-logs"])
logger = get_logger("web-search-logs")


@router.get("/{course_id}")
async def get_web_search_logs(course_id: str):
    """
    Get web search logs for a course.
    
    Returns:
        List of search log entries with timestamps, steps, messages, and data.
    """
    try:
        redis_manager = get_redis_client()
        
        # Get all search logs for this course (most recent first)
        logs_raw = await redis_manager.client.lrange(f"web_search_logs:{course_id}", 0, 100)
        
        # Parse logs and reverse to show chronological order (oldest first)
        parsed_logs = []
        for log_str in logs_raw:
            try:
                log_entry = json.loads(log_str)
                parsed_logs.append(log_entry)
            except json.JSONDecodeError:
                logger.warning(f"Failed to parse log entry: {log_str}")
                continue
        
        # Reverse to show chronological order (oldest first)
        parsed_logs.reverse()
        
        return {
            "course_id": course_id,
            "logs": parsed_logs,
            "count": len(parsed_logs),
        }
    except Exception as e:
        logger.error(f"Error fetching web search logs for {course_id}", exc=e)
        return {
            "course_id": course_id,
            "logs": [],
            "count": 0,
            "error": str(e),
        }
