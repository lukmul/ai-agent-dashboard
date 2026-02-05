-- AI Agent Dashboard - Initial Schema
-- Created: 2026-02-05

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (synced with Clerk/NextAuth)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE,
  email TEXT NOT NULL,
  github_username TEXT,
  github_token TEXT, -- encrypted at application layer
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  github_repo TEXT, -- format: "owner/repo"
  local_path TEXT,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent metrics table (mirrors .claude/metrics/agent-stats.json structure)
CREATE TABLE agent_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  agent_name TEXT NOT NULL,
  total_runs INT DEFAULT 0,
  successful_runs INT DEFAULT 0,
  failed_runs INT DEFAULT 0,
  success_rate FLOAT DEFAULT 0.0,
  avg_duration_seconds FLOAT DEFAULT 0.0,
  last_run TIMESTAMPTZ,
  findings JSONB DEFAULT '{}', -- flexible for agent-specific data
  trend TEXT DEFAULT 'stable' CHECK (trend IN ('improving', 'stable', 'regressing')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, agent_name)
);

-- Memory entries table (mirrors MCP memory structure)
CREATE TABLE memory_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  entity_name TEXT NOT NULL, -- agent name nebo topic
  entity_type TEXT NOT NULL, -- "agent", "decision", "issue", "pattern"
  observation TEXT NOT NULL, -- actual memory content
  metadata JSONB DEFAULT '{}', -- file:line, severity, tags
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_agent_metrics_project_id ON agent_metrics(project_id);
CREATE INDEX idx_agent_metrics_agent_name ON agent_metrics(agent_name);
CREATE INDEX idx_memory_entries_project_id ON memory_entries(project_id);
CREATE INDEX idx_memory_entries_entity_name ON memory_entries(entity_name);
CREATE INDEX idx_memory_entries_entity_type ON memory_entries(entity_type);

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users can only see their own data
CREATE POLICY "Users can view own data" 
  ON users FOR SELECT 
  USING (clerk_id = current_setting('request.jwt.claims')::json->>'sub');

CREATE POLICY "Users can update own data" 
  ON users FOR UPDATE 
  USING (clerk_id = current_setting('request.jwt.claims')::json->>'sub');

-- RLS Policies - Projects
CREATE POLICY "Users can view own projects" 
  ON projects FOR SELECT 
  USING (user_id IN (SELECT id FROM users WHERE clerk_id = current_setting('request.jwt.claims')::json->>'sub'));

CREATE POLICY "Users can create own projects" 
  ON projects FOR INSERT 
  WITH CHECK (user_id IN (SELECT id FROM users WHERE clerk_id = current_setting('request.jwt.claims')::json->>'sub'));

CREATE POLICY "Users can update own projects" 
  ON projects FOR UPDATE 
  USING (user_id IN (SELECT id FROM users WHERE clerk_id = current_setting('request.jwt.claims')::json->>'sub'));

CREATE POLICY "Users can delete own projects" 
  ON projects FOR DELETE 
  USING (user_id IN (SELECT id FROM users WHERE clerk_id = current_setting('request.jwt.claims')::json->>'sub'));

-- RLS Policies - Agent Metrics
CREATE POLICY "Users can view own agent metrics" 
  ON agent_metrics FOR SELECT 
  USING (project_id IN (SELECT id FROM projects WHERE user_id IN (SELECT id FROM users WHERE clerk_id = current_setting('request.jwt.claims')::json->>'sub')));

CREATE POLICY "Service role can manage agent metrics" 
  ON agent_metrics FOR ALL 
  USING (current_setting('request.jwt.claims')::json->>'role' = 'service_role');

-- RLS Policies - Memory Entries
CREATE POLICY "Users can view own memory entries" 
  ON memory_entries FOR SELECT 
  USING (project_id IN (SELECT id FROM projects WHERE user_id IN (SELECT id FROM users WHERE clerk_id = current_setting('request.jwt.claims')::json->>'sub')));

CREATE POLICY "Service role can manage memory entries" 
  ON memory_entries FOR ALL 
  USING (current_setting('request.jwt.claims')::json->>'role' = 'service_role');

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_metrics_updated_at BEFORE UPDATE ON agent_metrics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
