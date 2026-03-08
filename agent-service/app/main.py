"""
Orion AI Agent Service — FastAPI Application

Multi-step research agent powered by LangGraph.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router as api_router
from app.config import settings

app = FastAPI(
    title="Orion AI Agent Service",
    description="Agentic research pipeline using LangGraph",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(api_router, prefix="/api")


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "orion-agent-service"}
