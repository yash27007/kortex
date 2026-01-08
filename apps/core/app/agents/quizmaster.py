"""
Agent D: The "Quizmaster" - Assessment Agent

Role: Generates personalized quizzes based on user struggles.
Trigger: POST /agent/quiz
"""

import uuid

from ..clients import get_gemini_client, get_qdrant_client, get_redis_client
from ..schemas.quiz import (
    QuizGenerationInput,
    QuizOutput,
    QuizQuestion,
    QUIZ_SCHEMA,
)


QUIZMASTER_SYSTEM_PROMPT = """You are an expert assessment designer for educational content.

Your role is to create effective quiz questions that:
1. Test understanding at appropriate Bloom's levels
2. Include clear, unambiguous answer options
3. Provide helpful explanations for learning
4. Target identified student weaknesses when applicable

## Question Types by Bloom's Level
- REMEMBER: Definition matching, fact recall, identification
- UNDERSTAND: Concept explanation, comparison, interpretation
- APPLY: Problem-solving, procedure application, calculations
- ANALYZE: Pattern recognition, cause-effect, component identification
- EVALUATE: Judgment, critique, comparison of approaches
- CREATE: Design, synthesis, novel application

## Guidelines for Good Questions
1. One clear correct answer
2. Plausible distractors (wrong answers)
3. No trick questions or ambiguous wording
4. Test concepts, not reading comprehension
5. Explanations should teach, not just confirm

## Targeting Weaknesses
When generating questions for identified weaknesses:
- Include 2-3 questions specifically on the weak topic
- Vary the difficulty and angle of these questions
- Make explanations extra detailed for weakness questions
"""


class QuizmasterAgent:
    """
    The Quizmaster Agent generates personalized quizzes
    that target student weaknesses identified from chat history.
    """
    
    def __init__(self):
        self.gemini = get_gemini_client()
        self.qdrant = get_qdrant_client()
        self.redis = get_redis_client()
    
    async def _analyze_weaknesses(
        self,
        user_id: str,
        session_id: str | None = None,
    ) -> list[str]:
        """Analyze chat history to identify student weaknesses."""
        # Get recent chat history
        chat_key = f"chat:{session_id}" if session_id else f"chat:{user_id}"
        history = await self.redis.get_chat_history(chat_key, limit=20)
        
        if not history:
            return []
        
        # Build conversation for analysis
        conversation = "\n".join([
            f"{'Student' if m['role'] == 'user' else 'Tutor'}: {m['content']}"
            for m in history
        ])
        
        analysis_prompt = f"""Analyze this tutoring conversation and identify specific topics 
the student struggled with or asked multiple questions about.

## Conversation
{conversation}

## Output
List 1-3 specific topics/concepts the student found challenging.
Focus on academic concepts, not general confusion.
If no clear weaknesses, return an empty list.

Return as a JSON object with "weaknesses" array of strings."""

        result = await self.gemini.generate_json(
            prompt=analysis_prompt,
            schema={
                "type": "object",
                "properties": {
                    "weaknesses": {
                        "type": "array",
                        "items": {"type": "string"}
                    }
                }
            },
            use_pro=False,
        )
        
        return result.get("weaknesses", [])
    
    async def generate_quiz(
        self,
        input_data: QuizGenerationInput,
    ) -> QuizOutput:
        """
        Main workflow:
        1. Analyze Weaknesses: Check chat history for struggles
        2. Get Lesson Context: Retrieve relevant content
        3. Generate Questions: Create targeted quiz
        4. Return: Formatted quiz with metadata
        """
        quiz_id = f"quiz_{uuid.uuid4().hex[:12]}"
        
        # Step 1: Analyze weaknesses
        weaknesses = await self._analyze_weaknesses(input_data.user_id)
        
        # Step 2: Get lesson context from cache
        lesson_content = await self.redis.get_cached_lesson(input_data.lesson_id)
        
        # Step 3: Get additional context from Qdrant
        if lesson_content:
            query_embedding = await self.gemini.embed_single(lesson_content[:500])
            related_chunks = await self.qdrant.search(
                collection_name=input_data.course_id,
                query_vector=query_embedding,
                limit=3,
            )
            additional_context = "\n".join([c["text"] for c in related_chunks])
        else:
            additional_context = ""
        
        # Step 4: Generate quiz
        weakness_instruction = ""
        if weaknesses:
            weakness_instruction = f"""
## Identified Student Weaknesses (target these with 2 questions)
{chr(10).join(f'- {w}' for w in weaknesses)}
"""
        
        quiz_prompt = f"""Generate a quiz with {input_data.num_questions} questions.

## Lesson Content
{lesson_content[:4000] if lesson_content else "No lesson content available."}

## Additional Context
{additional_context}

{weakness_instruction}

## Requirements
1. Generate exactly {input_data.num_questions} questions
2. Include a mix of difficulties (easy, medium, hard)
3. Each question must have exactly 4 options
4. correct_idx is 0-indexed (0-3)
5. If weaknesses identified, 2 questions should target them
6. Explanations should help students learn

Generate the quiz now."""

        quiz_data = await self.gemini.generate_json(
            prompt=quiz_prompt,
            schema=QUIZ_SCHEMA,
            system_instruction=QUIZMASTER_SYSTEM_PROMPT,
            use_pro=True,
        )
        
        # Step 5: Build output
        questions = []
        difficulty_counts = {"easy": 0, "medium": 0, "hard": 0}
        
        for q_data in quiz_data.get("questions", []):
            question = QuizQuestion(
                question=q_data["question"],
                options=q_data["options"],
                correct_idx=q_data["correct_idx"],
                explanation=q_data["explanation"],
                difficulty=q_data.get("difficulty", "medium"),
                targets_weakness=q_data.get("targets_weakness", False),
                weakness_topic=q_data.get("weakness_topic"),
            )
            questions.append(question)
            difficulty_counts[question.difficulty] = (
                difficulty_counts.get(question.difficulty, 0) + 1
            )
        
        return QuizOutput(
            quiz_id=quiz_id,
            lesson_id=input_data.lesson_id,
            questions=questions,
            targeted_weaknesses=weaknesses,
            difficulty_distribution=difficulty_counts,
        )







