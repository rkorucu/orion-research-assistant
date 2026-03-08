import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";
import Home from "./pages/Home.jsx";
import Workspace from "./pages/Workspace.jsx";
import Reports from "./pages/Reports.jsx";
import Settings from "./pages/Settings.jsx";

export default function App() {
  return (
    <Router>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/workspace" element={<Workspace />} />
            <Route path="/workspace/:id" element={<Workspace />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
