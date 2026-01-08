"""
Kortex AI Core - Structured Logging Utility

Provides emoji-prefixed, timestamped logging for AI agent workflows.
Helps debug "stuck at 50%" issues by showing exactly what the AI is doing.
"""

import logging
import sys
from datetime import datetime
from typing import Optional


class AgentLogger:
    """
    Structured logger for AI agent workflows.
    
    Usage:
        logger = get_logger("lesson_123")
        logger.info("🧠 AGENT THINKING: Analyzing bloom level...")
        logger.info("🔍 WEB SURFING: Searching for 'NFA to DFA conversion'...")
    """
    
    def __init__(self, context_id: Optional[str] = None):
        self.context_id = context_id
        self.logger = logging.getLogger(f"kortex.agent.{context_id or 'global'}")
        self.logger.setLevel(logging.INFO)
        
        # Avoid duplicate handlers
        if not self.logger.handlers:
            handler = logging.StreamHandler(sys.stdout)
            handler.setFormatter(
                logging.Formatter(
                    '%(asctime)s [%(name)s] %(message)s',
                    datefmt='%Y-%m-%d %H:%M:%S'
                )
            )
            self.logger.addHandler(handler)
    
    def _format_message(self, emoji: str, message: str) -> str:
        """Format log message with emoji and context."""
        prefix = f"{emoji} "
        if self.context_id:
            prefix += f"[{self.context_id}] "
        return f"{prefix}{message}"
    
    def thinking(self, message: str):
        """Log agent thinking/analysis."""
        self.logger.info(self._format_message("🧠", f"AGENT THINKING: {message}"))
    
    def searching(self, message: str):
        """Log web search/RAG operations."""
        self.logger.info(self._format_message("🔍", f"WEB SURFING: {message}"))
    
    def generating(self, message: str):
        """Log content generation."""
        self.logger.info(self._format_message("✍️", f"GENERATING: {message}"))
    
    def visualizing(self, message: str):
        """Log visualization generation."""
        self.logger.info(self._format_message("🎨", f"GENERATING JSON: {message}"))
    
    def saving(self, message: str):
        """Log database/storage operations."""
        self.logger.info(self._format_message("💾", f"SAVING: {message}"))
    
    def success(self, message: str):
        """Log successful completion."""
        self.logger.info(self._format_message("✅", f"SUCCESS: {message}"))
    
    def error(self, message: str, exc: Optional[Exception] = None):
        """Log errors."""
        error_msg = f"ERROR: {message}"
        if exc:
            error_msg += f" - {type(exc).__name__}: {str(exc)}"
        self.logger.error(self._format_message("❌", error_msg))
    
    def warning(self, message: str):
        """Log warnings."""
        self.logger.warning(self._format_message("⚠️", f"WARNING: {message}"))
    
    def step(self, step_name: str, message: str):
        """Log a workflow step."""
        self.logger.info(self._format_message("📋", f"STEP [{step_name}]: {message}"))


# Global logger instance
_global_logger: Optional[AgentLogger] = None


def get_logger(context_id: Optional[str] = None) -> AgentLogger:
    """
    Get a logger instance for the given context.
    
    Args:
        context_id: Optional identifier (e.g., lesson_id, course_id)
    
    Returns:
        AgentLogger instance
    """
    return AgentLogger(context_id=context_id)


def get_global_logger() -> AgentLogger:
    """Get the global logger instance."""
    global _global_logger
    if _global_logger is None:
        _global_logger = AgentLogger()
    return _global_logger




