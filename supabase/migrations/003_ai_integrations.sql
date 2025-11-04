-- AI-Powered Integrations Migration
-- Version: 1.0
-- Description: Add support for encrypted tokens, sync logs, and AI summaries

-- ============================================================================
-- 1. Add encrypted token fields to integrations table
-- ============================================================================

-- Notion integration fields
ALTER TABLE integrations
ADD COLUMN IF NOT EXISTS notion_token_encrypted TEXT,
ADD COLUMN IF NOT EXISTS notion_refresh_token_encrypted TEXT,
ADD COLUMN IF NOT EXISTS notion_token_expires_at TIMESTAMP WITH TIME ZONE;

-- Slack integration fields
ALTER TABLE integrations
ADD COLUMN IF NOT EXISTS slack_token_encrypted TEXT,
ADD COLUMN IF NOT EXISTS slack_refresh_token_encrypted TEXT,
ADD COLUMN IF NOT EXISTS slack_token_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS slack_team_id TEXT;

-- Google Calendar integration fields
ALTER TABLE integrations
ADD COLUMN IF NOT EXISTS calendar_token_encrypted TEXT,
ADD COLUMN IF NOT EXISTS calendar_refresh_token_encrypted TEXT,
ADD COLUMN IF NOT EXISTS calendar_token_expires_at TIMESTAMP WITH TIME ZONE;

-- GitHub encrypted token fields (migrate from plain text)
ALTER TABLE integrations
ADD COLUMN IF NOT EXISTS github_token_encrypted TEXT,
ADD COLUMN IF NOT EXISTS github_refresh_token_encrypted TEXT,
ADD COLUMN IF NOT EXISTS github_token_expires_at TIMESTAMP WITH TIME ZONE;

-- Last sync timestamps for each provider
ALTER TABLE integrations
ADD COLUMN IF NOT EXISTS last_github_sync TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_notion_sync TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_slack_sync TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_calendar_sync TIMESTAMP WITH TIME ZONE;

-- ============================================================================
-- 2. Create integration_sync_logs table
-- ============================================================================

CREATE TABLE IF NOT EXISTS integration_sync_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('github', 'notion', 'slack', 'calendar')),
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'partial')),
  items_synced INTEGER DEFAULT 0,
  error_message TEXT,
  duration_ms INTEGER,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for sync logs
CREATE INDEX IF NOT EXISTS idx_sync_logs_user_provider 
ON integration_sync_logs(user_id, provider);

CREATE INDEX IF NOT EXISTS idx_sync_logs_created_at 
ON integration_sync_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_sync_logs_status 
ON integration_sync_logs(status);

CREATE INDEX IF NOT EXISTS idx_sync_logs_user_status 
ON integration_sync_logs(user_id, status, created_at DESC);

-- Add RLS policy for sync logs
ALTER TABLE integration_sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sync logs" ON integration_sync_logs
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own sync logs" ON integration_sync_logs
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- ============================================================================
-- 3. Create ai_summaries table
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('daily', 'weekly', 'monthly')),
  summary TEXT NOT NULL,
  highlights JSONB DEFAULT '[]'::jsonb,
  insights JSONB DEFAULT '[]'::jsonb,
  recommendations JSONB DEFAULT '[]'::jsonb,
  stats JSONB DEFAULT '{}'::jsonb,
  breakdown JSONB DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date, type)
);

-- Create indexes for AI summaries
CREATE INDEX IF NOT EXISTS idx_summaries_user_date 
ON ai_summaries(user_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_summaries_type 
ON ai_summaries(type);

CREATE INDEX IF NOT EXISTS idx_summaries_user_type_date 
ON ai_summaries(user_id, type, date DESC);

CREATE INDEX IF NOT EXISTS idx_summaries_created_at 
ON ai_summaries(created_at DESC);

-- Add RLS policy for AI summaries
ALTER TABLE ai_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own summaries" ON ai_summaries
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own summaries" ON ai_summaries
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own summaries" ON ai_summaries
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own summaries" ON ai_summaries
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- Add updated_at trigger for ai_summaries
CREATE TRIGGER update_ai_summaries_updated_at BEFORE UPDATE ON ai_summaries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 4. Add source tracking columns to activities table
-- ============================================================================

ALTER TABLE activities
ADD COLUMN IF NOT EXISTS source TEXT CHECK (source IN ('github', 'notion', 'slack', 'calendar', 'manual')),
ADD COLUMN IF NOT EXISTS external_id TEXT,
ADD COLUMN IF NOT EXISTS external_url TEXT;

-- Create indexes for source tracking
CREATE INDEX IF NOT EXISTS idx_activities_source 
ON activities(source) WHERE source IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_activities_external_id 
ON activities(external_id) WHERE external_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_activities_user_source 
ON activities(user_id, source, created_at DESC);

-- Create unique constraint to prevent duplicate external activities
CREATE UNIQUE INDEX IF NOT EXISTS idx_activities_unique_external 
ON activities(user_id, source, external_id) 
WHERE external_id IS NOT NULL;

-- ============================================================================
-- 5. Add comments for documentation
-- ============================================================================

COMMENT ON TABLE integration_sync_logs IS 'Logs of integration sync operations for monitoring and debugging';
COMMENT ON TABLE ai_summaries IS 'AI-generated summaries of user activity across all integrations';

COMMENT ON COLUMN integrations.notion_token_encrypted IS 'AES-256 encrypted Notion OAuth access token';
COMMENT ON COLUMN integrations.slack_token_encrypted IS 'AES-256 encrypted Slack OAuth access token';
COMMENT ON COLUMN integrations.calendar_token_encrypted IS 'AES-256 encrypted Google Calendar OAuth access token';
COMMENT ON COLUMN integrations.github_token_encrypted IS 'AES-256 encrypted GitHub OAuth access token';

COMMENT ON COLUMN activities.source IS 'Source platform of the activity (github, notion, slack, calendar, manual)';
COMMENT ON COLUMN activities.external_id IS 'Unique identifier from the external platform';
COMMENT ON COLUMN activities.external_url IS 'Direct link to the activity on the external platform';

COMMENT ON COLUMN integration_sync_logs.provider IS 'Integration provider that was synced';
COMMENT ON COLUMN integration_sync_logs.status IS 'Outcome of the sync operation';
COMMENT ON COLUMN integration_sync_logs.items_synced IS 'Number of items successfully synced';
COMMENT ON COLUMN integration_sync_logs.duration_ms IS 'Duration of sync operation in milliseconds';

COMMENT ON COLUMN ai_summaries.type IS 'Time period covered by the summary (daily, weekly, monthly)';
COMMENT ON COLUMN ai_summaries.highlights IS 'JSON array of key highlights from the period';
COMMENT ON COLUMN ai_summaries.insights IS 'JSON array of AI-generated insights';
COMMENT ON COLUMN ai_summaries.recommendations IS 'JSON array of actionable recommendations';
COMMENT ON COLUMN ai_summaries.stats IS 'JSON object containing aggregated statistics';
COMMENT ON COLUMN ai_summaries.breakdown IS 'JSON object containing activity count breakdown by platform';
