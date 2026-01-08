"""
Inngest Function: The Author & Animator (Lesson Content Agent)

Trigger: lesson.generate event
Role: Writes MDX lesson content and generates JSON-based visualizations (replaces Manim).

This function is triggered via fan-out from the Architect.
It runs with concurrency limits to respect Gemini API rate limits.

Workflow:
1. Update DB: Status = GENERATING
2. RAG lookup for relevant context
3. Update DB: RAG complete
4. Check if visualization is needed
5. Draft MDX content
6. Generate JSON visual aid (if needed)
7. Update DB: Save lesson with content
8. Update DB: Status = COMPLETED
"""

import uuid
import inngest
import json

from ..inngest_client import inngest_client
from ..clients import get_gemini_client, get_qdrant_client, get_redis_client
from ..schemas.content import MDX_STRUCTURE_SCHEMA
from ..utils.logger import get_logger
from ..utils.db import update_lesson_content


AUTHOR_SYSTEM_PROMPT = """You are an expert educational content writer for the Kortex learning platform.

Your role is to write engaging, clear lesson content in MDX format that:
1. Matches the specified Bloom's Taxonomy level
2. Uses appropriate MDX components for interactivity
3. Builds conceptual understanding progressively
4. Includes practical examples and applications

## Available MDX Components:
- <Callout type="info|warning|tip|example">content</Callout> - Highlight important information
- <Quiz question="..." options={["A", "B", "C", "D"]} correct={0} explanation="..." /> - Inline quiz
- <VisualAid data={...} /> - Interactive visualization (replaces Video)
- <CodeBlock language="python|javascript|etc">code</CodeBlock> - Code examples
- <Definition term="...">definition</Definition> - Key term definitions
- <Exercise>description</Exercise> - Practice exercises

## Bloom's Level Guidelines:
- REMEMBER: Focus on definitions, lists, basic facts
- UNDERSTAND: Explain concepts, provide analogies, compare/contrast
- APPLY: Step-by-step procedures, worked examples, practice problems
- ANALYZE: Case studies, break down complex systems, identify patterns
- EVALUATE: Critical thinking, pros/cons analysis, decision-making
- CREATE: Project prompts, design challenges, synthesis tasks

Write content that is:
- Clear and accessible
- Well-structured with proper headings
- Interactive with callouts and quizzes
- Practical with real-world examples
"""


VISUAL_AID_JSON_SCHEMA = {
    "type": "object",
    "required": ["type", "title", "data"],
    "properties": {
        "type": {
            "type": "string",
            "enum": ["sorting_algo", "graph_automata", "coordinate_system", "tree_structure", "state_machine", "geometry", "animation", "diagram"],
            "description": "Type of visualization"
        },
        "title": {
            "type": "string",
            "description": "Title of the visualization"
        },
        "data": {
            "type": "object",
            "description": "Visualization data structure (varies by type)"
        }
    }
}


