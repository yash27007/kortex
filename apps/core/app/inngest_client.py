"""
Kortex AI Core - Inngest Client Configuration

Inngest handles long-running AI workflows (5-10 minute course generation)
that would timeout with standard HTTP requests.

Usage:
    - Course generation: triggers via "course.create" event
    - Lesson generation: triggers via "lesson.generate" event (fan-out)
    - Quiz analysis: triggers via "quiz.completed" event
"""

import inngest
from inngest.fast_api import serve

from .config import get_settings


# Initialize the Inngest client
settings = get_settings()

inngest_client = inngest.Inngest(
    app_id="kortex-core",
    is_production=not settings.inngest_dev,
)


def get_inngest_client() -> inngest.Inngest:
    """Get the Inngest client instance."""
    return inngest_client


def create_inngest_serve(app):
    """
    Create the Inngest serve handler for FastAPI.
    
    This should be called in main.py after all functions are registered.
    Mount at POST /api/inngest
    """
    from .inngest_functions import inngest_functions
    
    serve(
        app,
        inngest_client,
        inngest_functions,
    )





