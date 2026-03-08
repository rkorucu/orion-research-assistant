"""
Application configuration loaded from environment variables.
"""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Agent service configuration."""

    # OpenAI (artık kullanılmıyor, eski referanslar için tutuldu)
    openai_api_key: str = ""
    openai_model: str = "gpt-4o"

    # Groq (opsiyonel, boş bırakılabilir)
    groq_api_key: str = ""
    groq_model: str = "llama3-70b-8192"

    # Ollama — tamamen ücretsiz, yerel
    ollama_base_url: str = "http://host.docker.internal:11434"
    ollama_model: str = "llama3.2"

    # Database
    database_url: str = "postgresql://orion:orion_secret@localhost:5432/orion_db"

    # Backend service
    backend_url: str = "http://localhost:8080"

    # Search — leave serper_api_key empty to use free DuckDuckGo
    serper_api_key: str = ""

    # Agent config
    max_search_results: int = 8
    research_depth: str = "standard"  # quick, standard, deep

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
