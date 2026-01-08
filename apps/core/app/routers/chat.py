"""
Chat/Tutor API Endpoints (Streaming)
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from sse_starlette.sse import EventSourceResponse
import json

from ..agents import TutorAgent
from ..schemas import ChatInput

router = APIRouter(prefix="/chat", tags=["chat"])


async def chat_event_generator(input_data: ChatInput):
    """Generate SSE events for chat streaming."""
    agent = TutorAgent()
    
    try:
        async for token in agent.chat_stream(input_data):
            yield {
                "event": "token",
                "data": json.dumps({"token": token}),
            }
        
        yield {
            "event": "done",
            "data": json.dumps({"status": "complete"}),
        }
    except Exception as e:
        yield {
            "event": "error",
            "data": json.dumps({"error": str(e)}),
        }


@router.post("/stream")
async def chat_stream(input_data: ChatInput):
    """
    Agent C: The Socratic Tutor (Streaming)
    
    Streams responses token-by-token using Server-Sent Events.
    The tutor guides students without giving direct answers.
    
    Events:
    - token: Individual token from the response
    - done: Generation complete
    - error: Error occurred
    """
    return EventSourceResponse(
        chat_event_generator(input_data),
        media_type="text/event-stream",
    )


@router.post("/message")
async def chat_message(input_data: ChatInput) -> dict:
    """
    Agent C: The Socratic Tutor (Non-streaming)
    
    Returns the complete response at once.
    Use /chat/stream for real-time streaming.
    """
    try:
        agent = TutorAgent()
        response = await agent.chat(input_data)
        return {
            "session_id": input_data.session_id,
            "response": response,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check():
    """Check if the chat service is healthy."""
    return {"status": "healthy", "service": "chat"}