@inngest_client.create_function(
    fn_id="generate-lesson-content",
    trigger=inngest.TriggerEvent(event="lesson.generate"),
    concurrency=[
        # Limit concurrent runs to avoid hitting Gemini rate limits
        inngest.Concurrency(limit=5),
    ],
    retries=2,
)
async def generate_lesson_content(
    ctx: inngest.Context,
    step: inngest.Step,
) -> dict:
    """
    The Author & Animator: Generates MDX lesson content with JSON-based visualizations.
    
    Event Data:
        course_id: str - Course ID for RAG retrieval
        module_id: str - Parent module ID
        module_title: str - Parent module title
        lesson_id: str - Lesson ID
        title: str - Lesson title
        description: str - Lesson description
        bloom_level: str - Bloom's taxonomy level
        duration_minutes: int - Expected lesson duration
        learning_objectives: list[str] - Learning objectives
        key_concepts: list[str] - Key concepts to cover
    
    Returns:
        dict with lesson_id, mdx_content, visual_aid, word_count
    """
    event_data = ctx.event.data
    course_id = event_data.get("course_id", "")
    module_id = event_data.get("module_id", "")
    module_title = event_data.get("module_title", "")
    lesson_id = event_data.get("lesson_id", f"lesson_{uuid.uuid4().hex[:12]}")
    title = event_data.get("title", "Untitled Lesson")
    description = event_data.get("description", "")
    bloom_level = event_data.get("bloom_level", "understand")
    duration_minutes = event_data.get("duration_minutes", 30)
    learning_objectives = event_data.get("learning_objectives", [])
    key_concepts = event_data.get("key_concepts", [])
    
    # Initialize logger
    logger = get_logger(lesson_id)
    logger.step("START", f"Generating lesson: {title}")
    
    # Step 1: Update DB Status (Started)
    async def update_db_start():
        """Mark lesson as generating in database."""
        try:
            await prisma.lesson.update(
                where={"id": lesson_id},
                data={"mdxContent": "Generating..."}
            )
            logger.saving(f"Updated lesson status to GENERATING")
            return {"status": "started"}
        except Exception as e:
            logger.error(f"Failed to update lesson status", exc=e)
            return {"status": "error", "error": str(e)}
    
    await step.run("update-db-start", update_db_start)
    
    # Step 2: RAG Lookup - Get relevant context from Qdrant
    async def rag_lookup():
        """Query Qdrant for context relevant to the lesson."""
        logger.thinking(f"Analyzing bloom level '{bloom_level}' and key concepts")
        try:
            gemini = get_gemini_client()
            qdrant = get_qdrant_client()
            
            # Create query from lesson details
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
            return {
                "context": context,
                "chunks_found": len(relevant_chunks),
            }
        except Exception as e:
            logger.error(f"RAG lookup failed", exc=e)
            return {"context": "", "chunks_found": 0}
    
    rag_result = await step.run("rag-lookup", rag_lookup)
    
    # Step 3: Update DB - RAG Complete
    async def update_db_rag_complete():
        """Update lesson with RAG progress."""
        success = await update_lesson_content(
            lesson_id=lesson_id,
            mdx_content=f"RAG complete: {rag_result.get('chunks_found', 0)} chunks found",
        )
        if success:
            logger.saving(f"Updated lesson: RAG complete")
            return {"status": "rag_complete"}
        else:
            logger.error(f"Failed to update RAG status")
            return {"status": "error"}
    
    await step.run("update-db-rag-complete", update_db_rag_complete)
    
    # Step 4: Check if visualization is needed
    async def check_animation_needs():
        """Ask Gemini if this lesson needs a visualization."""
        logger.thinking(f"Determining if visualization is needed for '{title}'")
        gemini = get_gemini_client()
        
        analysis_prompt = f"""Analyze this lesson and determine if it needs a visualization:

Lesson Title: {title}
Description: {description}
Bloom's Level: {bloom_level}
Key Concepts: {', '.join(key_concepts)}

Does this lesson explain dynamic concepts (movement, graphs, geometry, algorithms, data structures)?
What type of visualization would help students understand?

Consider:
- Mathematical concepts often benefit from visual proof/demonstration
- Algorithms need step-by-step visualization
- Data structures need animated transformations
- Physics/engineering concepts need simulations

Return JSON with needs_visualization (boolean) and visualization_type (string).
"""

        structure = await gemini.generate_json(
            prompt=analysis_prompt,
            schema=MDX_STRUCTURE_SCHEMA,
            use_pro=False,
        )
        
        needs_viz = structure.get("needs_visualization", False)
        viz_type = structure.get("visualization_type", "none")
        
        if needs_viz:
            logger.visualizing(f"Visualization needed: {viz_type}")
        else:
            logger.thinking(f"No visualization needed for this lesson")
        
        return {
            "needs_visualization": needs_viz,
            "visualization_type": viz_type,
            "visualization_prompt": structure.get("visualization_prompt", ""),
        }
    
    animation_result = await step.run("check-animation-needs", check_animation_needs)
    needs_video = animation_result.get("needs_visualization", False)
    viz_type = animation_result.get("visualization_type", "none")
    viz_prompt = animation_result.get("visualization_prompt", "")
    
    # Step 5: Draft MDX Content
    async def draft_mdx():
        """Generate the main MDX lesson content."""
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
3. Include at least 2 <Callout> components for important points
4. Include at least 1 <Quiz> component for self-assessment
5. Add <Definition> for 3-5 key terms
6. Match the Bloom's level in content depth and activities
7. Include practical examples or code where relevant
8. End with a summary and key takeaways
9. Include an <Exercise> component for practice

{'Include a <VisualAid /> component where the visualization would help understanding.' if needs_video else ''}

