"""
Writer Agent Node

Generates a structured markdown research report from the analysis.
"""
import logging
import re

from app.models.state import ResearchState
from app.prompts.templates import WRITER_PROMPT
from app.graph.llm import get_llm

logger = logging.getLogger(__name__)


async def writer_node(state: ResearchState) -> dict:
    """
    LangGraph node: Generates a draft research report.

    Input: query, analysis, key_findings, analysis_summary
    Output: report_title, draft_report, agent_steps
    """
    query = state["query"]
    analysis = state.get("analysis", "")
    key_findings = state.get("key_findings", [])
    analysis_summary = state.get("analysis_summary", "")

    logger.info(f"[Writer] Generating report for query: '{query}'")

    llm = get_llm()
    findings_text = "\n".join(f"- {f}" for f in key_findings)

    prompt = WRITER_PROMPT.format(
        query=query,
        analysis=analysis[:6000],
        key_findings=findings_text,
        analysis_summary=analysis_summary,
    )
    response = await llm.ainvoke(prompt)
    report_text = response.content

    # Extract title from the report
    title = _extract_title(report_text, query)

    logger.info(f"[Writer] Generated report: '{title}' ({len(report_text)} chars)")

    return {
        "report_title": title,
        "draft_report": report_text,
        "agent_steps": [{"node": "writer", "status": "completed", "output_summary": f"Generated report: {title}"}],
    }


def _extract_title(report: str, fallback_query: str) -> str:
    """Extract the title from the report markdown."""
    lines = report.strip().split("\n")
    for line in lines[:5]:
        stripped = line.strip()
        if stripped.startswith("# "):
            return stripped[2:].strip()
        elif stripped.startswith("## "):
            return stripped[3:].strip()

    # Fallback: generate from query
    return f"Research Report: {fallback_query}"
