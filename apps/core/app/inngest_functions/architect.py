"""
Inngest Function: The Architect (Course Structure Agent)

Trigger: course.create event
Role: Ingests raw data (PDFs, YouTube, web research) and builds a course
syllabus — for any academic subject, not just technical ones.

This is a long-running function (5-10 minutes) that:
1. Downloads and processes PDF content
2. Extracts YouTube transcripts
3. Performs comprehensive web research (Perplexity-style)
4. Generates curriculum structure + a gatekeeper quiz per module with Gemini
5. Vectorizes all source material in Qdrant for RAG
6. Persists modules/lessons/quizzes to Postgres via the internal Next.js API
7. Fans out lesson.generate events for each lesson, addressed by real DB ids
"""

import uuid
import inngest

from ..inngest_client import inngest_client
from ..clients import get_gemini_client, get_qdrant_client
from ..utils.pdf import extract_pdf_text, chunk_text
from ..utils.web import search_course_syllabi
from ..utils.youtube import process_youtube_videos
from ..utils.logger import get_logger
from ..utils.db import save_course_structure
from ..schemas.course import COURSE_STRUCTURE_SCHEMA


ARCHITECT_SYSTEM_PROMPT = """You are an expert curriculum architect with deep knowledge of Bloom's Taxonomy and instructional design, capable of designing rigorous courses in ANY academic subject — biology, history, literature, law, mathematics, art, computer science, economics, and beyond.

Your role is to create comprehensive course structures that:
1. Progress logically from foundational to advanced concepts
2. Follow Bloom's Taxonomy: Remember → Understand → Apply → Analyze → Evaluate → Create
3. Include clear, measurable learning outcomes (like MIT OpenCourseWare)
4. Balance theory with practical application appropriate to the subject
5. Include a gatekeeper quiz per module that genuinely tests mastery of that module's concepts

Guidelines:
- Each module should focus on one major topic area within the subject
- Lessons within a module should build on each other
- Early modules start at "remember/understand" level
- Later modules progress to "apply/analyze/evaluate/create"
- Include 3-5 lessons per module
- Each lesson should be 20-45 minutes
- Write specific, actionable learning objectives
- Never assume the subject is technical — adapt examples, activities, and
  "practical application" to whatever the subject actually is (a lab
  procedure for biology, a primary-source analysis for history, a proof
  technique for mathematics, a close reading for literature, etc.)
- Each module's quiz should have 3-8 questions (multiple_choice or
  true_false) that test the module's key concepts, not trivia
"""


