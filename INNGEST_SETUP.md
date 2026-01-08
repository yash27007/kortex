# Inngest Setup Guide

## Overview

Inngest is the event bus that orchestrates long-running AI workflows (course generation, lesson content creation). It runs as a separate service and communicates with both the Next.js frontend and the Python FastAPI backend.

## Quick Start

### Option 1: Docker (Recommended)

The easiest way to run Inngest is via Docker Compose:

```bash
# Start all services including Inngest
docker compose up -d

# Check Inngest is running
docker compose logs inngest

# Access Inngest Dev Server UI
open http://localhost:8288
```

### Option 2: Manual CLI

If you prefer to run Inngest manually:

```bash
# Install Inngest CLI globally
npm install -g inngest-cli

# Start Inngest Dev Server
npx inngest-cli@latest dev \
  -u http://localhost:8000/api/inngest \
  --no-discovery
```

## Configuration

### Environment Variables

Add to `apps/core/.env`:

```env
# Inngest Configuration
INNGEST_DEV=true  # Use local dev server (set to false for production)
INNGEST_EVENT_KEY=your_event_key_here  # Optional, for production
NEXTJS_API_URL=http://localhost:3000  # For database updates from Python
```

### Docker Compose

Inngest is already configured in `docker-compose.yml`:

```yaml
inngest:
  image: inngest/inngest:latest
  container_name: kortex-inngest
  ports:
    - "8288:8288"
  command: >
    inngest dev
    -u http://host.docker.internal:8000/api/inngest
    --no-discovery
```

## How It Works

### 1. Event Flow

```
Next.js Frontend
    ↓ (sends event)
Inngest Dev Server (localhost:8288)
    ↓ (triggers function)
Python FastAPI (/api/inngest)
    ↓ (executes workflow)
Database (via Next.js API)
```

### 2. Functions

**Location**: `apps/core/app/inngest_functions/`

- **`architect.py`**: Creates course structure from PDFs/web research
- **`author.py`**: Generates MDX lesson content with JSON visualizations
- **`analyzer.py`**: Analyzes quiz results and updates user profiles

### 3. Events

**From Next.js**:
- `course.create` - Trigger full course generation

**Internal (Python → Python)**:
- `lesson.generate` - Generate single lesson (fan-out from Architect)

**From Frontend**:
- `quiz.completed` - Analyze quiz results

## Development Workflow

### 1. Start Services

```bash
# Terminal 1: Start Docker services (Postgres, Redis, Qdrant, Inngest)
docker compose up -d

# Terminal 2: Start Next.js frontend
cd apps/web && bun run dev

# Terminal 3: Start Python backend
cd apps/core && uv run fastapi dev
```

### 2. Monitor Inngest

Open http://localhost:8288 in your browser to see:
- **Functions**: List of registered functions
- **Runs**: Execution history and logs
- **Events**: Event stream

### 3. Test Course Generation

1. Go to Admin Panel → Courses → Create Course
2. Fill in course details
3. Submit form
4. Watch Inngest dashboard for:
   - Event received: `course.create`
   - Function triggered: `create-course-structure`
   - Fan-out events: `lesson.generate` (one per lesson)
   - Function triggered: `generate-lesson-content` (multiple parallel runs)

### 4. View Logs

**Python Backend Logs** (Terminal 3):
```
🧠 [lesson_123] AGENT THINKING: Analyzing bloom level 'APPLY'...
🔍 [lesson_123] WEB SURFING: Searching for 'NFA to DFA conversion'...
✍️ [lesson_123] GENERATING: Writing MDX content...
🎨 [lesson_123] GENERATING JSON: Creating visual aid...
💾 [lesson_123] SAVING: Saving lesson to database...
✅ [lesson_123] SUCCESS: Lesson generation complete!
```

**Inngest Dashboard**:
- Click on any function run to see step-by-step execution
- View input/output data
- See retry attempts and errors

## Troubleshooting

### "Function not found" in Inngest Dashboard

**Problem**: Inngest can't discover your Python functions.

**Solution**:
1. Ensure Python backend is running on port 8000
2. Check `INNGEST_DEV=true` in `apps/core/.env`
3. Verify FastAPI endpoint `/api/inngest` is accessible:
   ```bash
   curl http://localhost:8000/api/inngest
   ```

### "Stuck at 50%" Progress

**Problem**: Course generation appears stuck.

**Solution**:
1. Check Python backend logs for errors
2. Check Inngest dashboard for failed function runs
3. Verify database connection:
   ```bash
   # Check if Next.js API is accessible
   curl http://localhost:3000/api/lessons/{lessonId}/update
   ```
4. Check Redis is running:
   ```bash
   docker compose ps redis
   ```

### "Connection refused" to Inngest

**Problem**: Python backend can't connect to Inngest.

**Solution**:
1. Ensure Inngest is running:
   ```bash
   docker compose ps inngest
   ```
2. Check Inngest logs:
   ```bash
   docker compose logs inngest
   ```
3. Verify `INNGEST_DEV=true` in Python backend `.env`

### Database Updates Not Reflecting

**Problem**: Python backend updates don't appear in frontend.

**Solution**:
1. Check Next.js API endpoint is accessible:
   ```bash
   curl -X POST http://localhost:3000/api/lessons/{lessonId}/update \
     -H "Content-Type: application/json" \
     -d '{"mdxContent": "test"}'
   ```
2. Check Python backend logs for API call errors
3. Verify `NEXTJS_API_URL=http://localhost:3000` in Python `.env`

## Production Deployment

For production, you'll need:

1. **Inngest Cloud Account**: https://www.inngest.com/
2. **Environment Variables**:
   ```env
   INNGEST_DEV=false
   INNGEST_EVENT_KEY=your_production_key
   INNGEST_SIGNING_KEY=your_signing_key
   ```
3. **Update Inngest Client**:
   ```python
   # apps/core/app/inngest_client.py
   inngest_client = inngest.Inngest(
       app_id="kortex-core",
       is_production=True,  # Changed from False
       event_key=settings.inngest_event_key,
       signing_key=settings.inngest_signing_key,
   )
   ```

## Additional Resources

- [Inngest Documentation](https://www.inngest.com/docs)
- [Inngest Python SDK](https://www.inngest.com/docs/sdks/python)
- [Inngest Functions Guide](https://www.inngest.com/docs/features/inngest-functions)




