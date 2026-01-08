"""
Kortex AI Core - Configuration
"""

import os
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # App
    app_name: str = "Kortex AI Core"
    debug: bool = False
    
    # Gemini API
    gemini_api_key: str = ""
    gemini_pro_model: str = "gemini-2.5-pro"  # Complex tasks
    gemini_flash_model: str = "gemini-2.5-flash"  # Fast tasks
    
    # Qdrant Vector DB
    qdrant_host: str = "localhost"
    qdrant_port: int = 6333
    qdrant_api_key: str | None = None
    
    # Redis Cache
    redis_host: str = "localhost"
    redis_port: int = 6379
    redis_password: str | None = None
    redis_db: int = 0
    
    # Supabase Storage (S3 compatible)
    # Generate credentials from: Supabase Dashboard > Project Settings > Storage > S3 Access Keys
    # See: https://supabase.com/docs/guides/storage/s3/authentication
    s3_access_key_id: str = ""
    s3_access_key_secret: str = ""
    s3_endpoint: str = ""  # e.g., https://project_ref.supabase.co/storage/v1/s3
    s3_region: str = "us-east-1"  # Default region for Supabase
    
    # Storage bucket names
    storage_bucket_videos: str = "videos"  # For Manim-generated videos
    storage_bucket_pdfs: str = "pdfs"  # For uploaded PDFs
    storage_bucket_assets: str = "assets"  # For general assets
    
    # Tavily API for web search
    # Reads from TAVILY_KEY environment variable
    tavily_key: str = ""
    
    # Embedding model
    embedding_model: str = "models/text-embedding-004"
    embedding_dimensions: int = 768
    
    # Chunk settings
    chunk_size: int = 500
    chunk_overlap: int = 50
    
    # Inngest Configuration
    # INNGEST_DEV: Set to "1" for local dev server
    # INNGEST_SIGNING_KEY: Required for production
    # INNGEST_EVENT_KEY: For sending events from Next.js
    inngest_app_id: str = "kortex-core"
    inngest_dev: bool = True  # Use local Inngest dev server (set INNGEST_DEV=1 in .env)
    inngest_signing_key: str | None = None  # Required in production
    inngest_event_key: str | None = None  # For sending events
    
    # Firecrawl API (for enhanced web scraping)
    firecrawl_api_key: str | None = None
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        # Allow TAVILY_KEY or TAVILY_API_KEY
        case_sensitive = False


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()







