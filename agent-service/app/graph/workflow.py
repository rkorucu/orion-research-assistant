"""
LangGraph Research Workflow

Orchestrates the 5-node research pipeline:
    Planner → Researcher → Analyst → Writer → Reviewer

Each node reads from and writes to the shared ResearchState.
"""
import logging
from typing import Optional

from langgraph.graph import StateGraph, END

from app.models.state import ResearchState
from app.graph.nodes.planner import planner_node
from app.graph.nodes.researcher import researcher_node
from app.graph.nodes.analyst import analyst_node
from app.graph.nodes.writer import writer_node
from app.graph.nodes.reviewer import reviewer_node

logger = logging.getLogger(__name__)


def build_research_graph() -> StateGraph:
    """
    Constructs the LangGraph research workflow.

    Graph topology:
        START → planner → researcher → analyst → writer → reviewer → END
    """
    graph = StateGraph(ResearchState)

    # Add nodes
    graph.add_node("planner", planner_node)
    graph.add_node("researcher", researcher_node)
    graph.add_node("analyst", analyst_node)
    graph.add_node("writer", writer_node)
    graph.add_node("reviewer", reviewer_node)

    # Define edges (linear pipeline)
    graph.set_entry_point("planner")
    graph.add_edge("planner", "researcher")
    graph.add_edge("researcher", "analyst")
    graph.add_edge("analyst", "writer")
    graph.add_edge("writer", "reviewer")
    graph.add_edge("reviewer", END)

    return graph


# Compile the graph once at module level
_compiled_graph = build_research_graph().compile()


async def run_research_workflow(
    session_id: str,
    query: str,
    depth: Optional[str] = "standard",
) -> ResearchState:
    """
    Execute the full research workflow.

    Args:
        session_id: The research session ID
        query: The user's research query
        depth: Research depth (quick, standard, deep)

    Returns:
        The final ResearchState with all outputs
    """
    logger.info(f"Starting research workflow for session {session_id}")
    logger.info(f"Query: '{query}' | Depth: {depth}")

    initial_state: ResearchState = {
        "session_id": session_id,
        "query": query,
        "depth": depth or "standard",
        "sources": [],
        "agent_steps": [],
    }

    try:
        # Run the compiled graph
        result = await _compiled_graph.ainvoke(initial_state)
        logger.info(f"Research workflow completed for session {session_id}")
        return result
    except Exception as e:
        logger.error(f"Research workflow failed for session {session_id}: {e}", exc_info=True)
        raise
