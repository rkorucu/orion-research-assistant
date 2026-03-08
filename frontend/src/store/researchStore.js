/**
 * Simple localStorage-based research store.
 * Bridges research created on the Workspace with the Reports and Home pages.
 * When the backend is available, this acts as a client-side cache;
 * when offline / demo mode, it's the primary data source.
 */

const STORE_KEY = "orion-research-store";

function _read() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function _write(sessions) {
  localStorage.setItem(STORE_KEY, JSON.stringify(sessions));
}

/** Return all saved sessions, newest first. */
export function getSessions() {
  return _read().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

/** Return only COMPLETED sessions (for the Reports page). */
export function getCompletedSessions() {
  return getSessions().filter((s) => s.status === "COMPLETED");
}

/** Find a single session by ID. */
export function getSessionById(id) {
  return _read().find((s) => s.id === id) || null;
}

/**
 * Save or update a session in the store.
 * If a session with the same ID exists it is replaced; otherwise it's added.
 */
export function saveSession(session) {
  const sessions = _read();
  const idx = sessions.findIndex((s) => s.id === session.id);
  if (idx >= 0) {
    sessions[idx] = { ...sessions[idx], ...session };
  } else {
    sessions.push(session);
  }
  _write(sessions);
}

/**
 * Mark a session as COMPLETED and attach the report data.
 */
export function completeSession(id, report) {
  const sessions = _read();
  const idx = sessions.findIndex((s) => s.id === id);
  if (idx >= 0) {
    sessions[idx] = {
      ...sessions[idx],
      status: "COMPLETED",
      report,
      completedAt: new Date().toISOString(),
    };
  } else {
    sessions.push({
      id,
      status: "COMPLETED",
      report,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    });
  }
  _write(sessions);
}
