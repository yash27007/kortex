"""
Chat/Tutor Schemas
"""

from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    """Single chat message."""
    role: str = Field(..., pattern="^(user|assistant|system)$")
    content: str


class ChatInput(BaseModel):
    """Input for chat/tutor endpoint."""
    session_id: str = Field(..., description="Unique session identifier")
    query: str = Field(..., min_length=1, max_length=2000)
    lesson_context_id: str = Field(..., description="Current lesson ID for context")
    course_id: str = Field(..., description="Course ID for RAG")
    user_bloom_level: str = Field(
        default="understand",
        description="User's current Bloom's level estimate"
    )





