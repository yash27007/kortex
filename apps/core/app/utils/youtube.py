"""
YouTube Video Processing Utilities

Extracts transcripts and metadata from YouTube videos for course content generation.
Uses youtube-transcript-api for transcript extraction (no API key needed).
"""

import re
from typing import Optional
import httpx
from ..utils.logger import get_logger

logger = get_logger("youtube")


def extract_video_id(url: str) -> Optional[str]:
    """
    Extract YouTube video ID from various URL formats.
    
    Supports:
    - https://www.youtube.com/watch?v=VIDEO_ID
    - https://youtu.be/VIDEO_ID
    - https://www.youtube.com/embed/VIDEO_ID
    """
    patterns = [
        r'(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})',
        r'youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    
    return None


async def get_video_transcript(video_id: str, languages: list[str] = None) -> Optional[str]:
    """
    Get transcript for a YouTube video.
    
    Uses youtube-transcript-api (Python package) or falls back to API.
    For now, we'll use a simple approach with yt-dlp or direct API.
    """
    if languages is None:
        languages = ['en', 'en-US', 'en-GB']
    
    try:
        # Try to get transcript using youtube-transcript-api
        # This requires the package to be installed: pip install youtube-transcript-api
        try:
            from youtube_transcript_api import YouTubeTranscriptApi
            from youtube_transcript_api._errors import TranscriptsDisabled, NoTranscriptFound
            
            transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
            
            # Try to get transcript in preferred language
            transcript = None
            for lang in languages:
                try:
                    transcript = transcript_list.find_transcript([lang])
                    break
                except:
                    continue
            
            # If no preferred language found, get any available
            if not transcript:
                transcript = transcript_list.find_generated_transcript(['en'])
            
            # Fetch the actual transcript
            transcript_data = transcript.fetch()
            
            # Combine all text
            full_text = ' '.join([item['text'] for item in transcript_data])
            
            logger.success(f"Extracted transcript from YouTube video {video_id} ({len(full_text)} chars)")
            return full_text
            
        except ImportError:
            logger.warning("youtube-transcript-api not installed, using fallback method")
            # Fallback: Use yt-dlp or return None
            return None
        except (TranscriptsDisabled, NoTranscriptFound) as e:
            logger.warning(f"Transcript not available for video {video_id}: {e}")
            return None
        except Exception as e:
            logger.error(f"Error getting transcript for {video_id}", exc=e)
            return None
            
    except Exception as e:
        logger.error(f"Failed to extract transcript from {video_id}", exc=e)
        return None


async def process_youtube_video(url: str) -> dict:
    """
    Process a YouTube video URL and extract transcript.
    
    Returns:
        dict with video_id, transcript, title (if available)
    """
    video_id = extract_video_id(url)
    
    if not video_id:
        logger.error(f"Could not extract video ID from URL: {url}")
        return {
            "video_id": None,
            "transcript": None,
            "title": None,
            "url": url,
        }
    
    logger.searching(f"Processing YouTube video: {video_id}")
    
    # Get transcript
    transcript = await get_video_transcript(video_id)
    
    # Try to get video title (optional, requires API key or scraping)
    title = None
    try:
        # Simple scraping approach (no API key needed)
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://www.youtube.com/watch?v={video_id}",
                headers={"User-Agent": "Mozilla/5.0"},
                timeout=10.0,
            )
            if response.status_code == 200:
                # Extract title from HTML
                title_match = re.search(r'<title>([^<]+)</title>', response.text)
                if title_match:
                    title = title_match.group(1).replace(' - YouTube', '').strip()
    except Exception as e:
        logger.warning(f"Could not fetch video title: {e}")
    
    return {
        "video_id": video_id,
        "transcript": transcript,
        "title": title or f"YouTube Video {video_id}",
        "url": url,
    }


async def process_youtube_videos(urls: list[str]) -> list[dict]:
    """
    Process multiple YouTube video URLs.
    
    Returns list of processed video data.
    """
    results = []
    
    for idx, url in enumerate(urls, 1):
        logger.step(f"VIDEO-{idx}", f"Processing YouTube video {idx}/{len(urls)}")
        try:
            video_data = await process_youtube_video(url)
            if video_data.get("transcript"):
                results.append(video_data)
                logger.success(f"Video {idx} processed: {len(video_data['transcript'])} chars")
            else:
                logger.warning(f"Video {idx} has no transcript available")
        except Exception as e:
            logger.error(f"Error processing video {idx}: {url}", exc=e)
    
    return results




