import React from "react";
import { FiExternalLink } from "react-icons/fi";

/**
 * Displays a list of research sources with index, title, URL, and snippet.
 * @param {Object} props
 * @param {Array} props.sources - Array of source objects { title, url, snippet, relevanceScore }
 */
export default function SourcesList({ sources = [] }) {
  if (!sources.length) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🔗</div>
        <h3>No Sources</h3>
        <p>Sources will appear here once research is complete.</p>
      </div>
    );
  }

  return (
    <div className="sources-list fade-in" id="sources-list">
      {sources.map((source, idx) => (
        <div className="source-item" key={source.id || idx}>
          <div className="source-index">{idx + 1}</div>
          <div className="source-info">
            <h4>
              {source.url ? (
                <a href={source.url} target="_blank" rel="noopener noreferrer">
                  {source.title || source.url} <FiExternalLink size={12} />
                </a>
              ) : (
                source.title
              )}
            </h4>
            {source.url && <div className="source-url">{source.url}</div>}
            {source.snippet && (
              <div className="source-snippet">{source.snippet}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
