"""
Content Generation Schemas
"""

from typing import Any, Optional, Dict
from pydantic import BaseModel, Field

from .course import BloomLevel


class ContentGenerationInput(BaseModel):
    """Input for lesson content generation."""
    lesson_title: str = Field(..., min_length=3)
    lesson_description: str = Field(default="")
    bloom_level: BloomLevel
    course_id: str = Field(..., description="Course ID for RAG retrieval")
    module_title: str = Field(default="")
    learning_objectives: list[str] = Field(default_factory=list)
    key_concepts: list[str] = Field(default_factory=list)


class VisualAidData(BaseModel):
    """JSON schema for client-side visualizations (replaces Manim)."""
    type: str = Field(..., description="Visualization type: sorting_algo, graph_automata, coordinate_system, etc.")
    title: str = Field(..., description="Title of the visualization")
    data: dict[str, Any] = Field(..., description="Visualization data structure")


class ContentGenerationOutput(BaseModel):
    """Output from content generation."""
    lesson_id: str
    title: str
    mdx_content: str = Field(..., description="Full MDX content")
    has_video: bool = Field(default=False)
    video_url: str | None = Field(default=None)
    visual_aid: Optional[Dict[str, Any]] = Field(default=None, description="JSON visualization data for client-side rendering")
    word_count: int = Field(default=0)
    reading_time_minutes: int = Field(default=0)


# JSON Schema for MDX structure analysis
MDX_STRUCTURE_SCHEMA = {
    "type": "object",
    "required": ["needs_visualization", "visualization_type", "content_sections"],
    "properties": {
        "needs_visualization": {
            "type": "boolean",
            "description": "Does this lesson need a Manim visualization?"
        },
        "visualization_type": {
            "type": "string",
            "enum": ["none", "sorting_algo", "graph_automata", "coordinate_system", "tree_structure", "state_machine", "geometry", "animation", "diagram"],
            "description": "Type of visualization needed (JSON-based, not Manim)"
        },
        "visualization_prompt": {
            "type": "string",
            "description": "Description of what to visualize"
        },
        "content_sections": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "heading": {"type": "string"},
                    "content_type": {
                        "type": "string",
                        "enum": ["theory", "example", "callout", "quiz", "code"]
                    }
                }
            }
        }
    }
}







