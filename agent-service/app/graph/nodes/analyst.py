"""
Analyst Agent Node

Evaluates and synthesizes gathered research into structured analysis.
"""
import logging
import re

from app.models.state import ResearchState
from app.prompts.templates import ANALYST_PROMPT
from app.graph.llm import get_llm

logger = logging.getLogger(__name__)


async def analyst_node(state: ResearchState) -> dict:
    """
    LangGraph node: Analyzes gathered research data.

    Input: query, raw_content, sources
    Output: analysis, analysis_summary, key_findings, agent_steps
    """
    query = state["query"]
    raw_content = state.get("raw_content", "")
    sources = state.get("sources", [])

    logger.info(f"[Analyst] Analyzing research data ({len(sources)} sources)")

    llm = get_llm()
    prompt = ANALYST_PROMPT.format(
        query=query,
        raw_content=raw_content[:8000],  # Truncate to fit context
        source_count=len(sources),
    )
    response = await llm.ainvoke(prompt)
    analysis_text = response.content

    # Extract key findings (bullet points)
    key_findings = _extract_key_findings(analysis_text)

    # Extract summary (last substantial paragraphs)
    summary = _extract_summary(analysis_text)

    logger.info(f"[Analyst] Identified {len(key_findings)} key findings")

    return {
        "analysis": analysis_text,
        "analysis_summary": summary,
        "key_findings": key_findings,
        "agent_steps": [{"node": "analyst", "status": "completed", "output_summary": f"Identified {len(key_findings)} key findings"}],
    }


def _extract_key_findings(text: str) -> list[str]:
    """Extract bullet-point findings from analysis text."""
    findings = []
    lines = text.split("\n")
    in_findings = False

    for line in lines:
        stripped = line.strip()
        if "key finding" in stripped.lower() or "finding" in stripped.lower() and "#" in stripped:
            in_findings = True
            continue
        if in_findings and stripped.startswith(("-", "*", "•")):
            finding = re.sub(r'^[-*•]\s*', '', stripped)
            if len(finding) > 10:
                findings.append(finding)
        elif in_findings and stripped.startswith("#"):
            in_findings = False

    # Fallback: just grab bullet points
    if not findings:
        for line in lines:
            stripped = line.strip()
            if stripped.startswith(("-", "*", "•")) and len(stripped) > 20:
                finding = re.sub(r'^[-*•]\s*', '', stripped)
                findings.append(finding)

    return findings[:7]


def _extract_summary(text: str) -> str:
    """Extract a summary from the analysis text."""
    # Look for explicit summary section
    summary_match = re.search(
        r'(?:##?\s*Summary|##?\s*Overview)(.*?)(?=##|\Z)',
        text,
        re.DOTALL | re.IGNORECASE,
    )
    if summary_match:
        return summary_match.group(1).strip()

    # Fallback: first 2-3 substantial paragraphs
    paragraphs = [p.strip() for p in text.split("\n\n") if len(p.strip()) > 50 and not p.strip().startswith("#")]
    return "\n\n".join(paragraphs[:3])
