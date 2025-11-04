-- Add sync tracking fields to integrations table

ALTER TABLE integrations
ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP WITH TIME ZONE;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_integrations_last_synced 
ON integrations(user_id, last_synced_at);

-- Add unique constraint for activities to prevent duplicates
ALTER TABLE activities
ADD CONSTRAINT IF NOT EXISTS activities_unique_key 
UNIQUE (user_id, type, created_at);

-- Add index for activities queries
CREATE INDEX IF NOT EXISTS idx_activities_user_type_date 
ON activities(user_id, type, created_at DESC);

-- Add index for activities by date
CREATE INDEX IF NOT EXISTS idx_activities_created_at 
ON activities(created_at DESC);
