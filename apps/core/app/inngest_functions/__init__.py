"""
Kortex AI Core - Inngest Functions

This module contains all Inngest functions for long-running AI workflows.

Functions:
    - create_course_structure: The Architect - Generates course structure from PDFs
    - generate_lesson_content: The Author - Creates MDX lesson content with RAG
    - analyze_user_performance: Analyzer - Updates user weakness profiles

Events:
    - course.create: Triggers course structure generation
    - lesson.generate: Triggers individual lesson content generation (fan-out)
    - quiz.completed: Triggers user performance analysis
"""

from .architect import create_course_structure
from .author import generate_lesson_content
from .analyzer import analyze_user_performance


# All Inngest functions to register with the serve handler
inngest_functions = [
    create_course_structure,
    generate_lesson_content,
    analyze_user_performance,
]


__all__ = [
    "create_course_structure",
    "generate_lesson_content",
    "analyze_user_performance",
    "inngest_functions",
]





