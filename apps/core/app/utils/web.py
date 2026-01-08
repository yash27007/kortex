"""
Web Search and Scraping Utilities using Tavily API
Perplexity-style comprehensive web search for course content generation.
"""

import httpx
from bs4 import BeautifulSoup

from ..config import get_settings
from .pdf import chunk_text


async def search_web(query: str, num_results: int = 10, include_answer: bool = True) -> dict:
    """
    Search the web using Tavily API (Perplexity-style comprehensive search).
    Returns comprehensive results with answer, multiple sources, and full content.
    """
    settings = get_settings()
    
    # Get Tavily API key
    api_key = settings.tavily_key
    
    if not api_key:
        # Return empty if no API key configured
        from ..utils.logger import get_logger
        logger = get_logger("web-search")
        logger.warning("TAVILY_KEY not set, web search disabled")
        return {"answer": "", "results": [], "sources": []}
        
    # Ensure key is clean
    api_key = api_key.strip()
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.tavily.com/search",
                json={
                    "api_key": api_key,
                    "query": query,
                    "search_depth": "advanced",  # Deep search like Perplexity
                    "include_answer": include_answer,  # Get AI-generated answer
                    "include_raw_content": True,  # Get full page content
                    "include_domains": [],  # No domain restrictions
                    "exclude_domains": ["pinterest.com", "reddit.com"],  # Exclude low-quality sources
                    "max_results": num_results,
                },
                headers={"Content-Type": "application/json"},
                timeout=60.0,  # Longer timeout for deep search
            )
            
            if response.status_code != 200:
                from ..utils.logger import get_logger
                logger = get_logger("web-search")
                logger.error(f"Tavily API error {response.status_code}: {response.text}")
                return {"answer": "", "results": [], "sources": []}
                
            response.raise_for_status()
            data = response.json()
            
            # Extract answer if available (Perplexity-style summary)
            answer = data.get("answer", "")
            
            # Process all results
            results = []
            for item in data.get("results", []):
                results.append({
                    "title": item.get("title", ""),
                    "link": item.get("url", ""),
                    "snippet": item.get("content", ""),
                    "raw_content": item.get("raw_content", ""),
                    "score": item.get("score", 0.0),
                })
            
            # Sort by score (relevance)
            results.sort(key=lambda x: x.get("score", 0), reverse=True)
            
            return {
                "answer": answer,
                "results": results,
                "sources": [r["link"] for r in results],
            }
    except Exception as e:
        from ..utils.logger import get_logger
        logger = get_logger("web-search")
        logger.error(f"Tavily web search error", exc=e)
        return {"answer": "", "results": [], "sources": []}


