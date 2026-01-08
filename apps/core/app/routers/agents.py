"""
Agent API Endpoints
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel

from ..agents import ArchitectAgent, AuthorAgent, QuizmasterAgent
from ..schemas import (
    CourseStructureInput,
    CourseStructureOutput,
    ContentGenerationInput,
    ContentGenerationOutput,
    QuizGenerationInput,
    QuizOutput,
)

router = APIRouter(prefix="/agent", tags=["agents"])


# Response wrapper
class JobResponse(BaseModel):
    job_id: str
    status: str
    message: str


@router.post("/structure", response_model=CourseStructureOutput)
async def generate_course_structure(input_data: CourseStructureInput):
    """
    Agent A: The Architect
    
    Ingests PDFs and web research to build a course structure
    following Bloom's Taxonomy progression.
    """
    try:
        agent = ArchitectAgent()
        result = await agent.generate_structure(input_data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/content", response_model=ContentGenerationOutput)
async def generate_lesson_content(input_data: ContentGenerationInput):
    """
    Agent B: The Author & Animator
    
    Generates MDX lesson content using RAG and optionally
    creates Manim visualizations.
    """
    try:
        agent = AuthorAgent()
        result = await agent.generate_content(input_data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/quiz", response_model=QuizOutput)
async def generate_quiz(input_data: QuizGenerationInput):
    """
    Agent D: The Quizmaster
    
    Generates personalized quizzes targeting student weaknesses
    identified from chat history.
    """
    logger = get_logger("quizmaster")
    logger.step("START", f"Generating quiz for course: {input_data.course_id}")
    try:
        agent = QuizmasterAgent()
        logger.thinking("Initializing Quizmaster agent...")
        result = await agent.generate_quiz(input_data)
        logger.success(f"Quiz generated: {len(result.questions)} questions")
        return result
    except Exception as e:
        logger.error("Failed to generate quiz", exc=e)
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/course/{course_id}")
async def delete_course_resources(course_id: str):
    """
    Clean up external resources for a course:
    1. Qdrant vector collection
    2. Redis search logs
    """
    logger = get_logger("api")
    logger.info(f"Cleaning up resources for course: {course_id}")
    
    try:
        # 1. Delete Qdrant collection
        from ..clients import get_qdrant_client
        qdrant = get_qdrant_client()
        await qdrant.delete_collection(course_id)
        
        # 2. Delete Redis logs
        from ..clients import get_redis_client
        redis = get_redis_client()
        await redis.client.delete(f"web_search_logs:{course_id}")
        
        return {"status": "success", "message": f"Resources cleaned for {course_id}"}
    except Exception as e:
        logger.error(f"Failed to clean up course resources: {e}")
        # Don't fail the request, just log error
        return {"status": "partial_success", "error": str(e)}


@router.get("/health")
async def health_check():
    """Check if the agent service is healthy."""
    logger = get_logger("api")
    logger.info("Health check requested for agents service")
    return {"status": "healthy", "service": "agents"}







