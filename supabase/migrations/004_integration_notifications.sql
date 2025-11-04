-- Create integration_notifications table for health monitoring alerts
-- Requirements: 7.1, 7.2, 7.4

CREATE TABLE IF NOT EXISTS integration_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  type TEXT NOT NULL, -- 'reauth_required', 'sync_failures', 'token_expired', 'sync_success'
  severity TEXT NOT NULL, -- 'info', 'warning', 'error', 'success'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  action_label TEXT,
  read BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for efficient queries
CREATE INDEX idx_notifications_user_id ON integration_notifications(user_id);
CREATE INDEX idx_notifications_user_read ON integration_notifications(user_id, read);
CREATE INDEX idx_notifications_provider ON integration_notifications(provider);
CREATE INDEX idx_notifications_created_at ON integration_notifications(created_at DESC);

-- Add comment
COMMENT ON TABLE integration_notifications IS 'Stores in-app notifications for integration health issues and alerts';
