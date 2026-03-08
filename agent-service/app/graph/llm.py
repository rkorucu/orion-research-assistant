"""
LLM provider — Ollama (completely free, local, no API key needed).
Ollama runs natively on the host Mac; Docker connects via host.docker.internal.
"""
from langchain_community.chat_models import ChatOllama
from app.config import settings


def get_llm(temperature: float = 0.3, model: str = None) -> ChatOllama:
    """
    Get a configured LLM instance using local Ollama.
    Default model: llama3.2 (already installed on host)
    """
    return ChatOllama(
        model=model or settings.ollama_model,
        base_url=settings.ollama_base_url,
        temperature=temperature,
    )
