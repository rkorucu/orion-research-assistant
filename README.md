# Orion AI – Agentic Research Assistant

A production-quality multi-service AI platform for automated research, analysis, and report generation.

## Architecture

| Service       | Stack                      | Port |
| ------------- | -------------------------- | ---- |
| Frontend      | React + Vite               | 5173 |
| Backend       | Java Spring Boot           | 8080 |
| Agent Service | Python FastAPI + LangGraph | 8000 |
| Database      | PostgreSQL                 | 5432 |

## Quick Start

```bash
# Clone and start all services
docker-compose up --build
```

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8080
- **Agent Service:** http://localhost:8000/docs
- **Database:** localhost:5432

## Project Structure

```
orion-ai/
├── frontend/          # React application
├── backend/           # Spring Boot application
├── agent-service/     # Python FastAPI + LangGraph
├── infra/             # Docker & database configs
├── docs/              # Architecture documentation
└── docker-compose.yml
```

## Research Workflow

```
User Query → Planner → Researcher → Analyst → Writer → Reviewer → Final Report
```

The agent service uses **LangGraph** to orchestrate a 5-node research pipeline:

1. **Planner** – Decomposes the query into a research plan
2. **Researcher** – Gathers sources via web search and URL fetching
3. **Analyst** – Evaluates and synthesizes information
4. **Writer** – Generates a structured markdown report
5. **Reviewer** – Quality checks and suggests improvements

## Development

### Frontend

```bash
cd frontend && npm install && npm run dev
```

### Backend

```bash
cd backend && ./mvnw spring-boot:run
```

### Agent Service

```bash
cd agent-service && pip install -r requirements.txt && uvicorn app.main:app --reload
```

## License

MIT
