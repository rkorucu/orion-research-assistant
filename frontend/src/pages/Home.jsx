import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ResearchInput from "../components/ResearchInput.jsx";
import { createResearch, getResearchSessions } from "../api/client.js";
import { getSessions } from "../store/researchStore.js";

export default function Home() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState(() => {
    // Immediately load from local store so the page is never blank
    return getSessions();
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Try to fetch from API and merge with local store
    getResearchSessions()
      .then((apiData) => {
        const local = getSessions();
        const merged = [...local];
        for (const s of apiData) {
          if (!merged.find((m) => m.id === s.id)) {
            merged.push(s);
          }
        }
        merged.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setSessions(merged);
      })
      .catch(() => {
        // API unavailable — local store is our source of truth
        setSessions(getSessions());
      });
  }, []);

  const handleResearch = async (query) => {
    setLoading(true);
    try {
      const session = await createResearch({ query, title: query });
      navigate(`/workspace/${session.id}`);
    } catch (err) {
      console.error("Failed to start research:", err);
      // Navigate to workspace with query in state as fallback
      navigate("/workspace", { state: { query } });
    } finally {
      setLoading(false);
    }
  };

  const recentSessions = sessions.slice(0, 6);

  return (
    <div className="fade-in">
      {/* Hero Section */}
      <section className="research-hero">
        <h2>
          Research with <span className="gradient-text">Orion AI</span>
        </h2>
        <p>
          Multi-step AI research assistant. Ask a question and let our agentic
          pipeline plan, research, analyze, write, and review a comprehensive
          report.
        </p>
        <ResearchInput
          onSubmit={handleResearch}
          disabled={loading}
          storageKey="home-research-query"
        />
      </section>

      {/* Stats */}
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{sessions.length}</div>
          <div className="stat-label">Total Sessions</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {sessions.filter((s) => s.status === "COMPLETED").length}
          </div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {sessions.filter((s) => s.status === "RUNNING").length}
          </div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">5</div>
          <div className="stat-label">Agent Nodes</div>
        </div>
      </section>

      {/* Recent Sessions */}
      {recentSessions.length > 0 && (
        <section>
          <div className="page-header">
            <h2>Recent Research</h2>
            <p>Continue where you left off</p>
          </div>
          <div className="sessions-grid">
            {recentSessions.map((session) => (
              <div
                key={session.id}
                className="session-card"
                onClick={() => navigate(`/workspace/${session.id}`)}
              >
                <div className="session-title">
                  {session.report?.title || session.title}
                </div>
                <div className="session-meta">
                  <span
                    className={`status-badge ${session.status?.toLowerCase()}`}
                  >
                    {session.status}
                  </span>
                  <span>
                    {new Date(session.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
