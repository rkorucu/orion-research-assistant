"""
Memory module for persistent conversation/research state.

Placeholder for future implementation with PostgreSQL-backed checkpointing
or vector store memory.
"""
from typing import Optional


class ResearchMemory:
    """
    Manages persistent memory for research sessions.

    In a full implementation, this would:
    - Store intermediate LangGraph checkpoints
    - Cache research results for reuse
    - Track conversation history
    """

    def __init__(self, session_id: str):
        self.session_id = session_id
        self._store: dict = {}

    def save(self, key: str, value) -> None:
        """Save a value to memory."""
        self._store[key] = value

    def load(self, key: str, default=None):
        """Load a value from memory."""
        return self._store.get(key, default)

    def clear(self) -> None:
        """Clear all memory for this session."""
        self._store.clear()
