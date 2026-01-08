# Web Search Logs Feature

## Overview

Real-time web search logs are now displayed in the UI, showing exactly which websites are being searched, scraped, and processed during course generation - just like Perplexity!

## Features

### 1. **Real-Time Logging**

Every web search action is logged with:
- **Timestamp**: When the action occurred
- **Step**: Type of action (query, scraping, source_added, etc.)
- **Message**: Human-readable description
- **Data**: Additional context (URLs, queries, content length, etc.)

### 2. **UI Display**

- **Toggle Button**: "Show Search Logs" button appears when logs are available
- **Real-Time Updates**: Logs poll every 2 seconds for fresh data
- **Animated List**: New logs appear with smooth animations
- **Clickable URLs**: Website URLs are clickable links
- **Detailed Info**: Shows queries, titles, result counts, content lengths

### 3. **Log Types**

The following events are logged:

1. **start**: Search process begins
2. **query**: Each search query being executed
3. **query_results**: Results found for each query
4. **ai_answer**: AI-generated answer received
5. **scraping**: Website being processed
6. **scraping_start**: Starting to scrape a URL
7. **scraping_success**: Successfully extracted content
8. **scraping_skip**: Skipped scraping (using Tavily content)
9. **source_added**: Source added to results
10. **complete**: Search process complete
11. **ai_summary**: AI summary added

## Technical Implementation

### Backend (Python)

**File**: `apps/core/app/utils/web.py**

- Logs stored in Redis with key: `web_search_logs:{course_id}`
- Each log entry is JSON with timestamp, step, message, and data
- Logs expire after 1 hour
- Up to 100 most recent logs per course

**File**: `apps/core/app/routers/web_search_logs.py`

- FastAPI endpoint: `GET /api/web-search-logs/{course_id}`
- Returns parsed logs in chronological order

### Frontend (Next.js)

**File**: `apps/web/app/api/courses/[courseId]/web-search-logs/route.ts`

- Proxies to Python backend
- Handles errors gracefully

**File**: `apps/web/app/(dashboard)/admin/courses/[courseId]/_components/ai-agent-visualization.tsx`

- Fetches logs every 2 seconds
- Displays logs in collapsible section
- Shows detailed information for each log entry

## Usage

1. **Create a Course**: Start course creation as normal
2. **View Logs**: Click "Show Search Logs" button in AI Agent Activity card
3. **Watch Real-Time**: See logs appear as the search progresses
4. **Click URLs**: Click any website URL to open it in a new tab

## Example Log Display

```
🌐 Web Search Activity (15 events)

[query] 10:23:45 AM
Searching query 1/5: Machine Learning syllabus course outline
Query: Machine Learning syllabus course outline

[query_results] 10:23:47 AM
Found 8 results for query 1
Results: 8
Sources: https://ocw.mit.edu/..., https://www.coursera.org/...

[scraping] 10:23:48 AM
Processing website 1: MIT OpenCourseWare
Title: MIT OpenCourseWare - Machine Learning
🔗 https://ocw.mit.edu/courses/6-034-artificial-intelligence-spring-2005/

[scraping_success] 10:23:50 AM
Extracted 7,234 characters from MIT OpenCourseWare
Content: 7,234 chars

[source_added] 10:23:51 AM
Added source: MIT OpenCourseWare
Content: 7,234 chars
```

## Benefits

1. **Transparency**: See exactly what the AI is doing
2. **Debugging**: Identify which websites are being used
3. **Quality Control**: Verify sources are reputable
4. **Real-Time Monitoring**: Watch progress as it happens
5. **Perplexity-Like Experience**: Similar to how Perplexity shows its search process

## Configuration

- **Log Retention**: 1 hour (configurable in `web.py`)
- **Max Logs**: 100 per course (configurable in `web_search_logs.py`)
- **Poll Interval**: 2 seconds (configurable in `ai-agent-visualization.tsx`)

## Future Enhancements

- Filter logs by type (query, scraping, etc.)
- Search within logs
- Export logs
- Show search query performance metrics
- Highlight most relevant sources
