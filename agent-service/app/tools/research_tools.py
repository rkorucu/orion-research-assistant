"""
Agent tools for the research workflow.

Provides: web_search, fetch_url, read_uploaded_file, save_markdown_report
"""
import asyncio
import re
import logging
from pathlib import Path
from urllib.parse import urlparse

import httpx
from bs4 import BeautifulSoup
from markdownify import markdownify

logger = logging.getLogger(__name__)


def _extract_domain(url: str) -> str:
    try:
        return urlparse(url).netloc.replace("www.", "")
    except Exception:
        return ""


async def web_search(query: str, max_results: int = 8) -> list[dict]:
    """
    Search the web using DuckDuckGo (no API key required).
    Falls back to Serper API if SERPER_API_KEY env var is set.
    Returns diverse results from different domains.
    """
    logger.info(f"Web search: '{query}' (max_results={max_results})")

    try:
        from app.config import settings
        api_key = getattr(settings, "serper_api_key", "")
        if api_key:
            return await _serper_search(query, max_results, api_key)
    except Exception:
        pass

    results = await _duckduckgo_search(query, max_results)
    if not results:
        logger.info("DuckDuckGo failed or returned 0, falling back to Wikipedia")
        results = await _wikipedia_search(query, max_results)
    return results


async def _duckduckgo_search(query: str, max_results: int) -> list[dict]:
    """Search via DuckDuckGo — free, no API key needed."""
    def _sync_search() -> list[dict]:
        from duckduckgo_search import DDGS
        results: list[dict] = []
        seen_domains: set[str] = set()
        with DDGS() as ddgs:
            for r in ddgs.text(query, max_results=max_results * 2):
                domain = _extract_domain(r.get("href", ""))
                if domain and domain in seen_domains:
                    continue
                seen_domains.add(domain)
                results.append({
                    "title": r.get("title", ""),
                    "url": r.get("href", ""),
                    "snippet": r.get("body", ""),
                    "relevance_score": 0.85,
                    "source_type": "WEB",
                })
                if len(results) >= max_results:
                    break
        return results

    try:
        loop = asyncio.get_event_loop()
        results: list[dict] = await loop.run_in_executor(None, _sync_search)
        logger.info(f"DuckDuckGo: {len(results)} results for '{query}'")
        return results
    except Exception as e:
        logger.error(f"DuckDuckGo search failed: {e}")
        return []


async def _wikipedia_search(query: str, max_results: int) -> list[dict]:
    """Search via Wikipedia API."""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                "https://en.wikipedia.org/w/api.php",
                params={
                    "action": "query",
                    "list": "search",
                    "srsearch": query,
                    "utf8": "",
                    "format": "json"
                }
            )
            resp.raise_for_status()
            data = resp.json()
            results = []
            for item in data.get("query", {}).get("search", [])[:max_results]:
                title = item["title"]
                snippet = re.sub(r"<[^>]+>", "", item["snippet"])
                results.append({
                    "title": f"Wikipedia: {title}",
                    "url": f"https://en.wikipedia.org/wiki/{title.replace(' ', '_')}",
                    "snippet": snippet,
                    "relevance_score": 0.85,
                    "source_type": "WIKIPEDIA"
                })
            logger.info(f"Wikipedia: {len(results)} results for '{query}'")
            return results
    except Exception as e:
        logger.error(f"Wikipedia search failed: {e}")
        return []


async def _serper_search(query: str, max_results: int, api_key: str) -> list[dict]:
    """Search via Google Serper API."""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                "https://google.serper.dev/search",
                headers={"X-API-KEY": api_key, "Content-Type": "application/json"},
                json={"q": query, "num": max_results},
            )
            response.raise_for_status()
            data = response.json()

        seen_domains: set[str] = set()
        results: list[dict] = []
        for r in data.get("organic", []):
            domain = _extract_domain(r.get("link", ""))
            if domain in seen_domains:
                continue
            seen_domains.add(domain)
            results.append({
                "title": r.get("title", ""),
                "url": r.get("link", ""),
                "snippet": r.get("snippet", ""),
                "relevance_score": 0.9,
                "source_type": "WEB",
            })
        logger.info(f"Serper: {len(results)} results for '{query}'")
        return results
    except Exception as e:
        logger.error(f"Serper search failed: {e} — falling back to DuckDuckGo")
        return await _duckduckgo_search(query, max_results)


async def fetch_url(url: str) -> dict:
    """Fetch and extract main content from a URL as markdown."""
    logger.info(f"Fetching URL: {url}")
    try:
        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
            response = await client.get(url, headers={
                "User-Agent": "Mozilla/5.0 (compatible; OrionAI/1.0; Research Bot)"
            })
            response.raise_for_status()

        soup = BeautifulSoup(response.text, "html.parser")
        for tag in soup(["script", "style", "nav", "footer", "header", "aside", "noscript"]):
            tag.decompose()

        raw_title = soup.title.string if soup.title else url
        title = str(raw_title).strip() if raw_title else url

        main_elem = soup.find("main") or soup.find("article") or soup.body or soup
        content = markdownify(str(main_elem), strip=["img", "a"])
        content = re.sub(r"\n{3,}", "\n\n", content).strip()

        if len(content) > 6000:
            content = content[:6000] + "\n\n...[content truncated]"

        return {"title": title, "content": content, "url": url}

    except Exception as e:
        logger.error(f"Failed to fetch URL {url}: {e}")
        return {"title": url, "content": f"Failed to fetch content: {e}", "url": url}


async def read_uploaded_file(file_path: str) -> dict:
    """Read and extract content from an uploaded file."""
    logger.info(f"Reading uploaded file: {file_path}")
    path = Path(file_path)
    if not path.exists():
        return {"filename": path.name, "content": "File not found", "error": True}
    try:
        content = path.read_text(encoding="utf-8")
        return {"filename": path.name, "content": content, "size": path.stat().st_size}
    except Exception as e:
        logger.error(f"Failed to read file {file_path}: {e}")
        return {"filename": path.name, "content": f"Error reading file: {e}", "error": True}


async def save_markdown_report(
    session_id: str,
    title: str,
    content: str,
    output_dir: str = "./reports",
) -> dict:
    """Save a markdown report to disk."""
    logger.info(f"Saving report for session {session_id}: {title}")
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    safe_title = "".join(c if c.isalnum() or c in ("-", "_") else "_" for c in title)
    filename = f"{session_id}_{safe_title[:50]}.md"
    file_path = output_path / filename
    file_path.write_text(content, encoding="utf-8")

    return {
        "file_path": str(file_path),
        "filename": filename,
        "size": file_path.stat().st_size,
        "status": "saved",
    }
