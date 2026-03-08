"""
Researcher Agent Node

Gathers information from web searches and URL fetching based on the research plan.
"""
import asyncio
import logging
import re
from urllib.parse import urlparse

from app.models.state import ResearchState
from app.prompts.templates import RESEARCHER_PROMPT
from app.tools.research_tools import web_search, fetch_url
from app.graph.llm import get_llm

logger = logging.getLogger(__name__)

# Domains that tend to block scrapers or provide low-value content
_BLOCKED_DOMAINS = {
    "youtube.com", "facebook.com", "twitter.com", "instagram.com",
    "tiktok.com", "pinterest.com", "linkedin.com", "reddit.com",
    "quora.com", "amazon.com", "ebay.com",
}


def _get_domain(url: str) -> str:
    try:
        return urlparse(url).netloc.replace("www.", "")
    except Exception:
        return ""


def _deduplicate_by_domain(sources: list[dict]) -> list[dict]:
    """Keep only the first result per domain for diversity."""
    seen: set[str] = set()
    unique: list[dict] = []
    for s in sources:
        domain = _get_domain(s.get("url", ""))
        if not domain or domain in seen:
            continue
        seen.add(domain)
        unique.append(s)
    return unique


def _is_fetchable(url: str) -> bool:
    domain = _get_domain(url)
    return url.startswith("http") and domain not in _BLOCKED_DOMAINS


def _clean_search_query(q: str) -> str:
    """Strip markdown formatting and truncate to a clean short query for DuckDuckGo."""
    # Remove **bold**, *italic*, `code` markers
    q = re.sub(r"\*{1,2}([^*]+)\*{1,2}", r"\1", q)
    q = re.sub(r"`([^`]+)`", r"\1", q)
    # Remove leading labels like "1." or "Q:"
    q = re.sub(r"^[\d]+\.\s*", "", q.strip())
    q = re.sub(r"^[A-Z][^:]{0,20}:\s*", "", q)
    # Truncate to 100 chars at a word boundary
    if len(q) > 100:
        q = q[:100].rsplit(" ", 1)[0]
    return q.strip()


async def researcher_node(state: ResearchState) -> dict:
    """
    LangGraph node: Gathers research sources and raw content.

    Input:  query, research_plan, sub_questions
    Output: sources, raw_content, agent_steps
    """
    query = state["query"]
    research_plan = state.get("research_plan", "")
    sub_questions = state.get("sub_questions", [query])

    logger.info(f"[Researcher] {len(sub_questions)} sub-questions to research")

    # --- 1. Search for each sub-question (5 results each, deduplicated per domain) ---
    all_sources: list[dict] = []
    seen_urls: set[str] = set()

    for i, sq in enumerate(sub_questions):
        if i > 0:
            await asyncio.sleep(1.5)  # DuckDuckGo rate limit önlemi
        clean_q = _clean_search_query(sq)
        logger.info(f"[Researcher] Search query: '{clean_q}'")
        results = await web_search(clean_q, max_results=5)
        for r in results:
            url = r.get("url", "")
            if url and url not in seen_urls:
                seen_urls.add(url)
                all_sources.append({
                    "title": r.get("title", ""),
                    "url": url,
                    "snippet": r.get("snippet", ""),
                    "relevance_score": r.get("relevance_score", 0.0),
                    "source_type": r.get("source_type", "WEB"),
                })

    # Deduplicate by domain to ensure diverse sources
    all_sources = _deduplicate_by_domain(all_sources)
    logger.info(f"[Researcher] {len(all_sources)} unique sources after dedup")

    # --- 2. Fetch content from top fetchable sources (up to 6) ---
    fetchable = [s for s in all_sources if _is_fetchable(s["url"])][:6]

    fetch_tasks = [fetch_url(s["url"]) for s in fetchable]
    fetched_results = await asyncio.gather(*fetch_tasks, return_exceptions=True)

    all_content: list[str] = []
    for fetched in fetched_results:
        if isinstance(fetched, BaseException):
            logger.warning(f"[Researcher] Fetch error: {fetched}")
            continue
        fetched_dict: dict = fetched  # type: ignore[assignment]
        content = fetched_dict.get("content", "")
        title = fetched_dict.get("title", "")
        # Skip pages that failed or returned trivial content
        if content and len(content) > 200 and not content.startswith("Failed to fetch"):
            all_content.append(f"### {title}\n\n{content}")

    # --- 3. LLM synthesis of gathered findings ---
    llm = get_llm()
    sub_q_text = "\n".join(f"- {q}" for q in sub_questions)
    prompt = RESEARCHER_PROMPT.format(
        query=query,
        research_plan=research_plan,
        sub_questions=sub_q_text,
    )
    response = await llm.ainvoke(prompt)
    synthesized: str = response.content

    raw_content = synthesized
    if all_content:
        raw_content += "\n\n---\n\n## Fetched Source Content\n\n" + "\n\n---\n\n".join(all_content)

    logger.info(
        f"[Researcher] Done — {len(all_sources)} sources, {len(all_content)} pages fetched"
    )

    return {
        "sources": all_sources,
        "raw_content": raw_content,
        "agent_steps": [{
            "node": "researcher",
            "status": "completed",
            "output_summary": f"Gathered {len(all_sources)} sources from {len(all_content)} fetched pages",
        }],
    }
