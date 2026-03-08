import React from "react";
import {
  FiClipboard,
  FiSearch,
  FiBarChart2,
  FiEdit3,
  FiCheckCircle,
} from "react-icons/fi";

const NODES = [
  { key: "planner", label: "Planner", icon: <FiClipboard /> },
  { key: "researcher", label: "Researcher", icon: <FiSearch /> },
  { key: "analyst", label: "Analyst", icon: <FiBarChart2 /> },
  { key: "writer", label: "Writer", icon: <FiEdit3 /> },
  { key: "reviewer", label: "Reviewer", icon: <FiCheckCircle /> },
];

/**
 * Displays the 5-node agent pipeline with active/completed states.
 * @param {Object} props
 * @param {string} props.currentNode - Key of the currently active node
 * @param {string[]} props.completedNodes - Keys of completed nodes
 */
export default function AgentProgress({ currentNode, completedNodes = [] }) {
  return (
    <div className="agent-progress fade-in">
      <div className="progress-pipeline">
        {NODES.map((node, idx) => {
          const isCompleted = completedNodes.includes(node.key);
          const isActive = currentNode === node.key;

          return (
            <React.Fragment key={node.key}>
              {idx > 0 && (
                <div
                  className={`progress-connector ${isCompleted || isActive ? "active" : ""}`}
                />
              )}
              <div
                className={`progress-node ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""}`}
              >
                <div className="node-circle">{node.icon}</div>
                <span className="node-label">{node.label}</span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
