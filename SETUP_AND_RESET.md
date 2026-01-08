# Kortex Setup & Reset Guide

## Quick Reset & Start

### 1. Stop All Containers & Clear Database

```bash
# Run the reset script
./scripts/reset-db.sh

# Or manually:
docker compose down
docker compose up -d
sleep 5
cd packages/db
bunx tsx scripts/clear-non-admin-data.ts
```

### 2. Verify Services Are Running

```bash
# Check all services
docker compose ps

# Check Inngest logs (most important for AI workflows)
docker compose logs -f inngest

# Check FastAPI backend
docker compose logs -f core  # if running in Docker, or check terminal

# Check database
docker compose logs -f postgres
```

### 3. Access Services

- **Inngest Dev Server UI**: http://localhost:8288
- **FastAPI Backend**: http://localhost:8000
- **FastAPI Docs**: http://localhost:8000/docs
- **Next.js Frontend**: http://localhost:3000
- **PostgreSQL**: localhost:5432
- **Qdrant**: http://localhost:6333
- **Redis**: localhost:6379

## Inngest Troubleshooting

### Option 1: Run Inngest Manually (Recommended if Docker fails)

```bash
# Install Inngest CLI
npm install -g inngest-cli

# Run Inngest Dev Server
npx inngest-cli@latest dev \
  --sdk-url http://localhost:8000/api/inngest \
  --no-discovery

# Or use bunx
bunx inngest-cli@latest dev \
  --sdk-url http://localhost:8000/api/inngest \
  --no-discovery
```

### Option 2: Docker (if working)

```bash
# View Inngest logs
docker compose logs -f inngest

# Check Inngest health
curl http://localhost:8288/api/health

# Restart Inngest
docker compose restart inngest
```

### Common Issues

1. **Inngest Docker not starting**:
   - **Solution**: Run Inngest manually (see Option 1 above)
   - The Docker image may have command parsing issues
   - Manual CLI is more reliable for development

2. **Inngest not connecting to FastAPI**:
   - Ensure FastAPI is running on port 8000
   - Check FastAPI logs for `/api/inngest` endpoint registration
   - Verify functions are being registered

3. **Functions not appearing in Inngest UI**:
   - Check FastAPI logs for function registration
   - Verify `/api/inngest` endpoint is accessible: `curl http://localhost:8000/api/inngest`
   - Check Inngest logs for connection errors
   - **Important**: Functions are registered when FastAPI starts, not when Inngest starts

## Database Cleanup

### Clear All Non-Admin Data

```bash
cd packages/db
bunx tsx scripts/clear-non-admin-data.ts
```

This script:
- Keeps all admin users (emails containing "admin")
- Deletes all courses (except admin-generated)
- Deletes all enrollments, progress, quiz attempts
- Resets admin user gamification stats

## New Features

### PDF Upload

1. **Upload PDFs**: Click the upload area in course creation form
2. **Supported formats**: PDF, Word documents (.doc, .docx)
3. **Max size**: 50MB per file
4. **Storage**: Files are uploaded to Supabase Storage (pdfs bucket)

### YouTube Video Processing

1. **Add YouTube Links**: Paste YouTube URLs in the YouTube Links section
2. **Automatic Transcript Extraction**: AI will extract transcripts automatically
3. **Content Indexing**: Transcripts are chunked and indexed for RAG

### External URLs

- Still supported for PDFs hosted elsewhere
- Web search will supplement your materials

## Cost Optimization

### Query Optimizations Implemented

1. **Web Search**: Only runs if content is limited (< 50 chunks)
2. **Batch Processing**: Increased batch size to 50 chunks per API call
3. **Model Selection**: 
   - Flash for structure generation (faster, cheaper)
   - Pro only for final lesson content
4. **Content Limits**: Reduced context window sizes to save tokens
5. **Limited Sources**: Web search limited to top 3 sources

### Monitoring Costs

- Check Gemini API usage in Google Cloud Console
- Monitor Tavily API usage
- Review Inngest function execution times

## Logging

### Python Backend Logs

All AI agent actions are logged with emoji prefixes:
- 🧠 Thinking/Analysis
- 🔍 Web searching
- ✍️ Content generation
- 🎨 Visualization creation
- 💾 Database operations
- ✅ Success
- ❌ Errors
- 📋 Workflow steps

### View Logs

```bash
# FastAPI backend (if running locally)
# Check terminal where `bun dev` is running

# Inngest logs
docker compose logs -f inngest

# All services
docker compose logs -f
```

## Course Creation Workflow

1. **Fill Course Form**: Title, description, category, difficulty
2. **Upload PDFs**: Drag & drop or click to upload
3. **Add YouTube Links**: Paste YouTube video URLs
4. **Add External URLs**: Optional PDF/document URLs
5. **Submit**: AI agent will:
   - Process PDFs (extract text, chunk)
   - Process YouTube videos (extract transcripts)
   - Search web (only if needed)
   - Generate course structure
   - Index all content in vector database
   - Create modules and lessons
   - Generate lesson content (fan-out)

## Troubleshooting

### AI Not Working

1. **Check Inngest**: `docker compose logs -f inngest`
2. **Check FastAPI**: Ensure backend is running
3. **Check Events**: View Inngest UI at http://localhost:8288
4. **Check Logs**: Python backend should show detailed step-by-step logs

### Upload Issues

1. **File too large**: Max 50MB
2. **Wrong format**: Only PDF and Word documents
3. **Backend not running**: Ensure FastAPI is accessible

### Database Issues

1. **Connection errors**: Check PostgreSQL is running
2. **Reset database**: Run cleanup script
3. **Check Prisma**: `cd packages/db && bunx prisma studio`

## Next Steps

1. Create a course with PDF uploads
2. Monitor Inngest UI for function execution
3. Check Python logs for detailed progress
4. Review generated course structure




