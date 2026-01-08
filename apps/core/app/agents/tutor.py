"""
Agent C: The "Socratic Tutor" - Chatbot Agent

Role: Answers student questions inside a lesson without giving direct answers.
Trigger: POST /chat/stream (Streaming Response)
"""

from typing import AsyncGenerator

from ..clients import get_gemini_client, get_qdrant_client, get_redis_client
from ..schemas.chat import ChatInput, ChatMessage


TUTOR_SYSTEM_PROMPT = """You are Kai, the Socratic tutor for Kortex.

## Your Core Philosophy
You NEVER give direct answers. Instead, you guide students to discover answers themselves through thoughtful questions and hints.

## Your Approach by Bloom's Level
- REMEMBER level: Help recall with memory cues ("What did you learn about X?")
- UNDERSTAND level: Ask for explanations ("Can you explain in your own words?")
- APPLY level: Guide through steps ("What would be your first step?")
- ANALYZE level: Break down problems ("What components make up this concept?")
- EVALUATE level: Encourage critical thinking ("What are the trade-offs?")
- CREATE level: Scaffold ideas ("How might you combine these concepts?")

## Guidelines
1. Start by acknowledging the student's question
2. Ask ONE focused guiding question
3. If they're stuck, provide a small hint, then another question
4. Use analogies and examples from real life
5. Celebrate progress and correct thinking
6. Gently redirect misconceptions without dismissing them
7. Keep responses concise (2-4 sentences)
8. NEVER say "the answer is..." or directly solve problems

## Your Personality
- Warm and encouraging
- Patient with confusion
- Curious about the student's thought process
- Uses occasional emojis for friendliness 🤔 💡 ✨
"""


class TutorAgent:
    """
    The Socratic Tutor Agent provides guided assistance
    without giving direct answers.
    """
    
    def __init__(self):
        self.gemini = get_gemini_client()
        self.qdrant = get_qdrant_client()
        self.redis = get_redis_client()
    
    async def chat_stream(
        self,
        input_data: ChatInput,
    ) -> AsyncGenerator[str, None]:
        """
        Main workflow:
        1. Context Assembly: Get lesson content + chat history
        2. RAG: Retrieve relevant facts for grounding
        3. Generate: Stream response token by token
        """
        # Step 1: Get chat history
        history = await self.redis.get_chat_history(
            input_data.session_id,
            limit=5,
        )
        
        # Step 2: Get lesson context
        lesson_content = await self.redis.get_cached_lesson(
            input_data.lesson_context_id
        )
        
        # Step 3: RAG retrieval for fact-checking
        query_embedding = await self.gemini.embed_single(input_data.query)
        facts = await self.qdrant.search(
            collection_name=input_data.course_id,
            query_vector=query_embedding,
            limit=3,
        )
        
        fact_context = "\n".join([f["text"] for f in facts])
        
        # Step 4: Build conversation context
        history_text = ""
        for msg in history:
            role = "Student" if msg["role"] == "user" else "Kai"
            history_text += f"{role}: {msg['content']}\n"
        
        # Step 5: Create prompt
        prompt = f"""## Current Lesson Context
{lesson_content[:3000] if lesson_content else "No lesson context available."}

## Verified Facts (use only these for answers)
{fact_context if fact_context else "No specific facts retrieved."}

## Student's Current Level
Estimated Bloom's Level: {input_data.user_bloom_level}

## Recent Conversation
{history_text if history_text else "This is the start of the conversation."}

## Student's Question
{input_data.query}

## Your Response (as Kai)
Remember: Guide with questions, don't give direct answers. Be warm and encouraging."""

        # Save user message to history
        await self.redis.add_chat_message(
            input_data.session_id,
            "user",
            input_data.query,
        )
        
        # Step 6: Stream response
        full_response = ""
        async for token in self.gemini.generate_stream(
            prompt=prompt,
            system_instruction=TUTOR_SYSTEM_PROMPT,
            use_pro=False,  # Use Flash for speed
            temperature=0.8,
        ):
            full_response += token
            yield token
        
        # Save assistant response to history
        await self.redis.add_chat_message(
            input_data.session_id,
            "assistant",
            full_response,
        )
    
    async def chat(self, input_data: ChatInput) -> str:
        """Non-streaming chat for simpler use cases."""
        response = ""
        async for token in self.chat_stream(input_data):
            response += token
        return response







