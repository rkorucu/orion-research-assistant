# Orion AI

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![Java](https://img.shields.io/badge/Java-17+-orange.svg)](https://adoptium.net/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2+-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![Docker](https://img.shields.io/badge/Docker-Supported-blue.svg)](https://www.docker.com/)
[![LangGraph](https://img.shields.io/badge/LangGraph-Agentic-purple.svg)](https://python.langchain.com/docs/langgraph)

> **Agentic AI Research Assistant Platform**

## 📖 Project Overview

Orion AI is a full-stack AI platform that performs **multi-step research using autonomous AI agents**.

The system allows users to submit complex research questions and receive highly structured, comprehensive reports generated through a multi-stage reasoning pipeline. By combining the robustness of Enterprise Java with the cognitive capabilities of Python-based Agentic frameworks, Orion AI demonstrates modern AI engineering practices, including agent orchestration, tool usage, reasoning pipelines, and scalable system design.

---

## ✨ Core Features

- **Agentic AI Research Workflows:** Autonomous agents that plan, execute, and refine research queries.
- **Multi-Step Reasoning:** A structured cognitive pipeline (Planning → Researching → Analyzing → Writing → Reviewing).
- **Tool-Enabled Agents:** Agents equipped with web search, scraping, file reading, and data extraction capabilities.
- **Structured Research Report Generation:** Produces clean, well-formatted Markdown reports.
- **Source Aggregation & Citation Support:** Automatically tracks, verifies, and cites sources used in the research.
- **Session-Based Research History:** Maintains context and history across different research sessions.
- **Full-Stack Architecture:** A production-ready architecture combining a React SPA, a Spring Boot API gateway, and a Python AI engine.
- **Microservice-Based AI System Design:** Decoupled services communicating via REST, designed for scalability and maintainability.

---

## 🏗 System Architecture

Orion AI follows a microservice architecture to separate the user interface, business logic, and heavy AI workloads.

### Components:

- **Frontend:** React + Vite (Fast, responsive Single Page Application)
- **Backend:** Java Spring Boot REST API (Robust session management, persistence, and API routing)
- **Agent Service:** Python FastAPI + LangGraph (Orchestrates the cognitive workflow of the LLM agents)
- **Database:** PostgreSQL (Stores user sessions, research history, and generated reports)
- **Infrastructure:** Docker + Docker Compose (Containerized for consistent deployment)

### Architecture Diagram

```text
       User
         │
         ▼
  React Frontend
         │
         ▼
Spring Boot Backend  ◄─────► PostgreSQL Database
         │
         ▼
Python Agent Service
         │
         ▼
LangGraph Agent Workflow
         │
         ▼
LLM + Research Tools
```

---

## 🧠 Agent Workflow

The core of Orion AI is its multi-agent pipeline, orchestrated via LangGraph.

1. **Planner Agent:** Breaks down the user's initial query into a structured, step-by-step research plan.
2. **Researcher Agent:** Uses web search and scraping tools to gather raw information based on the plan.
3. **Analyst Agent:** Evaluates the gathered sources for relevance, accuracy, and bias, filtering out noise.
4. **Writer Agent:** Synthesizes the analyzed data into a coherent, structured, and comprehensive report.
5. **Reviewer Agent:** Validates the final output against the original query, ensuring quality, proper citations, and formatting before delivering the final report.

```text
User Query → Planner → Researcher → Analyst → Writer → Reviewer → Final Report
```

---

## 🛠 Tech Stack

| Domain              | Technology                                  |
| :------------------ | :------------------------------------------ |
| **Frontend**        | React, Vite, Tailwind CSS                   |
| **Backend**         | Java 17, Spring Boot 3, Spring Data JPA     |
| **Agent Framework** | Python 3.11+, FastAPI, LangChain, LangGraph |
| **Database**        | PostgreSQL                                  |
| **Infrastructure**  | Docker, Docker Compose                      |
| **Languages**       | JavaScript/JSX, Java, Python, SQL           |

---

## 📂 Repository Structure

The project is structured as a monorepo for easier development and deployment orchestration:

```text
orion-ai/
├── frontend/         # React UI application
├── backend/          # Spring Boot API and business logic layer
├── agent-service/    # Python AI agents and graph orchestration
├── infra/            # Docker configurations and init scripts
├── docs/             # Architecture documentation
└── README.md         # This file
```

---

## 🚀 Installation Guide

Follow these steps to run Orion AI locally on your machine.

### 1. Clone the repository

```bash
git clone https://github.com/rkorucu/orion-research-assistant.git
cd orion-research-assistant
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` in the root directory and provide your necessary API keys (e.g., Groq, OpenAI).

### 3. Start Infrastructure with Docker

Spin up the PostgreSQL database and other shared infrastructure.

```bash
docker-compose up -d
```

### 4. Run the Agent Service (Python)

```bash
cd agent-service
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
fastapi dev app/main.py
```

### 5. Run the Backend (Java)

```bash
cd ../backend
./mvnw spring-boot:run
```

### 6. Run the Frontend (React)

```bash
cd ../frontend
npm install
npm run dev
```

---

## 💡 Usage Example

Once the platform is running, navigate to the frontend (usually `http://localhost:5173`).

### Example Research Query:

> _"Compare LangGraph, CrewAI, and AutoGen for building AI agents."_

### What the system does:

1. The **Backend** receives the query and initializes a new research session, saving it to PostgreSQL.
2. The request is forwarded to the **Agent Service**.
3. The **Planner** creates a strategy: "1. Define each framework. 2. Compare features. 3. Look at use cases."
4. The **Researcher** executes web searches to find the latest documentation and articles on LangGraph, CrewAI, and AutoGen.
5. The **Analyst** filters the search results for the most authoritative facts.
6. The **Writer** drafts a markdown report with comparative tables and insights.
7. The **Reviewer** checks the report and finalizes it.
8. The UI updates in real-time, finally displaying the fully formatted comparative report with source citations!

---

## 🔌 API Reference

### `POST /api/research`

Initiates a new research session.

```json
{
  "query": "Compare LangGraph, CrewAI, and AutoGen for building AI agents."
}
```

### `GET /api/research/{id}`

Returns the current status of the research session (e.g., "PLANNING", "RESEARCHING", "COMPLETED").

### `GET /api/research/{id}/report`

Fetches the fully generated markdown report and the list of cited sources.

---

## 👨‍💻 Development & Contribution

We welcome contributions to make Orion AI even better!

- **Adding New Tools:** You can extend the `agent-service/app/tools/` directory with new tools (e.g., ArXiv search, GitHub repo scraper) and register them with the Researcher Agent.
- **Extending Agents:** Modify the LangGraph workflow in `agent-service/app/graph/workflow.py` to add new agent personas or evaluation steps.
- **Running Tests:** Make sure to run the test suites in both the Python and Java environments before submitting PRs.

---

## 🗺 Future Roadmap

- [ ] **Streaming Research Updates:** Stream intra-agent communication to the UI via WebSockets.
- [ ] **Document Ingestion:** Allow users to upload PDFs for the agents to analyze alongside web data (RAG).
- [ ] **Vector Search Memory:** Implement a vector database (like Pinecone or Qdrant) for long-term agent memory.
- [ ] **Multi-Agent Collaboration:** Enable agents to pause and ask the user for clarification during the pipeline.
- [ ] **Enterprise Authentication:** Integrate OAuth2 and role-based access control.

---

_Built with ❤️ by [Ramazan Korucu](https://github.com/rkorucu)_
