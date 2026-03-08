"""
Planner Agent Node

Decomposes the user's query into a structured research plan with sub-questions.
"""
import logging
import re

from app.models.state import ResearchState
from app.prompts.templates import PLANNER_PROMPT
from app.graph.llm import get_llm

logger = logging.getLogger(__name__)


async def planner_node(state: ResearchState) -> dict:
    """
    LangGraph node: Creates a research plan from the user query.

    Input: query, depth
    Output: research_plan, sub_questions, agent_steps
    """
    query = state["query"]
    depth = state.get("depth", "standard")
    logger.info(f"[Planner] Planning research for: '{query}' (depth={depth})")

    llm = get_llm()

    prompt = PLANNER_PROMPT.format(query=query, depth=depth)
    response = await llm.ainvoke(prompt)
    plan_text = response.content

    # Extract sub-questions from the plan
    sub_questions = _extract_sub_questions(plan_text)
    if not sub_questions:
        sub_questions = [
            f"What is the current state of {query}?",
            f"What are the key developments in {query}?",
            f"What are the main challenges related to {query}?",
            f"What are the future trends for {query}?",
        ]

    logger.info(f"[Planner] Generated {len(sub_questions)} sub-questions")

    return {
        "research_plan": plan_text,
        "sub_questions": sub_questions,
        "agent_steps": [{"node": "planner", "status": "completed", "output_summary": f"Created plan with {len(sub_questions)} sub-questions"}],
    }


def _extract_sub_questions(text: str) -> list[str]:
    """Extract numbered questions from the plan text."""
    lines = text.split("\n")
    questions = []
    for line in lines:
        line = line.strip()
        # Match patterns like "1. ", "1) ", "- ", "* "
        match = re.match(r'^[\d]+[\.\)]\s*(.+\?)', line)
        if match:
            questions.append(match.group(1).strip())
        elif line.endswith("?") and len(line) > 15:
            # Also capture standalone questions
            cleaned = re.sub(r'^[-*•]\s*', '', line)
            questions.append(cleaned)
    return questions[:7]  # Cap at 7 questions