Write the complete MDX content now. Make it engaging and educational."""

        mdx_content = await gemini.generate(
            prompt=content_prompt,
            system_instruction=AUTHOR_SYSTEM_PROMPT,
            use_pro=True,
            temperature=0.7,
            max_tokens=8192,
        )
        
        logger.success(f"MDX content generated ({len(mdx_content)} characters)")
        return {"mdx_content": mdx_content}
    
    mdx_result = await step.run("draft-mdx", draft_mdx)
    mdx_content = mdx_result.get("mdx_content", "")
    
    # Step 6: Generate JSON Visual Aid (Conditional)
    visual_aid_json = None
    if needs_video and viz_type != "none":
        async def generate_visual_aid():
            """Generate JSON visualization data for client-side rendering."""
            logger.visualizing(f"Creating JSON visual aid: {viz_type}")
            gemini = get_gemini_client()
            
            visual_prompt = f"""Create a JSON visualization data structure for the following concept:

**Topic:** {title}
**Visualization Type:** {viz_type}
**What to Visualize:** {viz_prompt}

Generate a JSON object with:
- type: "{viz_type}"
- title: A descriptive title
- data: A structured object containing:
  * For sorting_algo: initial_state (array), steps (array of {action, indices, commentary})
  * For graph_automata: nodes (array), edges (array), transitions (array)
  * For coordinate_system: points (array), axes (object), transformations (array)
  * For tree_structure: root (object), nodes (array), traversal_order (array)
  * For state_machine: states (array), transitions (array), initial_state (string)
  * For geometry: shapes (array), transformations (array)
  * For animation: frames (array), keyframes (array)

Make it detailed enough for a React Canvas component to render interactively.
Return ONLY valid JSON, no markdown code blocks."""

            json_str = await gemini.generate_json(
                prompt=visual_prompt,
                schema=VISUAL_AID_JSON_SCHEMA,
                use_pro=True,
                temperature=0.3,
            )
            
            # Parse and validate
            if isinstance(json_str, str):
                visual_aid_json = json.loads(json_str)
            else:
                visual_aid_json = json_str
            
            logger.success(f"Visual aid JSON generated: {visual_aid_json.get('type', 'unknown')}")
            return {"visual_aid": visual_aid_json}
        
        visual_result = await step.run("generate-visual-aid", generate_visual_aid)
        visual_aid_json = visual_result.get("visual_aid")
    
    # Step 7: Finalize and Save Lesson to Database
    async def finalize_lesson():
        """Finalize MDX content and save to database."""
        logger.saving(f"Saving lesson to database...")
        
        final_mdx = mdx_content
        
        # Calculate reading stats
        word_count = len(final_mdx.split())
        reading_time = max(1, word_count // 200)  # ~200 words per minute
        
        # Save to database
        try:
            success = await update_lesson_content(
                lesson_id=lesson_id,
                mdx_content=final_mdx,
                visual_aid=visual_aid_json if visual_aid_json else None,
                duration=reading_time,
            )
            if success:
                logger.success(f"Lesson saved: {word_count} words, {reading_time} min reading time")
            else:
                logger.warning(f"Lesson update may have failed, but continuing...")
            
            # Cache the lesson content in Redis
            try:
                redis = get_redis_client()
                await redis.set(f"lesson_content:{lesson_id}", final_mdx, ex=86400)  # 24 hours
            except Exception as cache_error:
                logger.warning(f"Failed to cache lesson content: {cache_error}")
            
            return {
                "lesson_id": lesson_id,
                "mdx_content": final_mdx,
                "word_count": word_count,
                "reading_time_minutes": reading_time,
                "visual_aid": visual_aid_json,
            }
        except Exception as e:
            logger.error(f"Failed to save lesson to database", exc=e)
            raise
    
    final_result = await step.run("finalize-lesson", finalize_lesson)
    
    # Step 8: Update DB Status (Completed)
    async def update_db_complete():
        """Mark lesson as completed in database."""
        success = await update_lesson_content(
            lesson_id=lesson_id,
            mdx_content=final_result.get("mdx_content", ""),
        )
        if success:
            logger.success(f"Lesson generation complete!")
            return {"status": "completed"}
        else:
            logger.error(f"Failed to update completion status")
            return {"status": "error"}
    
    await step.run("update-db-complete", update_db_complete)
    
    logger.success(f"✅ Lesson generation workflow complete")
    
    return {
        "status": "success",
        "lesson_id": lesson_id,
        "course_id": course_id,
        "module_id": module_id,
        "title": title,
        "bloom_level": bloom_level,
        "mdx_content": final_result.get("mdx_content", ""),
        "word_count": final_result.get("word_count", 0),
        "reading_time_minutes": final_result.get("reading_time_minutes", 0),
        "has_visual_aid": needs_video,
        "visual_aid": final_result.get("visual_aid"),
        "visualization_type": viz_type if needs_video else None,
        "rag_chunks_used": rag_result.get("chunks_found", 0),
    }




