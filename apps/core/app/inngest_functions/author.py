"""
Inngest Function: The Author (Lesson Content Agent)

Trigger: lesson.generate event
Role: Writes MDX lesson content — for any academic subject — with inline
Mermaid diagrams and Markdown tables where they help understanding.

This function is triggered via fan-out from the Architect. It runs with
concurrency limits to respect Gemini API rate limits.

Workflow:
1. RAG lookup for relevant context from the course's vector collection
2. Draft MDX content (diagrams/tables authored inline, not a separate channel)
3. Save the lesson via the internal Next.js API
"""

import inngest

from ..inngest_client import inngest_client
from ..clients import get_gemini_client, get_qdrant_client, get_redis_client
from ..utils.logger import get_logger
from ..utils.db import update_lesson_content


AUTHOR_SYSTEM_PROMPT = """You are an expert educational content writer for the Kortex learning platform, capable of writing engaging lesson content in ANY academic subject — biology, history, literature, law, mathematics, art, economics, computer science, and beyond.

Your role is to write clear lesson content in MDX (Markdown + JSX) format that:
1. Matches the specified Bloom's Taxonomy level
2. Builds conceptual understanding progressively
3. Includes examples and applications appropriate to the subject
4. Uses diagrams where they genuinely aid understanding, not decoratively

## Available formatting (use only these — anything else will not render):
- Standard Markdown: headings (##, ###), **bold**, *italic*, lists, blockquotes
- GitHub-flavored Markdown tables for any comparison, classification, or structured data
- Fenced code blocks (```language) for code, formulas, or any literal text that benefits from monospacing
- Fenced ```mermaid blocks for diagrams — see guidance below
- <Callout type="info|warning|tip">...</Callout> for a highlighted aside (only these three types)

## Mermaid diagrams — pick the type that fits the subject, not just flowcharts:
- `flowchart` — any process, cycle, or decision sequence (a biological process, a legal procedure, an algorithm, a historical chain of causation)
- `sequenceDiagram` — interactions between actors/entities over time
- `classDiagram` or `erDiagram` — structural or taxonomic relationships (species classification, organizational structure, data models)
- `stateDiagram-v2` — states and transitions (a cell cycle, a legal case's status, a chemical phase)
- `timeline` — chronological events (a historical era, a biological development stage, a project history)
- `mindmap` — how concepts within a topic relate to each other
- `pie` — proportional composition
Only include a diagram when it clarifies something prose alone would explain poorly. Not every lesson needs one.

## Bloom's Level Guidelines:
- REMEMBER: Focus on definitions, lists, basic facts
- UNDERSTAND: Explain concepts, provide analogies, compare/contrast (a table often works well here)
- APPLY: Step-by-step procedures, worked examples, practice problems
- ANALYZE: Case studies, break down complex systems, identify patterns
- EVALUATE: Critical thinking, pros/cons analysis, decision-making
- CREATE: Project prompts, design challenges, synthesis tasks

Write content that is clear, well-structured, and grounded in real examples from the subject — never force a technical/coding framing onto a non-technical subject.
"""


