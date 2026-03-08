-- ============================================================
-- Orion AI – Database Schema
-- PostgreSQL 16
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Users ──────────────────────────────────────────────
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    username        VARCHAR(100) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    full_name       VARCHAR(255),
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── Research Sessions ──────────────────────────────────
CREATE TABLE research_sessions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(500) NOT NULL,
    description     TEXT,
    status          VARCHAR(50) DEFAULT 'PENDING',
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── Research Queries ───────────────────────────────────
CREATE TABLE research_queries (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id      UUID REFERENCES research_sessions(id) ON DELETE CASCADE,
    query_text      TEXT NOT NULL,
    query_type      VARCHAR(50) DEFAULT 'GENERAL',
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── Research Reports ───────────────────────────────────
CREATE TABLE research_reports (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id      UUID REFERENCES research_sessions(id) ON DELETE CASCADE,
    title           VARCHAR(500),
    content         TEXT,
    summary         TEXT,
    format          VARCHAR(50) DEFAULT 'MARKDOWN',
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── Research Sources ───────────────────────────────────
CREATE TABLE research_sources (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id      UUID REFERENCES research_sessions(id) ON DELETE CASCADE,
    report_id       UUID REFERENCES research_reports(id) ON DELETE SET NULL,
    url             TEXT,
    title           VARCHAR(500),
    snippet         TEXT,
    relevance_score DECIMAL(3,2),
    source_type     VARCHAR(50) DEFAULT 'WEB',
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── Uploaded Documents ─────────────────────────────────
CREATE TABLE uploaded_documents (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id      UUID REFERENCES research_sessions(id) ON DELETE CASCADE,
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    filename        VARCHAR(500) NOT NULL,
    file_path       VARCHAR(1000) NOT NULL,
    file_size       BIGINT,
    mime_type       VARCHAR(100),
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── Agent Runs ─────────────────────────────────────────
CREATE TABLE agent_runs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id      UUID REFERENCES research_sessions(id) ON DELETE CASCADE,
    agent_type      VARCHAR(100) NOT NULL,
    status          VARCHAR(50) DEFAULT 'RUNNING',
    input_data      JSONB,
    output_data     JSONB,
    error_message   TEXT,
    started_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at    TIMESTAMP WITH TIME ZONE
);

-- ─── Indexes ────────────────────────────────────────────
CREATE INDEX idx_research_sessions_user_id ON research_sessions(user_id);
CREATE INDEX idx_research_sessions_status ON research_sessions(status);
CREATE INDEX idx_research_queries_session_id ON research_queries(session_id);
CREATE INDEX idx_research_reports_session_id ON research_reports(session_id);
CREATE INDEX idx_research_sources_session_id ON research_sources(session_id);
CREATE INDEX idx_agent_runs_session_id ON agent_runs(session_id);
CREATE INDEX idx_agent_runs_status ON agent_runs(status);

-- ─── Seed default user ──────────────────────────────────
INSERT INTO users (email, username, password_hash, full_name)
VALUES (
    'admin@orion.ai',
    'admin',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- password: admin123
    'Orion Admin'
);
