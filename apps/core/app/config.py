"""
Kortex AI Core - Configuration
"""

import os
from pydantic import Field, AliasChoices
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # App
    app_name: str = "Kortex AI Core"
    debug: bool = False
    
    # Gemini API
    # NOTE (2026-08): the entire Gemini 2.5 line 404s as "no longer available
    # to new users" on freshly-created API keys, and the true Gemini 3.1 Pro
    # model is preview-only and hits free-tier quota immediately. Verified
    # live against this project's key: gemini-3.6-flash is the strongest
    # model that reliably works, so it stands in for the "pro" (complex
    # reasoning) tier; gemini-3.5-flash-lite covers the cheap/fast tier.
    # Re-check https://ai.google.dev/gemini-api/docs/models if billing/quota
    # changes make gemini-3.1-pro-preview viable.
    gemini_api_key: str = ""
    gemini_pro_model: str = "gemini-3.6-flash"  # Complex tasks (structure, final lesson content)
    gemini_flash_model: str = "gemini-3.5-flash-lite"  # Fast/cheap tasks
    
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
    # Accepts either TAVILY_KEY (canonical) or TAVILY_API_KEY (common typo/alt name)
    tavily_key: str = Field(
        default="",
        validation_alias=AliasChoices("TAVILY_KEY", "TAVILY_API_KEY"),
    )
    
    # Embedding model
    # text-embedding-004 also 404s on new keys; gemini-embedding-2 is the
    # current stable replacement. It defaults to 3072-dim output, so we
    # explicitly truncate to 768 (via output_dimensionality) to match the
    # existing Qdrant collection sizing below.
    embedding_model: str = "models/gemini-embedding-2"
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

    # Internal service-to-service auth (Python -> Next.js callbacks).
    # Must match INTERNAL_API_SECRET in apps/web's env.
    internal_api_secret: str = ""
    nextjs_api_url: str = "http://localhost:3000"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        # Allow TAVILY_KEY or TAVILY_API_KEY
        case_sensitive = False


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()







