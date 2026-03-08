"""
Research state model for the LangGraph workflow.

Defines the TypedDict that flows through all agent nodes.
"""
from typing import TypedDict, Optional, Annotated
from operator import add


class SourceItem(TypedDict, total=False):
    """A single research source."""
    title: str
    url: str
    snippet: str
    relevance_score: float
    source_type: str


class AgentStep(TypedDict, total=False):
    """Record of an agent node execution."""
    node: str
    status: str
    output_summary: str


class ResearchState(TypedDict, total=False):
    """
    Central state object that flows through the LangGraph research pipeline.
    Each node reads from and writes to this state.
    """
    # Input
    session_id: str
    query: str
    depth: str

    # Planner output
    research_plan: str
    sub_questions: list[str]

    # Researcher output
    sources: Annotated[list[SourceItem], add]
    raw_content: str

    # Analyst output
    analysis: str
    analysis_summary: str
    key_findings: list[str]

    # Writer output
    report_title: str
    draft_report: str

    # Reviewer output
    review_feedback: str
    review_score: float
    final_report: str

    # Metadata
    agent_steps: Annotated[list[AgentStep], add]
    error: Optional[str]
