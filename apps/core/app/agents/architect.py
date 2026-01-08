"""
Agent A: The "Architect" - Course Structure Agent

Role: Ingests raw data and builds the "Skill Tree" (Syllabus).
Trigger: POST /agent/structure
"""

import uuid
from typing import Any

from ..clients import get_gemini_client, get_qdrant_client
from ..schemas.course import (
    CourseStructureInput,
    CourseStructureOutput,
    ModuleSchema,
    LessonSchema,
    BloomLevel,
    COURSE_STRUCTURE_SCHEMA,
)
from ..utils.pdf import extract_pdf_text, chunk_text
from ..utils.web import search_course_syllabi


ARCHITECT_SYSTEM_PROMPT = """You are an expert curriculum architect with deep knowledge of Bloom's Taxonomy and instructional design.

Your role is to create comprehensive course structures that:
1. Progress logically from foundational to advanced concepts
2. Follow Bloom's Taxonomy: Remember → Understand → Apply → Analyze → Evaluate → Create
3. Include clear, measurable learning outcomes (like MIT OpenCourseWare)
4. Balance theory with practical application

When given course materials and web research, synthesize them into a well-structured curriculum.

Guidelines:
- Each module should focus on one major topic area
- Lessons within a module should build on each other
- Early modules start at "remember/understand" level
- Later modules progress to "apply/analyze/evaluate/create"
- Include 3-5 lessons per module
- Each lesson should be 20-45 minutes
- Write specific, actionable learning objectives
"""


class ArchitectAgent:
    """
    The Architect Agent ingests raw data (PDFs, web content) and builds
    a structured course syllabus following Bloom's Taxonomy.
    """
    
    def __init__(self):
        self.gemini = get_gemini_client()
        self.qdrant = get_qdrant_client()
    
    async def generate_structure(
        self,
        input_data: CourseStructureInput,
    ) -> CourseStructureOutput:
        """
        Main workflow:
        1. Ingest: Download PDFs, extract text, chunk it
        2. Surf: Search for syllabi from MIT/IIT
        3. Synthesize: Use Gemini to create course structure
        4. Vectorize: Store chunks in Qdrant
        5. Return: Course structure for Next.js
        """
        course_id = f"course_{uuid.uuid4().hex[:12]}"
        
        # Step 1: Ingest PDFs
        all_chunks = []
        pdf_content = ""
        
        for pdf_url in input_data.pdf_urls:
            pages = await extract_pdf_text(pdf_url)
            for page in pages:
                pdf_content += f"\n\n[Page {page['page']}]\n{page['text']}"
                chunks = chunk_text(page["text"])
                for chunk in chunks:
                    all_chunks.append({
                        "text": chunk,
                        "page": page["page"],
                        "source": pdf_url,
                    })
        
        # Step 2: Web Research
        web_sources = await search_course_syllabi(input_data.course_title)
        web_content = ""
        source_urls = []
        
        for source in web_sources:
            web_content += f"\n\n[Source: {source['title']}]\n{source['content']}"
            source_urls.append(source["source"])
            # Also chunk web content
            chunks = chunk_text(source["content"])
            for chunk in chunks:
                all_chunks.append({
                    "text": chunk,
                    "page": 0,
                    "source": source["source"],
                })
        
        # Step 3: Synthesize with Gemini
        synthesis_prompt = f"""Create a comprehensive course structure for:

**Course Title:** {input_data.course_title}
**Description:** {input_data.description}
**Target Audience:** {input_data.target_audience}
**Duration:** {input_data.duration_weeks} weeks

## Source Materials (from PDFs):
{pdf_content[:15000] if pdf_content else "No PDF content provided."}

## Research from University Sources:
{web_content[:10000] if web_content else "No web research available."}

## Requirements:
1. Create 4-8 modules that progress through Bloom's Taxonomy
2. Each module should have 3-5 lessons
3. Write 5-8 measurable Course Outcomes (like "Students will be able to...")
4. Ensure logical progression from foundational to advanced
5. Include practical application lessons

Generate the course structure now."""

        structure_data = await self.gemini.generate_json(
            prompt=synthesis_prompt,
            schema=COURSE_STRUCTURE_SCHEMA,
            system_instruction=ARCHITECT_SYSTEM_PROMPT,
            use_pro=True,
        )
        
        # Step 4: Vectorize chunks
        if all_chunks:
            await self.qdrant.create_collection(course_id)
            
            # Generate embeddings in batches
            batch_size = 20
            for i in range(0, len(all_chunks), batch_size):
                batch = all_chunks[i:i + batch_size]
                texts = [c["text"] for c in batch]
                embeddings = await self.gemini.embed(texts)
                await self.qdrant.upsert_chunks(course_id, batch, embeddings)
        
        # Step 5: Build output
        modules = []
        for mod_data in structure_data.get("modules", []):
            lessons = []
            for lesson_data in mod_data.get("lessons", []):
                lesson = LessonSchema(
                    title=lesson_data["title"],
                    description=lesson_data["description"],
                    bloom_level=BloomLevel(lesson_data["bloom_level"]),
                    duration_minutes=lesson_data.get("duration_minutes", 30),
                    learning_objectives=lesson_data.get("learning_objectives", []),
                    key_concepts=lesson_data.get("key_concepts", []),
                )
                lessons.append(lesson)
            
            module = ModuleSchema(
                title=mod_data["title"],
                description=mod_data["description"],
                order=mod_data["order"],
                bloom_progression=BloomLevel(mod_data["bloom_progression"]),
                lessons=lessons,
                course_outcomes=mod_data.get("course_outcomes", []),
            )
            modules.append(module)
        
        return CourseStructureOutput(
            course_id=course_id,
            title=structure_data.get("title", input_data.course_title),
            description=structure_data.get("description", input_data.description),
            target_audience=input_data.target_audience,
            estimated_hours=structure_data.get("estimated_hours", input_data.duration_weeks * 5),
            course_outcomes=structure_data.get("course_outcomes", []),
            modules=modules,
            sources=source_urls,
            chunk_count=len(all_chunks),
        )







