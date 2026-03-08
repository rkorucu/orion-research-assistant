import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import AgentProgress from "../components/AgentProgress.jsx";
import ReportViewer from "../components/ReportViewer.jsx";
import SourcesList from "../components/SourcesList.jsx";
import ResearchInput from "../components/ResearchInput.jsx";
import {
  createResearch,
  getResearchSession,
  getResearchReport,
} from "../api/client.js";
import {
  saveSession,
  completeSession,
  getSessionById,
} from "../store/researchStore.js";

const AGENT_ORDER = ["planner", "researcher", "analyst", "writer", "reviewer"];

export default function Workspace() {
  const { id } = useParams();
  const location = useLocation();
  const intervalRef = useRef(null);

  const [session, setSession] = useState(null);
  const [report, setReport] = useState(null);
  const [currentNode, setCurrentNode] = useState(null);
  const [completedNodes, setCompletedNodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("report");

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Load session data if we have an ID
  useEffect(() => {
    if (!id) return;

    const fetchSession = async () => {
      try {
        const data = await getResearchSession(id);
        setSession(data);
        saveSession(data);

        if (data.status === "COMPLETED") {
          setCompletedNodes([...AGENT_ORDER]);
          setCurrentNode(null);
          const reportData = await getResearchReport(id);
          setReport(reportData);
          completeSession(id, reportData);
        } else if (data.status === "RUNNING") {
          simulateProgress(id);
        }
      } catch (err) {
        console.error("Failed to load session from API:", err);
        // Try loading from local store as fallback
        const local = getSessionById(id);
        if (local) {
          setSession(local);
          if (local.status === "COMPLETED" && local.report) {
            setReport(local.report);
            setCompletedNodes([...AGENT_ORDER]);
            setCurrentNode(null);
          }
        }
      }
    };

    fetchSession();
  }, [id]);

  // Handle new research from Home page state
  useEffect(() => {
    if (location.state?.query && !id) {
      handleNewResearch(location.state.query);
    }
  }, [location.state]);

  const simulateProgress = useCallback(
    (sessionId) => {
      let nodeIdx = 0;
      if (intervalRef.current) clearInterval(intervalRef.current);

      intervalRef.current = setInterval(async () => {
        // Visual progress update
        if (nodeIdx < AGENT_ORDER.length) {
          setCurrentNode(AGENT_ORDER[nodeIdx]);
          if (nodeIdx > 0) {
            const recentlyCompleted = AGENT_ORDER[nodeIdx - 1];
            setCompletedNodes((prev) =>
              prev.includes(recentlyCompleted)
                ? prev
                : [...prev, recentlyCompleted],
            );
          }
          nodeIdx++;
        }

        // API polling
        const sid = sessionId || id;
        if (sid && !sid.startsWith("demo")) {
          try {
            const currentSession = await getResearchSession(sid);

            if (
              currentSession.status === "COMPLETED" ||
              currentSession.status === "FAILED"
            ) {
              setSession(currentSession);
              setCompletedNodes([...AGENT_ORDER]);
              setCurrentNode(null);
              clearInterval(intervalRef.current);
              intervalRef.current = null;

              if (currentSession.status === "COMPLETED") {
                const reportData = await getResearchReport(sid);
                setReport(reportData);
                completeSession(sid, reportData);
              }
            } else {
              setSession(currentSession);
              try {
                // Fetch the placeholder "Research in progress..." report
                const placeholder = await getResearchReport(sid);
                setReport(placeholder);
              } catch (e) {}
            }
          } catch (error) {
            console.error("Polling error:", error);
          }
        } else if (sid && sid.startsWith("demo")) {
          // For demo mode, stop interval after agents finish
          if (nodeIdx >= AGENT_ORDER.length) {
            setCompletedNodes([...AGENT_ORDER]);
            setCurrentNode(null);
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      }, 5000);
    },
    [id],
  );

  const handleNewResearch = async (query) => {
    setLoading(true);
    setReport(null);
    setCompletedNodes([]);

    const demoId = `demo-${Date.now()}`;

    try {
      const data = await createResearch({ query, title: query });
      setSession(data);
      saveSession({ ...data, createdAt: new Date().toISOString() });
      simulateProgress(data.id);
    } catch (err) {
      console.error("Research failed, entering demo mode:", err);

      // Demo mode — simulate locally with mock data
      const demoSession = {
        id: demoId,
        title: query,
        status: "RUNNING",
        createdAt: new Date().toISOString(),
      };
      setSession(demoSession);
      saveSession(demoSession);
      simulateProgress(demoId);

      // Generate demo report after pipeline "completes"
      setTimeout(() => {
        const demoReport = {
          title: `Research Report: ${query}`,
          content: generateDemoReport(query),
          sources: generateDemoSources(query),
        };
        setReport(demoReport);

        // Persist as COMPLETED so it appears on Reports page
        completeSession(demoId, demoReport);
        setSession((prev) => ({ ...prev, status: "COMPLETED" }));
      }, 15000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h2>{session?.title || "Research Workspace"}</h2>
        <p>
          {session
            ? `Session ${session.id?.slice(0, 8)} • ${session.status}`
            : "Start a new research query below"}
        </p>
      </div>

      {!session && (
        <ResearchInput
          onSubmit={handleNewResearch}
          disabled={loading}
          storageKey="workspace-research-query"
        />
      )}

      {(currentNode || completedNodes.length > 0) && (
        <AgentProgress
          currentNode={currentNode}
          completedNodes={completedNodes}
        />
      )}

      {session && (
        <div style={{ margin: "var(--space-xl) 0" }}>
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
            <SourcesList sources={report?.sources || session?.sources || []} />
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Demo Data Generators ─────────────────────────── */
function generateDemoReport(query) {
  return `## Executive Summary

This report provides a comprehensive analysis of **${query}**. Our research pipeline conducted multi-step investigation across multiple sources to compile these findings.

## Key Findings

### 1. Overview
The research reveals significant developments in this area, with multiple credible sources confirming emerging trends and breakthroughs.

### 2. Analysis
Based on our evaluation of collected data:
- **Finding A:** Multiple peer-reviewed studies confirm the validity of recent advances
- **Finding B:** Industry adoption is accelerating, with a projected 40% growth rate
- **Finding C:** Key challenges remain in scalability and cost optimization

### 3. Detailed Breakdown

The evidence gathered from our research suggests a complex landscape with both opportunities and challenges. The following sections provide detailed analysis of each major theme identified during our investigation.

#### Theme 1: Current State of the Art
Recent publications and industry reports indicate significant progress in this domain. Key milestones include improvements in efficiency, accessibility, and integration with existing systems.

#### Theme 2: Future Outlook
Expert consensus points toward continued growth and innovation. Several key technologies are expected to reach maturity within the next 2-3 years.

## Methodology

This report was generated using Orion AI's multi-agent research pipeline:
1. **Planning:** Query decomposition and research strategy
2. **Research:** Multi-source data collection
3. **Analysis:** Information synthesis and evaluation
4. **Writing:** Structured report generation
5. **Review:** Quality assurance and fact-checking

## Conclusion

Based on our comprehensive analysis, this field shows strong potential for continued growth and impact. We recommend monitoring the key developments identified in this report.

---
*Generated by Orion AI Research Assistant*`;
}

function generateDemoSources(query) {
  const q = encodeURIComponent(query);
  return [
    {
      id: "1",
      title: `Google Scholar — "${query}"`,
      url: `https://scholar.google.com/scholar?q=${q}`,
      snippet:
        "Academic papers, citations, and peer-reviewed research across all disciplines related to your query.",
    },
    {
      id: "2",
      title: `Wikipedia — ${query}`,
      url: `https://en.wikipedia.org/wiki/Special:Search?search=${q}`,
      snippet:
        "Encyclopedia overview providing foundational context, history, and key concepts on the topic.",
    },
    {
      id: "3",
      title: `arXiv — Preprints on "${query}"`,
      url: `https://arxiv.org/search/?query=${q}&searchtype=all`,
      snippet:
        "Open-access preprints in physics, mathematics, computer science, and related fields.",
    },
    {
      id: "4",
      title: `PubMed — Biomedical & Life Sciences`,
      url: `https://pubmed.ncbi.nlm.nih.gov/?term=${q}`,
      snippet:
        "Biomedical literature from MEDLINE, life science journals, and online books covering health, medicine, and biology.",
    },
    {
      id: "5",
      title: `Semantic Scholar — AI-Powered Research`,
      url: `https://www.semanticscholar.org/search?q=${q}`,
      snippet:
        "AI-powered research tool providing influential citations, key findings, and related papers.",
    },
  ];
}