@inngest_client.create_function(
    fn_id="create-course-structure",
    trigger=inngest.TriggerEvent(event="course.create"),
    retries=2,
)
async def create_course_structure(
    ctx: inngest.Context,
) -> dict:
    """
    The Architect: Creates course structure from PDFs, YouTube, and web research.

    Event Data:
        course_id: str - Pre-generated course ID from Next.js (staging row already exists)
        title: str - Course title
        description: str - Course description
        pdf_urls: list[str] - URLs to PDF files in Supabase Storage
        youtube_urls: list[str] - YouTube video URLs
        target_audience: str - Target audience (optional)
        duration_weeks: int - Course duration in weeks (optional)

    Returns:
        dict with status, course_id, modules_created, lessons_created
    """
    event_data = ctx.event.data
    course_id = event_data.get("course_id", f"course_{uuid.uuid4().hex[:12]}")
    title = event_data.get("title", "Untitled Course")
    description = event_data.get("description", "")
    pdf_urls = event_data.get("pdf_urls", []) or event_data.get("materials", [])
    youtube_urls = event_data.get("youtube_urls", []) or event_data.get("youtubeLinks", [])
    target_audience = event_data.get("target_audience", "undergraduate students")
    duration_weeks = event_data.get("duration_weeks", 8)

    logger = get_logger(course_id)
    logger.step("START", f"Creating course structure: {title}")

    pdf_result = {"pdf_content": "", "chunks": [], "chunk_count": 0}

    # Step 1: Ingest PDFs (parallel-friendly, content-capped)
    async def ingest_files():
        """Download PDFs, extract text, and chunk content."""
        logger.searching(f"Ingesting {len(pdf_urls)} PDF files...")
        all_chunks = []
        pdf_content = ""

        for idx, pdf_url in enumerate(pdf_urls, 1):
            try:
                logger.step(f"PDF-{idx}", f"Processing PDF {idx}/{len(pdf_urls)}: {pdf_url[:50]}...")
                pages = await extract_pdf_text(pdf_url)
                logger.success(f"Extracted {len(pages)} pages from PDF {idx}")

                max_pages_per_pdf = 50
                pages_to_process = pages[:max_pages_per_pdf]

                if len(pages) > max_pages_per_pdf:
                    logger.warning(f"Limiting to first {max_pages_per_pdf} pages (PDF has {len(pages)} pages)")

                page_chunks = []
                for page in pages_to_process:
                    pdf_content += f"\n\n[Page {page['page']}]\n{page['text']}"
                    chunks = chunk_text(page["text"])
                    page_chunks.extend(chunks)
                    for chunk in chunks:
                        all_chunks.append({
                            "text": chunk,
                            "page": page["page"],
                            "source": pdf_url,
                        })
                logger.success(f"Created {len(page_chunks)} chunks from PDF {idx}")
            except Exception as e:
                logger.error(f"Error processing PDF {pdf_url}", exc=e)

        logger.success(f"Total chunks created: {len(all_chunks)}")
        return {
            "pdf_content": pdf_content[:15000],
            "chunks": all_chunks,
            "chunk_count": len(all_chunks),
        }

    if pdf_urls:
        pdf_result = await ctx.step.run("ingest-files", ingest_files)

    # Step 2: Process YouTube Videos
    async def process_youtube():
        """Extract transcripts from YouTube videos."""
        if not youtube_urls:
            logger.thinking("No YouTube videos provided")
            return {"youtube_content": "", "youtube_chunks": []}

        logger.searching(f"Processing {len(youtube_urls)} YouTube videos...")
        try:
            videos = await process_youtube_videos(youtube_urls)
            youtube_content = ""
            youtube_chunks = []

            for video in videos:
                if video.get("transcript"):
                    transcript = video["transcript"]
                    youtube_content += f"\n\n[YouTube: {video.get('title', 'Video')}]\n{transcript}"
                    for chunk in chunk_text(transcript):
                        youtube_chunks.append({
                            "text": chunk,
                            "page": 0,
                            "source": video["url"],
                        })

            logger.success(f"Processed {len(videos)} videos, created {len(youtube_chunks)} chunks")
            return {
                "youtube_content": youtube_content[:20000],
                "youtube_chunks": youtube_chunks,
            }
        except Exception as e:
            logger.error("YouTube processing failed", exc=e)
            return {"youtube_content": "", "youtube_chunks": []}

    youtube_result = await ctx.step.run("process-youtube", process_youtube)

    # Step 3: Comprehensive web research (Perplexity-style) — subject-agnostic
    async def web_surf():
        """Comprehensive web search across multiple sources, for any subject."""
        logger.searching(f"🌐 Starting comprehensive web research for: {title}")
        logger.thinking("Performing deep web search across multiple sources...")

        try:
            web_sources = await search_course_syllabi(title, description, course_id)
            logger.success(f"Found {len(web_sources)} comprehensive web sources")

            web_content = ""
            source_urls = []
            web_chunks = []

            for idx, source in enumerate(web_sources, 1):
                source_url = source.get("source", "")
                source_title = source.get("title", "Untitled")
                source_content = source.get("content", "")

                logger.step(f"SOURCE-{idx}", f"Processing: {source_title[:50]}...")

                web_content += f"\n\n[Source {idx}: {source_title}]\nURL: {source_url}\n\n{source_content}"
                source_urls.append(source_url)

                chunks = chunk_text(source_content)
                for chunk in chunks:
                    web_chunks.append({
                        "text": chunk,
                        "page": 0,
                        "source": source_url,
                    })

                logger.success(f"Added {len(chunks)} chunks from source {idx}")

            logger.success(f"✅ Web research complete: {len(web_chunks)} chunks from {len(web_sources)} sources")

            return {
                "web_content": web_content[:25000],
                "source_urls": source_urls,
                "web_chunks": web_chunks,
            }
        except Exception as e:
            logger.error("Web search failed", exc=e)
            return {"web_content": "", "source_urls": [], "web_chunks": []}

    web_result = await ctx.step.run("web-surf", web_surf)

    # Step 4: Generate curriculum structure + per-module gatekeeper quizzes
    async def generate_structure():
        """Call Gemini to generate the course curriculum and its quizzes."""
        gemini = get_gemini_client()

        synthesis_prompt = f"""Create a comprehensive course structure for:

**Course Title:** {title}
**Description:** {description}
**Target Audience:** {target_audience}
**Duration:** {duration_weeks} weeks

## Source Materials (from PDFs):
{pdf_result.get('pdf_content', '') if pdf_result.get('pdf_content') else "No PDF content provided."}

## Source Materials (from YouTube Videos):
{youtube_result.get('youtube_content', '') if youtube_result.get('youtube_content') else "No YouTube content provided."}

## Comprehensive Web Research (Perplexity-style):
{web_result.get('web_content', '') if web_result.get('web_content') else "No web research available."}

**Note**: The web research above includes comprehensive content from multiple authoritative sources, AI-generated summaries, and full-page content extraction for maximum coverage.

## Requirements
1. Create 4-8 modules that progress through Bloom's Taxonomy
2. Each module should have 3-5 lessons
3. Write 5-8 measurable Course Outcomes (like "Students will be able to...")
4. Ensure logical progression from foundational to advanced
5. Include practical application lessons suited to this specific subject (not necessarily code or technical exercises unless the subject calls for it)
6. Each module MUST include a "quiz" with 3-8 questions (multiple_choice or true_false) that gate progression to the next module — write real assessment questions on the module's key concepts, with a correct_answer that exactly matches one of the listed options

Generate the course structure now."""

        structure_data = await gemini.generate_json(
            prompt=synthesis_prompt,
            schema=COURSE_STRUCTURE_SCHEMA,
            system_instruction=ARCHITECT_SYSTEM_PROMPT,
            use_pro=False,  # Flash tier handles structure generation well and cheaply
            temperature=0.7,
        )

        # Assign stable placeholder ids; the persist step will map these to
        # real database ids and hand the map back for the fan-out step below.
        for i, module in enumerate(structure_data.get("modules", [])):
            module["id"] = f"module_{uuid.uuid4().hex[:12]}"
            module["order"] = i + 1

            for j, lesson in enumerate(module.get("lessons", [])):
                lesson["id"] = f"lesson_{uuid.uuid4().hex[:12]}"
                lesson["order"] = j + 1

        return structure_data

    curriculum = await ctx.step.run("generate-structure", generate_structure)

    # Step 5: Vectorize all chunks in Qdrant (batched)
    async def save_to_vector_db():
        """Store all chunks in Qdrant for RAG retrieval."""
        all_chunks = (
            pdf_result.get("chunks", []) +
            youtube_result.get("youtube_chunks", []) +
            web_result.get("web_chunks", [])
        )

        if not all_chunks:
            logger.warning("No chunks to vectorize")
            return {"vectorized": 0}

        logger.saving(f"Vectorizing {len(all_chunks)} chunks in Qdrant...")
        try:
            gemini = get_gemini_client()
            qdrant = get_qdrant_client()
            await qdrant.create_collection(course_id)

            batch_size = 50
            total_vectorized = 0

            for i in range(0, len(all_chunks), batch_size):
                batch = all_chunks[i:i + batch_size]
                texts = [c["text"] for c in batch]
                embeddings = await gemini.embed(texts)
                await qdrant.upsert_chunks(course_id, batch, embeddings)
                total_vectorized += len(batch)
                logger.saving(f"Vectorized {total_vectorized}/{len(all_chunks)} chunks...")

            logger.success(f"✅ Vectorization complete: {total_vectorized} chunks indexed")
            return {"vectorized": total_vectorized}
        except Exception as e:
            logger.error("Vectorization error", exc=e)
            return {"vectorized": 0, "error": str(e)}

    vector_result = await ctx.step.run("save-to-vector-db", save_to_vector_db)

    # Step 6: Persist the course structure (modules, lessons, quizzes) to Postgres
    async def save_to_database():
        """Save the course structure via the internal Next.js API.

        Translates Gemini's snake_case/lowercase output into the shape the
        Prisma-backed route expects, and returns the id maps needed to
        address real lesson rows during fan-out.
        """
        def to_question_payload(q: dict) -> dict:
            return {
                "id": f"q_{uuid.uuid4().hex[:12]}",
                "text": q.get("text", ""),
                "type": q.get("type", "multiple_choice"),
                "options": q.get("options", []),
                "correctAnswer": q.get("correct_answer", ""),
                "explanation": q.get("explanation", ""),
            }

        payload_modules = []
        for module in curriculum.get("modules", []):
            quiz = module.get("quiz") or {}
            questions = quiz.get("questions", [])

            payload_modules.append({
                "id": module["id"],
                "title": module.get("title", ""),
                "description": module.get("description", ""),
                "order": module.get("order", 1),
                "bloomLevel": module.get("bloom_progression", "understand").upper(),
                "courseOutcomes": module.get("course_outcomes", []),
                "estimatedMinutes": sum(
                    l.get("duration_minutes", 30) for l in module.get("lessons", [])
                ) or 60,
                "lessons": [
                    {
                        "id": lesson["id"],
                        "title": lesson.get("title", ""),
                        "description": lesson.get("description", ""),
                        "order": lesson.get("order", 1),
                        "bloomLevel": lesson.get("bloom_level", "understand").upper(),
                        "durationMinutes": lesson.get("duration_minutes", 30),
                        "keyConcepts": lesson.get("key_concepts", []),
                    }
                    for lesson in module.get("lessons", [])
                ],
                **({
                    "quiz": {
                        "title": f"{module.get('title', 'Module')} Assessment",
                        "questions": [to_question_payload(q) for q in questions],
                        "passingScore": 80,
                        "xpReward": 100,
                    }
                } if questions else {}),
            })

        structure_payload = {
            "title": curriculum.get("title", title),
            "description": curriculum.get("description", description),
            "courseOutcomes": curriculum.get("course_outcomes", []),
            "estimatedHours": curriculum.get("estimated_hours", duration_weeks * 5),
            "modules": payload_modules,
        }

        result = await save_course_structure(course_id, structure_payload)
        if result is None:
            logger.error("Failed to persist course structure to database")
            return {
                "course_id": course_id,
                "title": curriculum.get("title", title),
                "persisted": False,
                "moduleIdMap": {},
                "lessonIdMap": {},
            }

        logger.success(
            f"Persisted {len(result.get('moduleIdMap', {}))} modules, "
            f"{len(result.get('lessonIdMap', {}))} lessons to database"
        )
        return {
            "course_id": course_id,
            "title": curriculum.get("title", title),
            "persisted": True,
            "moduleIdMap": result.get("moduleIdMap", {}),
            "lessonIdMap": result.get("lessonIdMap", {}),
        }

    saved_course = await ctx.step.run("save-to-db", save_to_database)
    lesson_id_map = saved_course.get("lessonIdMap", {})
    module_id_map = saved_course.get("moduleIdMap", {})

    # Step 7: Fan-out lesson generation events, addressed by REAL database ids.
    # Not wrapped in ctx.step.run(): it's cheap, deterministic, and building
    # the event payloads here (not inngest.Event objects — those aren't
    # JSON-serializable, which is required for step-run's checkpointing).
    event_payloads: list[dict] = []
    if saved_course.get("persisted"):
        logger.step("FAN-OUT", "Preparing lesson generation events...")

        for module in curriculum.get("modules", []):
            real_module_id = module_id_map.get(module["id"])
            module_title = module.get("title", "")

            for lesson in module.get("lessons", []):
                real_lesson_id = lesson_id_map.get(lesson["id"])
                if not real_lesson_id or not real_module_id:
                    logger.warning(f"No persisted id for lesson '{lesson.get('title')}', skipping")
                    continue

                event_payloads.append({
                    "course_id": course_id,
                    "module_id": real_module_id,
                    "module_title": module_title,
                    "lesson_id": real_lesson_id,
                    "title": lesson.get("title", ""),
                    "description": lesson.get("description", ""),
                    "bloom_level": lesson.get("bloom_level", "understand"),
                    "duration_minutes": lesson.get("duration_minutes", 30),
                    "learning_objectives": lesson.get("learning_objectives", []),
                    "key_concepts": lesson.get("key_concepts", []),
                })

        logger.success(f"Prepared {len(event_payloads)} lesson generation events")
    else:
        logger.error("Skipping fan-out: course structure was never persisted")

    fan_out_result = {"lessons_queued": len(event_payloads)}

    if event_payloads:
        logger.step("FAN-OUT", f"Sending {len(event_payloads)} lesson generation events...")
        events = [inngest.Event(name="lesson.generate", data=data) for data in event_payloads]
        await ctx.step.send_event("fan-out-lessons", events)
        logger.success("All lesson generation events sent")

    total_modules = len(curriculum.get("modules", []))
    total_lessons = sum(len(m.get("lessons", [])) for m in curriculum.get("modules", []))

    logger.success(f"✅ Course structure generation complete: {total_modules} modules, {total_lessons} lessons")

    return {
        "status": "success" if saved_course.get("persisted") else "partial_failure",
        "course_id": course_id,
        "title": saved_course.get("title", title),
        "modules_created": total_modules,
        "lessons_queued": fan_out_result.get("lessons_queued", 0),
        "chunks_vectorized": vector_result.get("vectorized", 0),
        "sources_used": len(web_result.get("source_urls", [])),
        "persisted": saved_course.get("persisted", False),
    }
