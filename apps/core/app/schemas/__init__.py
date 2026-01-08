"""
Kortex AI Core - Pydantic Schemas
"""

from .course import (
    CourseStructureInput,
    CourseStructureOutput,
    ModuleSchema,
    LessonSchema,
    BloomLevel,
)
from .content import (
    ContentGenerationInput,
    ContentGenerationOutput,
)
from .chat import (
    ChatInput,
    ChatMessage,
)
from .quiz import (
    QuizGenerationInput,
    QuizOutput,
    QuizQuestion,
)
from .suggestions import (
    SuggestionRequest,
    SuggestionResponse,
)

__all__ = [
    "CourseStructureInput",
    "CourseStructureOutput",
    "ModuleSchema",
    "LessonSchema",
    "BloomLevel",
    "ContentGenerationInput",
    "ContentGenerationOutput",
    "ChatInput",
    "ChatMessage",
    "QuizGenerationInput",
    "QuizOutput",
    "QuizQuestion",
    "SuggestionRequest",
    "SuggestionResponse",
]







