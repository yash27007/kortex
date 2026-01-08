"""
Inngest Function: User Performance Analyzer

Trigger: quiz.completed event
Role: Analyzes user quiz results and updates their weakness profile.

This runs asynchronously after a quiz is completed to:
1. Aggregate user errors across quizzes
2. Identify patterns in mistakes
3. Update the user's "Weakness Profile" in Redis/Qdrant
4. Enable future personalization in tutoring and quiz generation
"""

import inngest
from datetime import datetime

from ..inngest_client import inngest_client
from ..clients import get_gemini_client, get_redis_client


@inngest_client.create_function(
    fn_id="analyze-user-performance",
    trigger=inngest.TriggerEvent(event="quiz.completed"),
    retries=1,
)
async def analyze_user_performance(
    ctx: inngest.Context,
    step: inngest.Step,
) -> dict:
    """
    Analyzes quiz results to build a user's weakness profile.
    
    Event Data:
        user_id: str - User identifier
        course_id: str - Course context
        lesson_id: str - Lesson context
        quiz_id: str - Quiz identifier
        questions: list[dict] - Questions with user answers
            - question: str
            - correct_idx: int
            - user_answer: int
            - is_correct: bool
            - topic: str (optional)
            - difficulty: str (optional)
        score: float - Overall score (0-1)
        time_taken_seconds: int - Time to complete quiz
    
    Returns:
        dict with analysis results and updated profile
    """
    event_data = ctx.event.data
    user_id = event_data.get("user_id", "")
    course_id = event_data.get("course_id", "")
    lesson_id = event_data.get("lesson_id", "")
    quiz_id = event_data.get("quiz_id", "")
    questions = event_data.get("questions", [])
    score = event_data.get("score", 0.0)
    time_taken = event_data.get("time_taken_seconds", 0)
    
    if not user_id or not questions:
        return {"status": "skipped", "reason": "Missing user_id or questions"}
    
    # Step 1: Extract incorrect answers and patterns
    async def analyze_mistakes():
        """Analyze which questions the user got wrong and why."""
        incorrect = []
        topics_missed = {}
        difficulty_performance = {"easy": 0, "medium": 0, "hard": 0}
        difficulty_counts = {"easy": 0, "medium": 0, "hard": 0}
        
        for q in questions:
            difficulty = q.get("difficulty", "medium")
            difficulty_counts[difficulty] = difficulty_counts.get(difficulty, 0) + 1
            
            if q.get("is_correct", False):
                difficulty_performance[difficulty] = (
                    difficulty_performance.get(difficulty, 0) + 1
                )
            else:
                incorrect.append({
                    "question": q.get("question", ""),
                    "topic": q.get("topic", "general"),
                    "difficulty": difficulty,
                    "user_answer": q.get("user_answer"),
                    "correct_answer": q.get("correct_idx"),
                })
                
                topic = q.get("topic", "general")
                topics_missed[topic] = topics_missed.get(topic, 0) + 1
        
        # Calculate difficulty-wise accuracy
        difficulty_accuracy = {}
        for diff in ["easy", "medium", "hard"]:
            if difficulty_counts[diff] > 0:
                difficulty_accuracy[diff] = (
                    difficulty_performance[diff] / difficulty_counts[diff]
                )
            else:
                difficulty_accuracy[diff] = None
        
        return {
            "incorrect_questions": incorrect,
            "topics_missed": topics_missed,
            "difficulty_accuracy": difficulty_accuracy,
            "total_incorrect": len(incorrect),
        }
    
    analysis = await step.run("analyze-mistakes", analyze_mistakes)
    
    # Step 2: Use AI to identify deeper patterns
    async def identify_patterns():
        """Use Gemini to identify patterns in user mistakes."""
        if not analysis.get("incorrect_questions"):
            return {"patterns": [], "recommendations": []}
        
        gemini = get_gemini_client()
        
        incorrect_summary = "\n".join([
            f"- Topic: {q['topic']}, Difficulty: {q['difficulty']}, Question: {q['question'][:100]}..."
            for q in analysis["incorrect_questions"][:10]  # Limit for context
        ])
        
        prompt = f"""Analyze these incorrect quiz answers and identify learning patterns:

## Incorrect Answers
{incorrect_summary}

## Performance Summary
- Total Score: {score * 100:.1f}%
- Topics Missed: {analysis['topics_missed']}
- Difficulty Performance: {analysis['difficulty_accuracy']}

## Analysis Tasks
1. Identify 1-3 specific conceptual gaps (not just topic names)
2. Suggest 2-3 targeted study recommendations
3. Rate the severity of each gap (minor/moderate/significant)

Return as JSON with:
- patterns: list of {{ "gap": str, "severity": str, "topics": list[str] }}
- recommendations: list of str"""

        result = await gemini.generate_json(
            prompt=prompt,
            schema={
                "type": "object",
                "properties": {
                    "patterns": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "gap": {"type": "string"},
                                "severity": {"type": "string"},
                                "topics": {
                                    "type": "array",
                                    "items": {"type": "string"}
                                }
                            }
                        }
                    },
                    "recommendations": {
                        "type": "array",
                        "items": {"type": "string"}
                    }
                }
            },
            use_pro=False,
        )
        
        return {
            "patterns": result.get("patterns", []),
            "recommendations": result.get("recommendations", []),
        }
    
    patterns_result = await step.run("identify-patterns", identify_patterns)
    
    # Step 3: Update user's weakness profile in Redis
    async def update_weakness_profile():
        """Update the user's weakness profile for future personalization."""
        redis = get_redis_client()
        profile_key = f"user_profile:{user_id}"
        
        # Get existing profile
        existing = await redis.get(profile_key)
        if not existing:
            existing = {
                "user_id": user_id,
                "created_at": datetime.now().isoformat(),
                "quiz_history": [],
                "weak_topics": {},
                "patterns": [],
                "total_quizzes": 0,
                "average_score": 0.0,
            }
        
        # Update quiz history (keep last 20)
        quiz_record = {
            "quiz_id": quiz_id,
            "course_id": course_id,
            "lesson_id": lesson_id,
            "score": score,
            "timestamp": datetime.now().isoformat(),
            "topics_missed": analysis.get("topics_missed", {}),
        }
        
        existing["quiz_history"] = (
            existing.get("quiz_history", [])[-19:] + [quiz_record]
        )
        
        # Update weak topics (increment counts)
        for topic, count in analysis.get("topics_missed", {}).items():
            current = existing.get("weak_topics", {}).get(topic, 0)
            existing.setdefault("weak_topics", {})[topic] = current + count
        
        # Update patterns (keep unique patterns)
        existing_patterns = {p.get("gap", "") for p in existing.get("patterns", [])}
        for pattern in patterns_result.get("patterns", []):
            if pattern.get("gap") not in existing_patterns:
                existing.setdefault("patterns", []).append(pattern)
        existing["patterns"] = existing.get("patterns", [])[-10:]  # Keep last 10
        
        # Update statistics
        total_quizzes = existing.get("total_quizzes", 0) + 1
        avg_score = existing.get("average_score", 0.0)
        new_avg = ((avg_score * (total_quizzes - 1)) + score) / total_quizzes
        
        existing["total_quizzes"] = total_quizzes
        existing["average_score"] = new_avg
        existing["updated_at"] = datetime.now().isoformat()
        
        # Save updated profile
        await redis.set(profile_key, existing, ttl=86400 * 90)  # 90 days
        
        return {
            "profile_updated": True,
            "total_quizzes": total_quizzes,
            "average_score": new_avg,
            "weak_topics_count": len(existing.get("weak_topics", {})),
        }
    
    profile_result = await step.run("update-weakness-profile", update_weakness_profile)
    
    # Step 4: Store detailed quiz results for analytics
    async def store_analytics():
        """Store detailed quiz analytics for dashboard reporting."""
        redis = get_redis_client()
        
        analytics_data = {
            "quiz_id": quiz_id,
            "user_id": user_id,
            "course_id": course_id,
            "lesson_id": lesson_id,
            "score": score,
            "time_taken_seconds": time_taken,
            "total_questions": len(questions),
            "correct_count": len(questions) - analysis.get("total_incorrect", 0),
            "topics_missed": analysis.get("topics_missed", {}),
            "difficulty_accuracy": analysis.get("difficulty_accuracy", {}),
            "patterns_identified": len(patterns_result.get("patterns", [])),
            "timestamp": datetime.now().isoformat(),
        }
        
        # Store in a sorted set for time-series queries
        await redis.set(
            f"quiz_analytics:{quiz_id}",
            analytics_data,
            ttl=86400 * 365,  # 1 year
        )
        
        return {"analytics_stored": True}
    
    await step.run("store-analytics", store_analytics)
    
    return {
        "status": "success",
        "user_id": user_id,
        "quiz_id": quiz_id,
        "score": score,
        "incorrect_count": analysis.get("total_incorrect", 0),
        "patterns_found": len(patterns_result.get("patterns", [])),
        "recommendations": patterns_result.get("recommendations", []),
        "profile_stats": {
            "total_quizzes": profile_result.get("total_quizzes", 0),
            "average_score": profile_result.get("average_score", 0.0),
            "weak_topics_tracked": profile_result.get("weak_topics_count", 0),
        },
    }





