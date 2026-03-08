# Orion AI – Architecture Documentation

## System Overview

Orion AI is a multi-service Personal Research Assistant Platform that uses agentic AI
to perform multi-step research, analysis, and report generation.

## Architecture

### Service Topology

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Network                        │
│                                                          │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ Frontend  │  │   Backend    │  │  Agent Service   │   │
│  │ React     │→ │ Spring Boot  │→ │  FastAPI +       │   │
│  │ :5173     │  │ :8080        │  │  LangGraph :8000 │   │
│  └──────────┘  └──────┬───────┘  └──────────────────┘   │
│                       │                                   │
│                ┌──────▼───────┐                           │
│                │  PostgreSQL  │                           │
│                │  :5432       │                           │
│                └──────────────┘                           │
└─────────────────────────────────────────────────────────┘
```

### Frontend (React + Vite)

- **Port:** 5173
- **Responsibilities:** User interface, research input, progress display, report viewing
- **Key Libraries:** React 18, React Router, Axios

### Backend (Spring Boot)

- **Port:** 8080
- **Responsibilities:** REST API, authentication, session management, database operations
- **Key Libraries:** Spring Boot 3, Spring Data JPA, PostgreSQL Driver

### Agent Service (Python FastAPI + LangGraph)

- **Port:** 8000
- **Responsibilities:** AI reasoning, multi-step research workflow, tool execution
- **Key Libraries:** FastAPI, LangGraph, Pydantic, httpx

### Database (PostgreSQL)

- **Port:** 5432
- **Tables:** users, research_sessions, research_queries, research_reports,
  research_sources, uploaded_documents, agent_runs

## LangGraph Research Workflow

```
User Query
  │
  ▼
┌─────────────┐
│   Planner   │  Creates research plan with sub-questions
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Researcher  │  Gathers sources via web search & URL fetching
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Analyst   │  Evaluates and synthesizes information
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Writer    │  Generates structured markdown report
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Reviewer   │  Quality checks and improvement suggestions
└──────┬──────┘
       │
       ▼
  Final Report
```

## API Endpoints

### Public API (Backend → Frontend)

| Method | Endpoint                  | Description                  |
| ------ | ------------------------- | ---------------------------- |
| POST   | /api/research             | Start new research           |
| GET    | /api/research             | List all research sessions   |
| GET    | /api/research/{id}        | Get research session details |
| GET    | /api/research/{id}/report | Get research report          |
| POST   | /api/files/upload         | Upload document              |

### Internal API (Backend → Agent Service)

| Method | Endpoint               | Description               |
| ------ | ---------------------- | ------------------------- |
| POST   | /api/agent/research    | Trigger research workflow |
| GET    | /api/agent/status/{id} | Check workflow status     |

## Database Schema

See `infra/init.sql` for the full schema definition.
