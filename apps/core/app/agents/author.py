"""
Agent B: The "Author & Animator" - Content Generation Agent

Role: Writes the MDX Lesson content and generates visualizations.
Trigger: POST /agent/content
"""

import uuid

from ..clients import get_gemini_client, get_qdrant_client, get_redis_client
from ..schemas.content import (
    ContentGenerationInput,
    ContentGenerationOutput,
    MDX_STRUCTURE_SCHEMA,
)


AUTHOR_SYSTEM_PROMPT = """You are an expert educational content writer for the Kortex learning platform.

Your role is to write engaging, clear lesson content in MDX format that:
1. Matches the specified Bloom's Taxonomy level
2. Uses appropriate MDX components for interactivity
3. Builds conceptual understanding progressively
4. Includes practical examples and applications

## Available MDX Components:
- <Callout type="info|warning|tip|example">content</Callout> - Highlight important information
- <Quiz question="..." options={["A", "B", "C", "D"]} correct={0} explanation="..." /> - Inline quiz
- <Video src="..." title="..." /> - Video embed placeholder
- <CodeBlock language="python|javascript|etc">code</CodeBlock> - Code examples
- <Definition term="...">definition</Definition> - Key term definitions

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


class AuthorAgent:
    """
    The Author Agent generates MDX lesson content using RAG
    and optionally creates Manim visualizations.
    """
    
    def __init__(self):
        self.gemini = get_gemini_client()
        self.qdrant = get_qdrant_client()
        self.redis = get_redis_client()
    
    async def generate_content(
        self,
        input_data: ContentGenerationInput,
    ) -> ContentGenerationOutput:
        """
        Main workflow:
        1. RAG Retrieval: Query Qdrant for relevant chunks
        2. Structure Analysis: Determine if visualization needed
        3. Content Drafting: Generate MDX content
        4. (Optional) Visualization: Generate Manim code if needed
        5. Return: Complete MDX content
        """
        lesson_id = f"lesson_{uuid.uuid4().hex[:12]}"
        
        # Step 1: RAG Retrieval
        query_embedding = await self.gemini.embed_single(input_data.lesson_title)
        relevant_chunks = await self.qdrant.search(
            collection_name=input_data.course_id,
            query_vector=query_embedding,
            limit=5,
        )
        
        context = "\n\n".join([
            f"[Source: {chunk['source']}, Page {chunk['page']}]\n{chunk['text']}"
            for chunk in relevant_chunks
        ])
        
        # Step 2: Analyze if visualization needed
        analysis_prompt = f"""Analyze this lesson and determine if it needs a visualization:

Lesson Title: {input_data.lesson_title}
Description: {input_data.lesson_description}
Bloom's Level: {input_data.bloom_level.value}
Key Concepts: {', '.join(input_data.key_concepts)}

Does this lesson explain dynamic concepts (movement, graphs, geometry, algorithms)?
What type of visualization would help students understand?"""

        structure = await self.gemini.generate_json(
            prompt=analysis_prompt,
            schema=MDX_STRUCTURE_SCHEMA,
            use_pro=False,
        )
        
        needs_video = structure.get("needs_visualization", False)
        viz_type = structure.get("visualization_type", "none")
        viz_prompt = structure.get("visualization_prompt", "")
        
        # Step 3: Generate MDX Content
        content_prompt = f"""Write a complete lesson in MDX format.

## Lesson Details
**Title:** {input_data.lesson_title}
**Module:** {input_data.module_title}
**Bloom's Level:** {input_data.bloom_level.value}
**Description:** {input_data.lesson_description}

## Learning Objectives
{chr(10).join(f'- {obj}' for obj in input_data.learning_objectives)}

## Key Concepts to Cover
{chr(10).join(f'- {concept}' for concept in input_data.key_concepts)}

## Reference Material (from course sources)
{context if context else "No specific reference material available."}

## Requirements
1. Start with a brief introduction (2-3 sentences)
2. Use proper headings (##, ###) for structure
3. Include at least 2 <Callout> components
4. Include at least 1 <Quiz> component for self-assessment
5. Add <Definition> for key terms
6. Match the Bloom's level in content depth and activities
7. End with a summary and next steps

{"Include a <Video src='PLACEHOLDER' title='" + viz_prompt + "' /> component where the visualization would help." if needs_video else ""}

Write the complete MDX content now:"""

        mdx_content = await self.gemini.generate(
            prompt=content_prompt,
            system_instruction=AUTHOR_SYSTEM_PROMPT,
            use_pro=True,
            temperature=0.7,
        )
        
        # Step 4: Handle visualization (Manim - placeholder for now)
        video_url = None
        if needs_video and viz_type != "none":
            # TODO: Implement Manim generation pipeline
            # For now, we mark it as needing video but don't generate
            pass
        
        # Calculate stats
        word_count = len(mdx_content.split())
        reading_time = max(1, word_count // 200)  # ~200 words per minute
        
        # Cache the lesson content
        await self.redis.cache_lesson(lesson_id, mdx_content)
        
        return ContentGenerationOutput(
            lesson_id=lesson_id,
            title=input_data.lesson_title,
            mdx_content=mdx_content,
            has_video=needs_video,
            video_url=video_url,
            word_count=word_count,
            reading_time_minutes=reading_time,
        )







