"""
Database Helper for Python Backend

Prisma is TypeScript-only, so apps/core never talks to Postgres directly.
Instead it calls back into internal Next.js API routes (shared-secret
protected) that use the real Prisma client — Prisma stays the single owner
of schema, migrations, and types.
"""

from typing import Any, Optional

import httpx

from ..config import get_settings
from ..utils.logger import get_logger

logger = get_logger("db_helper")


def _internal_headers() -> dict[str, str]:
    settings = get_settings()
    return {
        "Content-Type": "application/json",
        "X-Internal-Secret": settings.internal_api_secret,
    }


async def update_lesson_content(
    lesson_id: str,
    mdx_content: Optional[str] = None,
    duration: Optional[int] = None,
) -> bool:
    """Update a lesson's content via the internal Next.js API.

    Returns True on success, False otherwise. Callers should treat False as
    a real failure (not silently swallow it) since it means the lesson's
    generated content never made it into the database.
    """
    settings = get_settings()
    payload: dict[str, Any] = {}
    if mdx_content is not None:
        payload["mdxContent"] = mdx_content
    if duration is not None:
        payload["duration"] = duration

    if not payload:
        return True

    url = f"{settings.nextjs_api_url}/api/lessons/{lesson_id}/update"
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(url, json=payload, headers=_internal_headers())
        if response.status_code == 200:
            logger.saving(f"Updated lesson via API: {lesson_id}")
            return True
        logger.error(f"Lesson update failed ({response.status_code}): {response.text[:300]}")
        return False
    except Exception as e:
        logger.error(f"Failed to reach Next.js to update lesson: {lesson_id}", exc=e)
        return False


async def save_course_structure(course_id: str, structure: dict[str, Any]) -> Optional[dict]:
    """Persist the Architect's generated course structure (modules, lessons,
    quizzes) via the internal Next.js API.

    `structure` must match the payload shape expected by
    apps/web/app/api/internal/courses/[courseId]/structure/route.ts.

    Returns the response body (containing moduleIdMap/lessonIdMap mapping
    the Architect's placeholder ids to real database ids) on success, or
    None on failure.
    """
    settings = get_settings()
    url = f"{settings.nextjs_api_url}/api/internal/courses/{course_id}/structure"
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, json=structure, headers=_internal_headers())
        if response.status_code == 200:
            logger.success(f"Persisted course structure: {course_id}")
            return response.json()
        logger.error(
            f"Course structure persist failed ({response.status_code}): {response.text[:500]}"
        )
        return None
    except Exception as e:
        logger.error(f"Failed to reach Next.js to save course structure: {course_id}", exc=e)
        return None
