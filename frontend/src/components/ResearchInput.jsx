import React, { useState, useCallback, useEffect } from "react";
import { FiSend } from "react-icons/fi";

export default function ResearchInput({
  onSubmit,
  disabled,
  storageKey = "research-query",
}) {
  const [query, setQuery] = useState(() => {
    return sessionStorage.getItem(storageKey) || "";
  });

  // Persist the query text to sessionStorage on every change
  useEffect(() => {
    sessionStorage.setItem(storageKey, query);
  }, [query, storageKey]);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const trimmed = query.trim();
      if (!trimmed || disabled) return;
      onSubmit(trimmed);
      setQuery("");
    },
    [query, disabled, onSubmit],
  );

  return (
    <form onSubmit={handleSubmit} className="research-input-box">
      <input
        id="research-query-input"
        className="input"
        type="text"
        placeholder="Ask anything — e.g. 'What are the latest advances in quantum computing?'"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        disabled={disabled}
      />
      <button
        id="research-submit-btn"
        type="submit"
        className="btn btn-primary"
        disabled={!query.trim() || disabled}
      >
        <FiSend /> Research
      </button>
    </form>
  );
}
