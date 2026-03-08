import React from "react";
import ReactMarkdown from "react-markdown";

/**
 * Renders a markdown research report with proper styling.
 * @param {Object} props
 * @param {string} props.content - Markdown content to render
 * @param {string} props.title - Report title
 */
export default function ReportViewer({ content, title }) {
  if (!content) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📄</div>
        <h3>No Report Yet</h3>
        <p>Start a research session to generate a report.</p>
      </div>
    );
  }

  return (
    <div className="report-viewer fade-in" id="report-viewer">
      {title && <h1>{title}</h1>}
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
