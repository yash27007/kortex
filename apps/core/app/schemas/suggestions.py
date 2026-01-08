"""
AI Suggestions Schemas
"""

from pydantic import BaseModel, Field
from typing import Optional


class SuggestionRequest(BaseModel):
    """Request for AI suggestions."""
    field: str = Field(..., description="Field type: title, description, category, outcome, targetAudience")
    input: str = Field(..., min_length=3, description="Current user input")
    context: dict = Field(default_factory=dict, description="Additional context (title, description, etc.)")


class SuggestionResponse(BaseModel):
    """Response with AI-generated suggestions."""
    suggestions: list[str] = Field(..., description="List of suggested values")




