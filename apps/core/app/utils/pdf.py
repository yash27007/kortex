"""
PDF Processing Utilities

Supports downloading PDFs from:
- Public URLs
- Supabase Storage (public buckets)
- Supabase Storage (signed URLs for private buckets)
"""

import io
from typing import AsyncGenerator
from urllib.parse import urlparse

import httpx
from pypdf import PdfReader

from ..config import get_settings


async def download_pdf(url: str) -> bytes:
    """
    Download PDF from URL.
    
    Supports:
    - Public URLs
    - Supabase Storage URLs (public buckets)
    - Signed URLs (for private buckets)
    
    For private Supabase buckets, pass a signed URL generated via:
        storage.get_signed_url(path, bucket="pdfs")
    """
    async with httpx.AsyncClient() as client:
        # Add User-Agent header for better compatibility
        headers = {
            "User-Agent": "Mozilla/5.0 (compatible; KortexBot/1.0)",
        }
        
        response = await client.get(
            url, 
            follow_redirects=True, 
            timeout=60.0,
            headers=headers,
        )
        response.raise_for_status()
        return response.content


async def download_pdf_from_storage(
    path: str,
    bucket: str = "pdfs",
) -> bytes:
    """
    Download PDF directly from Supabase Storage using S3 API.
    
    Args:
        path: Path within the bucket (e.g., "course_123/syllabus.pdf")
        bucket: Bucket name (defaults to "pdfs")
        
    Returns:
        PDF bytes
    """
    from ..clients import get_storage_client
    
    storage = get_storage_client()
    return storage.download_file(path, bucket)


def extract_text_from_bytes(pdf_bytes: bytes) -> list[dict]:
    """Extract text from PDF bytes, page by page."""
    pages = []
    reader = PdfReader(io.BytesIO(pdf_bytes))
    
    for i, page in enumerate(reader.pages):
        text = page.extract_text() or ""
        if text.strip():
            pages.append({
                "page": i + 1,
                "text": text.strip(),
            })
    
    return pages


async def extract_pdf_text(pdf_url: str) -> list[dict]:
    """Download and extract text from a PDF URL."""
    try:
        pdf_bytes = await download_pdf(pdf_url)
        return extract_text_from_bytes(pdf_bytes)
    except Exception as e:
        print(f"Error extracting PDF: {e}")
        return []


def chunk_text(
    text: str,
    chunk_size: int | None = None,
    overlap: int | None = None,
) -> list[str]:
    """Split text into overlapping chunks."""
    settings = get_settings()
    chunk_size = chunk_size or settings.chunk_size
    overlap = overlap or settings.chunk_overlap
    
    # Simple word-based chunking
    words = text.split()
    chunks = []
    
    start = 0
    while start < len(words):
        end = start + chunk_size
        chunk = " ".join(words[start:end])
        chunks.append(chunk)
        start = end - overlap
    
    return chunks


def chunk_pages(
    pages: list[dict],
    chunk_size: int | None = None,
    overlap: int | None = None,
    source: str = "pdf",
) -> list[dict]:
    """Chunk multiple pages into overlapping text chunks."""
    all_chunks = []
    
    for page_data in pages:
        page_num = page_data["page"]
        text = page_data["text"]
        
        chunks = chunk_text(text, chunk_size, overlap)
        for chunk in chunks:
            all_chunks.append({
                "text": chunk,
                "page": page_num,
                "source": source,
            })
    
    return all_chunks







