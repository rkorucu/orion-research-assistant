import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getResearchSessions } from "../api/client.js";
import { getCompletedSessions, getSessions } from "../store/researchStore.js";
import ReportViewer from "../components/ReportViewer.jsx";
import SourcesList from "../components/SourcesList.jsx";

export default function Reports() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [activeTab, setActiveTab] = useState("report");

  useEffect(() => {
    // First, load from local store immediately (includes demo sessions)
    const localSessions = getCompletedSessions();
    if (localSessions.length > 0) {
      setSessions(localSessions);
      setLoading(false);
    }

    // Then try to merge with API data
    getResearchSessions()
      .then((apiData) => {
        const completed = apiData.filter((s) => s.status === "COMPLETED");
        // Merge: local store + API, deduplicate by id
        const merged = [...localSessions];
        for (const s of completed) {
          if (!merged.find((m) => m.id === s.id)) {
            merged.push(s);
          }
        }
        merged.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setSessions(merged);
      })
      .catch(() => {
        // API unavailable — local store is our source of truth
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSelectSession = (session) => {
    setSelectedSession(session);
    setActiveTab("report");
  };

  const handleBack = () => {
    setSelectedSession(null);
  };

  // ── Detail view for a selected report ──
  if (selectedSession) {
    const report = selectedSession.report;
    return (
      <div className="fade-in">
        <div className="page-header">
          <button className="btn btn-secondary" onClick={handleBack}>
            ← Back to Reports
          </button>
          <h2 style={{ marginTop: "var(--space-md)" }}>
            {report?.title || selectedSession.title}
          </h2>
          <p>
            Completed{" "}
            {selectedSession.completedAt
              ? new Date(selectedSession.completedAt).toLocaleString()
              : new Date(selectedSession.createdAt).toLocaleString()}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "var(--space-sm)",
            marginBottom: "var(--space-lg)",
          }}
        >
          <button
            className={`btn ${activeTab === "report" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setActiveTab("report")}
          >
            Report
          </button>
          <button
            className={`btn ${activeTab === "sources" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setActiveTab("sources")}
          >
            Sources
          </button>
        </div>

        {activeTab === "report" && (
          <ReportViewer content={report?.content} title={report?.title} />
        )}

        {activeTab === "sources" && (
          <SourcesList sources={report?.sources || []} />
        )}
      </div>
    );
  }

  // ── List view ──
  return (
    <div className="fade-in">
      <div className="page-header">
        <h2>Research Reports</h2>
        <p>View and export your completed research reports</p>
      </div>

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner" />
        </div>
      ) : sessions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3>No Reports Yet</h3>
          <p>
            Start a research from the Home page. Once it completes, your report
            will appear here.
          </p>
          <button
            className="btn btn-primary"
            style={{ marginTop: "var(--space-md)" }}
            onClick={() => navigate("/")}
          >
            Start Research
          </button>
        </div>
      ) : (
        <div className="sessions-grid">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="session-card"
              onClick={() => handleSelectSession(session)}
            >
              <div className="session-title">
                {session.report?.title || session.title}
              </div>
              <div className="session-meta">
                <span className="status-badge completed">Completed</span>
                <span>{new Date(session.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
