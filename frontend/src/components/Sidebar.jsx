import React from "react";
import { NavLink } from "react-router-dom";
import { FiHome, FiSearch, FiFileText, FiSettings } from "react-icons/fi";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon">O</div>
          <div>
            <h1>Orion AI</h1>
            <span className="version">Research Assistant v1.0</span>
          </div>
        </div>
      </div>
      <nav className="sidebar-nav">
        <NavLink
          to="/"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          end
        >
          <span className="nav-icon">
            <FiHome />
          </span>
          Home
        </NavLink>
        <NavLink
          to="/workspace"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        >
          <span className="nav-icon">
            <FiSearch />
          </span>
          Research Workspace
        </NavLink>
        <NavLink
          to="/reports"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        >
          <span className="nav-icon">
            <FiFileText />
          </span>
          Reports
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        >
          <span className="nav-icon">
            <FiSettings />
          </span>
          Settings
        </NavLink>
      </nav>
    </aside>
  );
}
