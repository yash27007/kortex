"""
Google Gemini AI Client using google-genai SDK
https://pypi.org/project/google-genai/
"""

import asyncio
import os
from typing import AsyncGenerator
from functools import lru_cache

from google import genai
from google.genai import types

from ..config import get_settings

# gemini-embedding-2 defaults to 3072-dim output; truncate to match the
# existing Qdrant collection sizing (config.embedding_dimensions).
_EMBED_CONCURRENCY = 10


class GeminiClient:
    """Wrapper for Google Gemini AI using the new google-genai SDK."""
    
    def __init__(self):
        settings = get_settings()
        self.client = genai.Client(api_key=settings.gemini_api_key)
        self.pro_model = settings.gemini_pro_model
        self.flash_model = settings.gemini_flash_model
        self.embedding_model = settings.embedding_model
        self.embedding_dimensions = settings.embedding_dimensions
    
    async def generate(
        self,
        prompt: str,
        system_instruction: str | None = None,
        use_pro: bool = False,
        temperature: float = 0.7,
        max_tokens: int = 8192,
    ) -> str:
        """Generate content using Gemini."""
        model = self.pro_model if use_pro else self.flash_model
        
        config = types.GenerateContentConfig(
            temperature=temperature,
            max_output_tokens=max_tokens,
        )
        
        if system_instruction:
            config.system_instruction = system_instruction
        
        response = await self.client.aio.models.generate_content(
            model=model,
            contents=prompt,
            config=config,
        )
        
        return response.text or ""
    
    async def generate_stream(
        self,
        prompt: str,
        system_instruction: str | None = None,
        use_pro: bool = False,
        temperature: float = 0.7,
    ) -> AsyncGenerator[str, None]:
        """Stream content generation token by token."""
        model = self.pro_model if use_pro else self.flash_model
        
        config = types.GenerateContentConfig(
            temperature=temperature,
        )
        
        if system_instruction:
            config.system_instruction = system_instruction
        
        async for chunk in await self.client.aio.models.generate_content_stream(
            model=model,
            contents=prompt,
            config=config,
        ):
            if chunk.text:
                yield chunk.text
    
    async def generate_json(
        self,
        prompt: str,
        schema: dict,
        system_instruction: str | None = None,
        use_pro: bool = True,
        temperature: float = 0.3,  # Lower default for structured output
    ) -> dict:
        """Generate structured JSON output."""
        model = self.pro_model if use_pro else self.flash_model

        config = types.GenerateContentConfig(
            temperature=temperature,
            response_mime_type="application/json",
            response_json_schema=schema,
        )
        
        if system_instruction:
            config.system_instruction = system_instruction
        
        response = await self.client.aio.models.generate_content(
            model=model,
            contents=prompt,
            config=config,
        )
        
        return response.parsed or {}
    
    async def embed(self, texts: list[str]) -> list[list[float]]:
        """Generate embeddings for texts, with bounded concurrency.

        The Gemini embedding API embeds one logical item per call (passing a
        list as `contents` concatenates it into a single item rather than
        batching), so we fan out concurrent calls instead of a sequential loop.
        """
        semaphore = asyncio.Semaphore(_EMBED_CONCURRENCY)

        async def embed_one(text: str) -> list[float]:
            async with semaphore:
                return await self.embed_single(text)

        return await asyncio.gather(*(embed_one(t) for t in texts))

    async def embed_single(self, text: str) -> list[float]:
        """Generate embedding for a single text."""
        response = await self.client.aio.models.embed_content(
            model=self.embedding_model,
            contents=text,
            config=types.EmbedContentConfig(
                output_dimensionality=self.embedding_dimensions,
            ),
        )

        if response.embeddings:
            return response.embeddings[0].values
        return []


@lru_cache
def get_gemini_client() -> GeminiClient:
    """Get cached Gemini client instance."""
    return GeminiClient()





