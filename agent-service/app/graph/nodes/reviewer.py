"""
Reviewer Agent Node

Quality-checks the draft report and produces the final improved version.
"""
import logging
import re

from app.models.state import ResearchState
from app.prompts.templates import REVIEWER_PROMPT
from app.tools.research_tools import save_markdown_report
from app.graph.llm import get_llm

logger = logging.getLogger(__name__)


async def reviewer_node(state: ResearchState) -> dict:
    """
    LangGraph node: Reviews and improves the draft report.

    Input: query, draft_report
    Output: review_feedback, review_score, final_report, agent_steps
    """
    query = state["query"]
    draft_report = state.get("draft_report", "")
    session_id = state.get("session_id", "unknown")

    logger.info(f"[Reviewer] Reviewing draft report ({len(draft_report)} chars)")

    llm = get_llm()
    prompt = REVIEWER_PROMPT.format(
        query=query,
        draft_report=draft_report,
    )
    response = await llm.ainvoke(prompt)
    review_text = response.content

    # Parse score
    score = _extract_score(review_text)

    # Parse feedback and final report
    feedback, final_report = _parse_review(review_text, draft_report)

    # Save the final report to disk
    report_title = state.get("report_title", f"Research Report: {query}")
    await save_markdown_report(
        session_id=session_id,
        title=report_title,
        content=final_report,
    )

    logger.info(f"[Reviewer] Review complete. Score: {score:.2f}")

    return {
        "review_feedback": feedback,
        "review_score": score,
        "final_report": final_report,
        "agent_steps": [{"node": "reviewer", "status": "completed", "output_summary": f"Review score: {score:.2f}"}],
    }


def _extract_score(text: str) -> float:
    """Extract quality score from review text."""
    match = re.search(r'SCORE:\s*([\d.]+)', text, re.IGNORECASE)
    if match:
        try:
            return min(1.0, max(0.0, float(match.group(1))))
        except ValueError:
            pass
    return 0.75  # Default score


def _parse_review(text: str, fallback_report: str) -> tuple[str, str]:
    """Parse the review text into feedback and final report sections."""
    feedback = ""
    final_report = fallback_report

    # Split by "## Final Report" or similar headers
    parts = re.split(r'##\s*Final Report', text, flags=re.IGNORECASE)
    if len(parts) >= 2:
        feedback_section = parts[0]
        final_report = parts[1].strip()

        # Extract just the feedback from the feedback section
        feedback_match = re.search(
            r'(?:##\s*Review Feedback|SCORE:.*?\n)(.*)',
            feedback_section,
            re.DOTALL | re.IGNORECASE,
        )
        if feedback_match:
            feedback = feedback_match.group(1).strip()
        else:
            feedback = feedback_section.strip()
    else:
        # If no clear split, use the whole text as final report with feedback
        feedback_match = re.search(r'##\s*Review Feedback(.*?)(?=##|\Z)', text, re.DOTALL | re.IGNORECASE)
        if feedback_match:
            feedback = feedback_match.group(1).strip()
            # Use draft as final if no improved version found
            final_report = fallback_report

    return feedback, final_report
