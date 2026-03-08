"""
API routes for the agent service.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from app.graph.workflow import run_research_workflow
from app.models.state import ResearchState

router = APIRouter()


class ResearchRequest(BaseModel):
    """Request model for triggering research."""
    session_id: str
    query: str
    depth: Optional[str] = "standard"


class ResearchResponse(BaseModel):
    """Response model after research completes."""
    session_id: str
    status: str
    report_title: Optional[str] = None
    report_content: Optional[str] = None
    summary: Optional[str] = None
    sources: list = []
    agent_steps: list = []


@router.post("/agent/research", response_model=ResearchResponse)
async def trigger_research(request: ResearchRequest):
    """
    Trigger the LangGraph research workflow.
    Runs the full pipeline: Planner → Researcher → Analyst → Writer → Reviewer
    """
    try:
        result: ResearchState = await run_research_workflow(
            session_id=request.session_id,
            query=request.query,
            depth=request.depth,
        )

        return ResearchResponse(
            session_id=request.session_id,
            status="completed",
            report_title=result.get("report_title", ""),
            report_content=result.get("final_report", ""),
            summary=result.get("analysis_summary", ""),
            sources=result.get("sources", []),
            agent_steps=result.get("agent_steps", []),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Research workflow failed: {str(e)}")


@router.get("/agent/status/{session_id}")
async def get_research_status(session_id: str):
    """Check the status of a research workflow."""
    # In a production system, this would check a persistent store
    return {"session_id": session_id, "status": "unknown"}