@inngest_client.create_function(
    fn_id="generate-lesson-content",
    trigger=inngest.TriggerEvent(event="lesson.generate"),
    concurrency=[
        # Limit concurrent runs to avoid hitting Gemini rate limits
        inngest.Concurrency(limit=5),
    ],
    # Slightly more headroom than the Architect: individual lesson generation
    # runs 5-wide concurrently and can hit transient Gemini rate limiting
    # under that load; a 4th attempt costs little and clears most of those.
    retries=3,
)
async def generate_lesson_content(
    ctx: inngest.Context,
) -> dict:
    """
    The Author: Generates MDX lesson content with RAG-grounded context.

    Event Data:
        course_id: str - Course ID for RAG retrieval
        module_id: str - Parent module's real database id
        module_title: str - Parent module title
        lesson_id: str - Lesson's real database id
        title: str - Lesson title
        description: str - Lesson description
        bloom_level: str - Bloom's taxonomy level
        duration_minutes: int - Expected lesson duration
        learning_objectives: list[str] - Learning objectives
        key_concepts: list[str] - Key concepts to cover

    Returns:
        dict with lesson_id, word_count, reading_time_minutes
    """
    event_data = ctx.event.data
    course_id = event_data.get("course_id", "")
    module_id = event_data.get("module_id", "")
    module_title = event_data.get("module_title", "")
    lesson_id = event_data.get("lesson_id", "")
    title = event_data.get("title", "Untitled Lesson")
    description = event_data.get("description", "")
    bloom_level = event_data.get("bloom_level", "understand")
    duration_minutes = event_data.get("duration_minutes", 30)
    learning_objectives = event_data.get("learning_objectives", [])
    key_concepts = event_data.get("key_concepts", [])

    logger = get_logger(lesson_id)
    logger.step("START", f"Generating lesson: {title}")

    if not lesson_id:
        logger.error("No lesson_id provided in event data — cannot save content")
        return {"status": "error", "error": "missing lesson_id"}

    # Step 1: RAG lookup — get relevant context from Qdrant
    async def rag_lookup():
        """Query Qdrant for context relevant to the lesson."""
        logger.thinking(f"Analyzing bloom level '{bloom_level}' and key concepts")
        try:
            gemini = get_gemini_client()
            qdrant = get_qdrant_client()

            query = f"{title} {description} {' '.join(key_concepts)}"
            logger.searching(f"Searching for '{title}' in vector database...")

            query_embedding = await gemini.embed_single(query)
            relevant_chunks = await qdrant.search(
                collection_name=course_id,
                query_vector=query_embedding,
                limit=5,
            )

            context = "\n\n".join([
                f"[Source: {chunk['source']}, Page {chunk['page']}]\n{chunk['text']}"
                for chunk in relevant_chunks
            ])

            logger.success(f"Retrieved {len(relevant_chunks)} relevant chunks from RAG")
            return {"context": context, "chunks_found": len(relevant_chunks)}
        except Exception as e:
            logger.error("RAG lookup failed", exc=e)
            return {"context": "", "chunks_found": 0}

    rag_result = await ctx.step.run("rag-lookup", rag_lookup)

    # Step 2: Draft MDX content (diagrams/tables authored inline by the model)
    async def draft_mdx():
        """Generate the MDX lesson content."""
        logger.generating(f"Writing MDX content for '{title}'")
        gemini = get_gemini_client()

        content_prompt = f"""Write a complete lesson in MDX format.

## Lesson Details
**Title:** {title}
**Module:** {module_title}
**Bloom's Level:** {bloom_level}
**Description:** {description}
**Expected Duration:** {duration_minutes} minutes

## Learning Objectives
{chr(10).join(f'- {obj}' for obj in learning_objectives) if learning_objectives else '- Master the core concepts of this lesson'}

## Key Concepts to Cover
{chr(10).join(f'- {concept}' for concept in key_concepts) if key_concepts else '- Core concepts from the lesson title'}

## Reference Material (from course sources)
{rag_result.get('context', 'No specific reference material available.')}

## Requirements
1. Start with a brief introduction (2-3 sentences)
2. Use proper headings (##, ###) for structure
3. Include at least 1 <Callout type="info|warning|tip"> for an important point
4. Use a Markdown table if comparing or classifying multiple things
5. Include a ```mermaid diagram only if it would genuinely clarify a process, structure, or timeline in this specific lesson — skip it otherwise
6. Match the Bloom's level in content depth and activities
7. Include concrete examples grounded in this subject
8. End with a brief summary of key takeaways

Write the complete MDX content now. Make it engaging and educational."""

        # Lesson authoring runs 15-20+ times per course, which blows past
        # the pro model's free-tier daily quota (20 requests/day/project)
        # almost immediately. flash-lite has its own separate quota bucket
        # and comfortably handles prose generation at this volume; the pro
        # model is reserved for course structure generation (architect.py),
        # where a single call per course makes the quality trade-off worth it.
        mdx_content = await gemini.generate(
            prompt=content_prompt,
            system_instruction=AUTHOR_SYSTEM_PROMPT,
            use_pro=False,
            temperature=0.7,
            max_tokens=8192,
        )

        logger.success(f"MDX content generated ({len(mdx_content)} characters)")
        return {"mdx_content": mdx_content}

    mdx_result = await ctx.step.run("draft-mdx", draft_mdx)
    mdx_content = mdx_result.get("mdx_content", "")

    # Step 3: Save the lesson via the internal Next.js API
    async def save_lesson():
        """Finalize MDX content and persist it."""
        logger.saving("Saving lesson to database...")

        word_count = len(mdx_content.split())
        reading_time = max(1, word_count // 200)

        success = await update_lesson_content(
            lesson_id=lesson_id,
            mdx_content=mdx_content,
            duration=reading_time,
        )
        if not success:
            logger.error("Failed to save lesson to database")
            raise RuntimeError(f"Could not persist lesson content for {lesson_id}")

        logger.success(f"Lesson saved: {word_count} words, {reading_time} min reading time")

        try:
            redis = get_redis_client()
            await redis.cache_lesson(lesson_id, mdx_content)
        except Exception as cache_error:
            logger.warning(f"Failed to cache lesson content: {cache_error}")

        return {
            "lesson_id": lesson_id,
            "word_count": word_count,
            "reading_time_minutes": reading_time,
        }

    final_result = await ctx.step.run("save-lesson", save_lesson)

    logger.success("✅ Lesson generation workflow complete")

    return {
        "status": "success",
        "lesson_id": lesson_id,
        "course_id": course_id,
        "module_id": module_id,
        "title": title,
        "bloom_level": bloom_level,
        "word_count": final_result.get("word_count", 0),
        "reading_time_minutes": final_result.get("reading_time_minutes", 0),
        "rag_chunks_used": rag_result.get("chunks_found", 0),
    }
