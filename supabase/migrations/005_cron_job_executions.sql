-- Migration: Add cron job executions tracking table
-- This table tracks all cron job executions for monitoring and alerting
-- Requirements: 7.5

-- Create cron_job_executions table
CREATE TABLE IF NOT EXISTS cron_job_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_name TEXT NOT NULL,
  started_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP,
  status TEXT NOT NULL CHECK (status IN ('running', 'success', 'failed')),
  users_processed INTEGER DEFAULT 0,
  providers_synced INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  error_message TEXT,
  duration_ms INTEGER,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX idx_cron_executions_job_name ON cron_job_executions(job_name);
CREATE INDEX idx_cron_executions_status ON cron_job_executions(status);
CREATE INDEX idx_cron_executions_started_at ON cron_job_executions(started_at DESC);
CREATE INDEX idx_cron_executions_created_at ON cron_job_executions(created_at DESC);

-- Add comment
COMMENT ON TABLE cron_job_executions IS 'Tracks execution of scheduled cron jobs for monitoring and alerting';
