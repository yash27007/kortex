"""
Kortex AI Core - FastAPI Backend

The Intelligence Worker for Kortex. This service handles:
- Agent A: Course Structure Generation (The Architect) - via Inngest
- Agent B: Content Generation with Manim (The Author) - via Inngest
- Agent C: Socratic Tutoring Chat (The Tutor) - real-time FastAPI
- Agent D: Personalized Quiz Generation (The Quizmaster) - real-time FastAPI

Long-running workflows (course generation) use Inngest for:
- Reliability (automatic retries)
- Fan-out (parallel lesson generation)
- Rate limiting (concurrency controls)
- Observability (step-by-step tracking)
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .routers import agents_router, chat_router, storage_router, web_search_logs_router
from .inngest_client import create_inngest_serve
from .utils.logger import get_logger


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    # Startup
    settings = get_settings()
    logger = get_logger("startup")
    
    print(f"🚀 Starting {settings.app_name}")
    print(f"📊 Qdrant: {settings.qdrant_host}:{settings.qdrant_port}")
    print(f"🔴 Redis: {settings.redis_host}:{settings.redis_port}")
    print(f"🤖 Gemini Pro: {settings.gemini_pro_model}")
    print(f"⚡ Gemini Flash: {settings.gemini_flash_model}")
    print(f"⚙️  Inngest: Enabled for long-running workflows")
    
    # Verify critical API keys
    if not settings.tavily_key:
        logger.warning("⚠️  TAVILY_KEY not set. Web search will be disabled.")
    else:
        print(f"✅ Tavily API Key configured")
        
    if not settings.gemini_api_key:
        logger.error("❌ GEMINI_API_KEY not set. AI features will fail.")
    else:
        print(f"✅ Gemini API Key configured")
        
    # Verify Redis connection
    try:
        from .clients import get_redis_client
        redis = get_redis_client()
        if await redis.client.ping():
            print(f"✅ Redis connection successful")
    except Exception as e:
        logger.error(f"❌ Redis connection failed: {e}")
        
    yield
    
    # Shutdown
    print("👋 Shutting down Kortex AI Core")


# Create FastAPI app
app = FastAPI(
    title="Kortex AI Core",
    description="""
    The Intelligence Worker for the Kortex learning platform.
    
    ## Agents
    
    * **Architect** - Generates course structures from PDFs and web research
    * **Author** - Creates MDX lesson content with RAG
    * **Tutor** - Provides Socratic tutoring via chat
    * **Quizmaster** - Generates personalized quizzes
    
    ## Features
    
    * Bloom's Taxonomy progression
    * RAG-powered content generation
    * Streaming chat responses
    * Weakness-targeted assessments
    """,
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(agents_router)
app.include_router(chat_router)
app.include_router(storage_router)
app.include_router(web_search_logs_router)

# Mount Inngest serve handler at /api/inngest
# This handles all Inngest function invocations
create_inngest_serve(app)


@app.get("/")
async def root():
    """Root endpoint - API info."""
    return {
        "name": "Kortex AI Core",
        "version": "0.1.0",
        "status": "running",
        "docs": "/docs",
        "agents": [
            {"name": "Architect", "endpoint": "/agent/structure", "inngest": "course.create"},
            {"name": "Author", "endpoint": "/agent/content", "inngest": "lesson.generate"},
            {"name": "Tutor", "endpoint": "/chat/stream"},
            {"name": "Quizmaster", "endpoint": "/agent/quiz"},
        ],
        "inngest": {
            "endpoint": "/api/inngest",
            "events": [
                {"name": "course.create", "description": "Trigger full course generation"},
                {"name": "lesson.generate", "description": "Generate single lesson content (internal fan-out)"},
                {"name": "quiz.completed", "description": "Analyze quiz results and update user profile"},
            ],
        },
        "storage": {
            "endpoint": "/storage",
            "operations": ["upload", "download", "signed-url", "list", "delete"],
            "health": "/storage/health",
        },
    }


@app.get("/health")
async def health():
    """Health check endpoint."""
    logger = get_logger("api")
    logger.step("HEALTH", "Health check requested")
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
