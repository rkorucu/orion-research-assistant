import { useState, useEffect } from "react";

const STORAGE_KEY = "orion_settings";

const DEFAULT_SETTINGS = {
  llmProvider: "openai",
  researchDepth: "standard",
  reportFormat: "markdown",
  apiKey: "",
  agentServiceUrl: "http://localhost:8000",
};

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (_) {}
  return DEFAULT_SETTINGS;
}

export default function Settings() {
  const [settings, setSettings] = useState(loadSettings);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Keep agentServiceUrl in sync across the app
  useEffect(() => {
    const stored = loadSettings();
    setSettings(stored);
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
    setSaved(false);
    setError("");
  }

  function handleSave() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      setSaved(true);
      setError("");
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError("Ayarlar kaydedilemedi: " + (err?.message ?? String(err)));
    }
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <h2>Settings</h2>
        <p>Configure your Orion AI research assistant</p>
      </div>

      <div className="settings-section card">
        <h3>AI Configuration</h3>
        <div className="setting-row">
          <div className="setting-info">
            <div className="setting-name">LLM Provider</div>
            <div className="setting-desc">Select the language model for research</div>
          </div>
          <select
            className="input"
            style={{ width: "200px" }}
            name="llmProvider"
            value={settings.llmProvider}
            onChange={handleChange}
          >
            <option value="openai">OpenAI GPT-4</option>
            <option value="anthropic">Anthropic Claude</option>
            <option value="local">Local Model</option>
          </select>
        </div>

        <div className="setting-row">
          <div className="setting-info">
            <div className="setting-name">Research Depth</div>
            <div className="setting-desc">Controls how thorough the research process is</div>
          </div>
          <select
            className="input"
            style={{ width: "200px" }}
            name="researchDepth"
            value={settings.researchDepth}
            onChange={handleChange}
          >
            <option value="quick">Quick (2-3 sources)</option>
            <option value="standard">Standard (5-8 sources)</option>
            <option value="deep">Deep (10+ sources)</option>
          </select>
        </div>

        <div className="setting-row">
          <div className="setting-info">
            <div className="setting-name">Report Format</div>
            <div className="setting-desc">Default format for generated reports</div>
          </div>
          <select
            className="input"
            style={{ width: "200px" }}
            name="reportFormat"
            value={settings.reportFormat}
            onChange={handleChange}
          >
            <option value="markdown">Markdown</option>
            <option value="html">HTML</option>
            <option value="pdf">PDF</option>
          </select>
        </div>
      </div>

      <div className="settings-section card" style={{ marginTop: "var(--space-lg)" }}>
        <h3>Account</h3>
        <div className="setting-row">
          <div className="setting-info">
            <div className="setting-name">API Key</div>
            <div className="setting-desc">Your OpenAI API key for agent operations</div>
          </div>
          <input
            className="input"
            type="password"
            placeholder="sk-..."
            style={{ width: "300px" }}
            name="apiKey"
            value={settings.apiKey}
            onChange={handleChange}
          />
        </div>

        <div className="setting-row">
          <div className="setting-info">
            <div className="setting-name">Agent Service URL</div>
            <div className="setting-desc">URL of the Python agent service</div>
          </div>
          <input
            className="input"
            type="text"
            style={{ width: "300px" }}
            name="agentServiceUrl"
            value={settings.agentServiceUrl}
            onChange={handleChange}
          />
        </div>
      </div>

      <div style={{ marginTop: "var(--space-lg)", display: "flex", alignItems: "center", gap: "var(--space-md)" }}>
        <button className="btn btn-primary btn-lg" onClick={handleSave}>
          Save Settings
        </button>
        {saved && (
          <span style={{ color: "var(--color-success, #22c55e)", fontWeight: 500 }}>
            ✓ Ayarlar kaydedildi
          </span>
        )}
        {error && (
          <span style={{ color: "var(--color-error, #ef4444)", fontWeight: 500 }}>
            {error}
          </span>
        )}
      </div>
    </div>
  );
}