async def scrape_url(url: str, max_length: int = 10000) -> str:
    """
    Scrape comprehensive text content from a URL (Perplexity-style extraction).
    Extracts main content, preserves structure, and limits length.
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                url,
                follow_redirects=True,
                timeout=30.0,
                headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                },
            )
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, "html.parser")
            
            # Remove unwanted elements
            for element in soup(["script", "style", "nav", "footer", "header", "aside", "iframe", "noscript"]):
                element.decompose()
            
            # Try to find main content area (article, main, or content div)
            main_content = (
                soup.find("article") or
                soup.find("main") or
                soup.find("div", class_=lambda x: x and ("content" in x.lower() or "article" in x.lower() or "post" in x.lower())) or
                soup.find("body")
            )
            
            if main_content:
                # Extract from main content area
                text = main_content.get_text(separator="\n", strip=True)
            else:
                # Fallback to body
                text = soup.get_text(separator="\n", strip=True)
            
            # Clean up excessive whitespace
            lines = [line.strip() for line in text.splitlines() if line.strip()]
            cleaned_text = "\n".join(lines)
            
            # Limit length
            if len(cleaned_text) > max_length:
                cleaned_text = cleaned_text[:max_length] + "... [truncated]"
            
            return cleaned_text
            
    except Exception as e:
        from ..utils.logger import get_logger
        logger = get_logger("web-search")
        logger.error(f"Scrape error for {url}", exc=e)
        return ""


async def search_course_syllabi(course_title: str, description: str = "", course_id: str = None) -> list[dict]:
    """
    Comprehensive Perplexity-style search for course content.
    Searches multiple angles, extracts full content, and synthesizes results.
    Stores search logs in Redis for UI display.
    """
    from ..utils.logger import get_logger
    from ..clients import get_redis_client
    import json
    import time
    
    logger = get_logger("web-search")
    redis_manager = None
    if course_id:
        try:
            redis_manager = get_redis_client()
        except Exception as e:
            logger.warning(f"Redis not available for logging: {e}")
    
    # Helper to store search log
    async def store_search_log(step: str, message: str, data: dict = None):
        if redis_manager and course_id:
            try:
                log_entry = {
                    "timestamp": time.time(),
                    "step": step,
                    "message": message,
                    "data": data or {},
                }
                # Use Redis client's lpush method
                await redis_manager.client.lpush(f"web_search_logs:{course_id}", json.dumps(log_entry))
                await redis_manager.client.expire(f"web_search_logs:{course_id}", 3600)  # Keep for 1 hour
            except Exception as e:
                logger.warning(f"Failed to store search log: {e}")
    
    # Create diverse search queries (like Perplexity does)
    queries = [
        f"{course_title} syllabus course outline",
        f"{course_title} curriculum learning objectives",
        f"{course_title} MIT OCW OpenCourseWare",
        f"{course_title} university course materials",
        f"{course_title} textbook resources",
    ]
    
    # Add description-based queries if available
    if description:
        # Extract key terms from description
        key_terms = description.split()[:5]  # First 5 words
        if key_terms:
            queries.append(f"{course_title} {' '.join(key_terms)} course content")
    
    all_results = []
    seen_urls = set()
    aggregated_answer = ""
    
    logger.searching(f"Performing comprehensive web search with {len(queries)} queries...")
    await store_search_log("start", f"Starting comprehensive web search with {len(queries)} queries")
    
    # Search with each query
    for idx, query in enumerate(queries, 1):
        logger.step(f"QUERY-{idx}", f"Searching: {query}")
        await store_search_log("query", f"Searching query {idx}/{len(queries)}: {query}", {"query": query, "index": idx})
        
        search_result = await search_web(query, num_results=8, include_answer=True)
        
        # Log search results
        result_count = len(search_result.get("results", []))
        await store_search_log("query_results", f"Found {result_count} results for query {idx}", {
            "query": query,
            "result_count": result_count,
            "sources": [r.get("link", "") for r in search_result.get("results", [])[:3]]  # Top 3 URLs
        })
        
        # Aggregate answer
        if search_result.get("answer"):
            aggregated_answer += f"\n\n[Query {idx} Answer]: {search_result['answer']}"
            await store_search_log("ai_answer", f"AI generated answer for query {idx}", {"query": query})
        
        # Process each result
        for result_idx, result in enumerate(search_result.get("results", []), 1):
            url = result.get("link", "")
            title = result.get("title", "Untitled")
            
            # Skip duplicates
            if url in seen_urls:
                continue
            seen_urls.add(url)
            
            # Log website being processed
            await store_search_log("scraping", f"Processing website {result_idx}: {title}", {
                "url": url,
                "title": title,
                "query_index": idx
            })
            
            # Get content - prefer raw_content, fallback to snippet
            content = result.get("raw_content", "") or result.get("snippet", "")
            
            # Always scrape for comprehensive content (Perplexity-style)
            if url and not url.startswith("data:"):
                logger.searching(f"Scraping full content from: {url[:60]}...")
                await store_search_log("scraping_start", f"Scraping content from: {title}", {"url": url})
                
                scraped = await scrape_url(url, max_length=8000)
                
                # Use scraped content if it's more comprehensive
                if scraped and len(scraped) > len(content):
                    content = scraped
                    logger.success(f"Extracted {len(scraped)} chars from {url[:50]}...")
                    await store_search_log("scraping_success", f"Extracted {len(scraped)} characters from {title}", {
                        "url": url,
                        "content_length": len(scraped)
                    })
                else:
                    await store_search_log("scraping_skip", f"Using Tavily content for {title} (scraped content not better)", {
                        "url": url
                    })
            
            # Only include if we have substantial content
            if content and len(content) > 300:
                all_results.append({
                    "source": url,
                    "title": title,
                    "content": content[:8000],  # Limit per source
                    "score": result.get("score", 0.0),
                })
                await store_search_log("source_added", f"Added source: {title}", {
                    "url": url,
                    "content_length": len(content)
                })
    
    # Sort by relevance score
    all_results.sort(key=lambda x: x.get("score", 0), reverse=True)
    
    # Take top 10 most relevant sources
    top_results = all_results[:10]
    
    logger.success(f"Found {len(top_results)} comprehensive sources (from {len(all_results)} total)")
    await store_search_log("complete", f"Web search complete: {len(top_results)} sources selected from {len(all_results)} total", {
        "total_sources": len(all_results),
        "selected_sources": len(top_results)
    })
    
    # Add aggregated answer as first result if available
    if aggregated_answer:
        top_results.insert(0, {
            "source": "Tavily AI Answer",
            "title": f"AI-Generated Summary for {course_title}",
            "content": aggregated_answer[:10000],
            "score": 1.0,  # Highest priority
        })
        await store_search_log("ai_summary", "Added AI-generated summary as first result")
    
    return top_results







