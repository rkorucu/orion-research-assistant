import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "";

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Research Sessions ────────────────────────────────
export const createResearch = (data) =>
  api.post("/research", data).then((r) => r.data);

export const getResearchSessions = () =>
  api.get("/research").then((r) => r.data);

export const getResearchSession = (id) =>
  api.get(`/research/${id}`).then((r) => r.data);

export const getResearchReport = (id) =>
  api.get(`/research/${id}/report`).then((r) => r.data);

// ─── File Upload ──────────────────────────────────────
export const uploadFile = (file, sessionId) => {
  const formData = new FormData();
  formData.append("file", file);
  if (sessionId) formData.append("sessionId", sessionId);
  return api
    .post("/files/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((r) => r.data);
};

export default api;
