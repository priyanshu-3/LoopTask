-- LoopTask Database Schema
-- Version: 1.0
-- Description: Initial database setup for LoopTask SaaS platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  image TEXT,
  bio TEXT,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teams/Workspaces table
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan VARCHAR(50) DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team members junction table
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member', -- owner, admin, member
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Integrations table
CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  github_connected BOOLEAN DEFAULT FALSE,
  github_token TEXT,
  github_username VARCHAR(255),
  slack_connected BOOLEAN DEFAULT FALSE,
  slack_token TEXT,
  slack_channel_id VARCHAR(255),
  notion_connected BOOLEAN DEFAULT FALSE,
  notion_token TEXT,
  notion_database_id VARCHAR(255),
  calendar_connected BOOLEAN DEFAULT FALSE,
  calendar_token TEXT,
  calendar_refresh_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Activities table
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  type VARCHAR(50) NOT NULL, -- commit, pr, review, meeting, deployment
  title VARCHAR(500) NOT NULL,
  description TEXT,
  repository VARCHAR(255),
  url TEXT,
  metadata JSONB,
  status VARCHAR(50) DEFAULT 'success', -- success, pending, failed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Summaries table
CREATE TABLE summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  summary TEXT NOT NULL,
  highlights JSONB,
  stats JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Goals/OKRs table
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  type VARCHAR(50) DEFAULT 'quarterly', -- quarterly, monthly, ongoing
  status VARCHAR(50) DEFAULT 'active', -- active, on-track, at-risk, off-track, completed
  progress INTEGER DEFAULT 0,
  target INTEGER DEFAULT 100,
  unit VARCHAR(50) DEFAULT '%',
  deadline DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Key Results table
CREATE TABLE key_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  progress INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'in-progress', -- in-progress, completed, blocked
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Automations/Workflows table
CREATE TABLE automations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  trigger_type VARCHAR(100) NOT NULL, -- schedule, github_event, slack_message, webhook
  trigger_config JSONB NOT NULL,
  actions JSONB NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  last_run_at TIMESTAMP WITH TIME ZONE,
  total_runs INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Automation runs/logs table
CREATE TABLE automation_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  automation_id UUID REFERENCES automations(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL, -- success, failed, running
  trigger_data JSONB,
  result JSONB,
  error TEXT,
  duration_ms INTEGER,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Webhooks table
CREATE TABLE webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  secret VARCHAR(255),
  events TEXT[] NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  data JSONB,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User stats table (for leaderboard)
CREATE TABLE user_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  commits INTEGER DEFAULT 0,
  prs INTEGER DEFAULT 0,
  reviews INTEGER DEFAULT 0,
  meetings INTEGER DEFAULT 0,
  lines_added INTEGER DEFAULT 0,
  lines_deleted INTEGER DEFAULT 0,
  productivity_score INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, team_id, date)
);

-- Create indexes for better performance
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_team_id ON activities(team_id);
CREATE INDEX idx_activities_created_at ON activities(created_at DESC);
CREATE INDEX idx_activities_type ON activities(type);

CREATE INDEX idx_summaries_user_id ON summaries(user_id);
CREATE INDEX idx_summaries_date ON summaries(date DESC);

CREATE INDEX idx_goals_team_id ON goals(team_id);
CREATE INDEX idx_goals_status ON goals(status);

CREATE INDEX idx_automations_user_id ON automations(user_id);
CREATE INDEX idx_automations_enabled ON automations(enabled);

CREATE INDEX idx_automation_runs_automation_id ON automation_runs(automation_id);
CREATE INDEX idx_automation_runs_started_at ON automation_runs(started_at DESC);

CREATE INDEX idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX idx_user_stats_team_id ON user_stats(team_id);
CREATE INDEX idx_user_stats_date ON user_stats(date DESC);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_key_results_updated_at BEFORE UPDATE ON key_results
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_automations_updated_at BEFORE UPDATE ON automations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE key_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

-- Team members can view team data
CREATE POLICY "Team members can view team" ON teams
  FOR SELECT USING (
    id IN (SELECT team_id FROM team_members WHERE user_id::text = auth.uid()::text)
  );

-- Users can view their own integrations
CREATE POLICY "Users can view own integrations" ON integrations
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Users can manage their own integrations
CREATE POLICY "Users can update own integrations" ON integrations
  FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Team members can view team activities
CREATE POLICY "Team members can view activities" ON activities
  FOR SELECT USING (
    user_id::text = auth.uid()::text OR
    team_id IN (SELECT team_id FROM team_members WHERE user_id::text = auth.uid()::text)
  );

-- Similar policies for other tables...
-- (Add more RLS policies as needed for production)

COMMENT ON TABLE users IS 'User accounts and profiles';
COMMENT ON TABLE teams IS 'Team workspaces';
COMMENT ON TABLE team_members IS 'Team membership and roles';
COMMENT ON TABLE integrations IS 'Third-party service integrations';
COMMENT ON TABLE activities IS 'User and team activities from various sources';
COMMENT ON TABLE summaries IS 'AI-generated daily summaries';
COMMENT ON TABLE goals IS 'Team goals and objectives (OKRs)';
COMMENT ON TABLE key_results IS 'Measurable key results for goals';
COMMENT ON TABLE automations IS 'Workflow automations and triggers';
COMMENT ON TABLE automation_runs IS 'Automation execution logs';
COMMENT ON TABLE webhooks IS 'Webhook configurations';
COMMENT ON TABLE notifications IS 'User notifications';
COMMENT ON TABLE user_stats IS 'Daily user statistics for leaderboard';
