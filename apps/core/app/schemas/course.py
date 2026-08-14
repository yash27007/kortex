"""
Course Structure Schemas
"""

from enum import Enum
from pydantic import BaseModel, Field


class BloomLevel(str, Enum):
    """Bloom's Taxonomy Levels"""
    REMEMBER = "remember"
    UNDERSTAND = "understand"
    APPLY = "apply"
    ANALYZE = "analyze"
    EVALUATE = "evaluate"
    CREATE = "create"


class QuizQuestionSchema(BaseModel):
    """A single gatekeeper-quiz question."""
    text: str = Field(..., description="The question text")
    type: str = Field(..., description="'multiple_choice' or 'true_false'")
    options: list[str] = Field(..., description="Answer options (2 for true_false, 3-5 for multiple_choice)")
    correct_answer: str = Field(..., description="Must exactly match one entry in options")
    explanation: str = Field(default="", description="Why the correct answer is correct")


class ModuleQuizSchema(BaseModel):
    """The gatekeeper quiz a student must pass to advance past a module."""
    questions: list[QuizQuestionSchema] = Field(..., min_length=3, max_length=8)


class LessonSchema(BaseModel):
    """Lesson structure within a module."""
    title: str = Field(..., description="Lesson title")
    description: str = Field(..., description="Brief description")
    bloom_level: BloomLevel = Field(..., description="Bloom's taxonomy level")
    duration_minutes: int = Field(default=30, ge=5, le=120)
    learning_objectives: list[str] = Field(default_factory=list)
    key_concepts: list[str] = Field(default_factory=list)


class ModuleSchema(BaseModel):
    """Module structure within a course."""
    title: str = Field(..., description="Module title")
    description: str = Field(..., description="Module description")
    order: int = Field(..., ge=1)
    bloom_progression: BloomLevel = Field(
        ...,
        description="Primary Bloom's level for this module"
    )
    lessons: list[LessonSchema] = Field(default_factory=list)
    course_outcomes: list[str] = Field(
        default_factory=list,
        description="Course outcomes addressed by this module"
    )
    quiz: ModuleQuizSchema = Field(
        ...,
        description="Gatekeeper quiz students must pass to advance past this module"
    )


class CourseStructureInput(BaseModel):
    """Input for course structure generation."""
    course_title: str = Field(..., min_length=3, max_length=200)
    description: str = Field(default="", max_length=2000)
    pdf_urls: list[str] = Field(
        default_factory=list,
        description="URLs to PDF files in Supabase Storage"
    )
    target_audience: str = Field(default="undergraduate students")
    duration_weeks: int = Field(default=8, ge=1, le=24)


class CourseStructureOutput(BaseModel):
    """Output from course structure generation."""
    course_id: str = Field(..., description="Generated course ID")
    title: str
    description: str
    target_audience: str
    estimated_hours: int
    course_outcomes: list[str] = Field(
        description="MIT/IIT-style course outcomes"
    )
    modules: list[ModuleSchema]
    sources: list[str] = Field(
        default_factory=list,
        description="Web sources used for research"
    )
    chunk_count: int = Field(
        default=0,
        description="Number of chunks vectorized"
    )


# JSON Schema for Gemini structured output.
# Subject-agnostic by design: nothing here assumes a technical domain — the
# same shape drives a biology course, a history course, or a CS course.
QUIZ_QUESTION_JSON_SCHEMA = {
    "type": "object",
    "required": ["text", "type", "options", "correct_answer"],
    "properties": {
        "text": {"type": "string"},
        "type": {"type": "string", "enum": ["multiple_choice", "true_false"]},
        "options": {"type": "array", "items": {"type": "string"}},
        "correct_answer": {"type": "string", "description": "Must exactly match one entry in options"},
        "explanation": {"type": "string"},
    },
}

COURSE_STRUCTURE_SCHEMA = {
    "type": "object",
    "required": ["title", "description", "course_outcomes", "modules"],
    "properties": {
        "title": {"type": "string"},
        "description": {"type": "string"},
        "course_outcomes": {
            "type": "array",
            "items": {"type": "string"},
            "description": "5-8 measurable course outcomes"
        },
        "estimated_hours": {"type": "integer"},
        "modules": {
            "type": "array",
            "items": {
                "type": "object",
                "required": ["title", "description", "order", "bloom_progression", "lessons", "quiz"],
                "properties": {
                    "title": {"type": "string"},
                    "description": {"type": "string"},
                    "order": {"type": "integer"},
                    "bloom_progression": {
                        "type": "string",
                        "enum": ["remember", "understand", "apply", "analyze", "evaluate", "create"]
                    },
                    "lessons": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "required": ["title", "description", "bloom_level"],
                            "properties": {
                                "title": {"type": "string"},
                                "description": {"type": "string"},
                                "bloom_level": {
                                    "type": "string",
                                    "enum": ["remember", "understand", "apply", "analyze", "evaluate", "create"]
                                },
                                "duration_minutes": {"type": "integer"},
                                "learning_objectives": {
                                    "type": "array",
                                    "items": {"type": "string"}
                                },
                                "key_concepts": {
                                    "type": "array",
                                    "items": {"type": "string"}
                                }
                            }
                        }
                    },
                    "course_outcomes": {
                        "type": "array",
                        "items": {"type": "string"}
                    },
                    "quiz": {
                        "type": "object",
                        "required": ["questions"],
                        "description": "Gatekeeper quiz (3-8 questions) students must pass to advance past this module",
                        "properties": {
                            "questions": {
                                "type": "array",
                                "items": QUIZ_QUESTION_JSON_SCHEMA,
                            }
                        }
                    }
                }
            }
        }
    }
}
