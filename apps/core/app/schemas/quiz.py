"""
Quiz Generation Schemas
"""

from pydantic import BaseModel, Field


class QuizQuestion(BaseModel):
    """Single quiz question."""
    question: str
    options: list[str] = Field(..., min_length=4, max_length=4)
    correct_idx: int = Field(..., ge=0, le=3)
    explanation: str
    difficulty: str = Field(default="medium")
    targets_weakness: bool = Field(
        default=False,
        description="Whether this question targets identified weakness"
    )
    weakness_topic: str | None = Field(default=None)


class QuizGenerationInput(BaseModel):
    """Input for quiz generation."""
    user_id: str
    lesson_id: str
    course_id: str
    num_questions: int = Field(default=5, ge=3, le=10)


class QuizOutput(BaseModel):
    """Output from quiz generation."""
    quiz_id: str
    lesson_id: str
    questions: list[QuizQuestion]
    targeted_weaknesses: list[str] = Field(
        default_factory=list,
        description="Weaknesses identified from chat history"
    )
    difficulty_distribution: dict = Field(
        default_factory=dict,
        description="Distribution of question difficulties"
    )


# JSON Schema for quiz generation
QUIZ_SCHEMA = {
    "type": "object",
    "required": ["questions"],
    "properties": {
        "questions": {
            "type": "array",
            "items": {
                "type": "object",
                "required": ["question", "options", "correct_idx", "explanation"],
                "properties": {
                    "question": {"type": "string"},
                    "options": {
                        "type": "array",
                        "items": {"type": "string"},
                        "minItems": 4,
                        "maxItems": 4
                    },
                    "correct_idx": {"type": "integer", "minimum": 0, "maximum": 3},
                    "explanation": {"type": "string"},
                    "difficulty": {
                        "type": "string",
                        "enum": ["easy", "medium", "hard"]
                    },
                    "targets_weakness": {"type": "boolean"},
                    "weakness_topic": {"type": "string"}
                }
            }
        },
        "identified_weaknesses": {
            "type": "array",
            "items": {"type": "string"}
        }
    }
}





