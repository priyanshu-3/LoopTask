# Database Migrations

This directory contains SQL migration files for the DevTrack database schema.

## Migration Files

### 001_initial_schema.sql
Initial database schema with core tables:
- users, teams, team_members
- integrations, activities, summaries
- goals, key_results
- automations, automation_runs
- webhooks, notifications, user_stats

### 002_add_sync_fields.sql
Adds sync tracking fields:
- last_synced_at to integrations table
- Indexes for better query performance
- Unique constraints for activities

### 003_ai_integrations.sql ⭐ NEW
AI-Powered Integrations feature:
- Encrypted token storage for all OAuth providers
- integration_sync_logs table for monitoring
- ai_summaries table for AI-generated insights
- Source tracking for activities (github, notion, slack, calendar)

## How to Apply Migrations

### Method 1: Supabase Dashboard (Recommended)

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the contents of the migration file
6. Paste into the editor
7. Click **Run** (or press Cmd/Ctrl + Enter)

### Method 2: Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Push all migrations
supabase db push
```

### Method 3: Using psql (if you have direct database access)

```bash
# Get your connection string from Supabase Dashboard → Settings → Database
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT].supabase.co:5432/postgres" \
  -f supabase/migrations/003_ai_integrations.sql
```

### Method 4: Using the provided scripts

```bash
# Show migration instructions
./scripts/apply-migration.sh

# Verify migration was applied
node scripts/verify-migration.js
```

## Verification

After applying a migration, verify it was successful:

```bash
node scripts/verify-migration.js
```

This will check:
- ✅ All tables exist
- ✅ All columns exist
- ✅ Indexes are created
- ✅ RLS policies are in place

## Rollback

If you need to rollback a migration, you can:

1. Create a rollback SQL file (e.g., `003_ai_integrations_rollback.sql`)
2. Write DROP statements for new tables/columns
3. Apply using the same methods above

Example rollback for 003:
```sql
-- Drop new tables
DROP TABLE IF EXISTS integration_sync_logs CASCADE;
DROP TABLE IF EXISTS ai_summaries CASCADE;

-- Remove new columns from integrations
ALTER TABLE integrations 
  DROP COLUMN IF EXISTS notion_token_encrypted,
  DROP COLUMN IF EXISTS slack_token_encrypted,
  DROP COLUMN IF EXISTS calendar_token_encrypted;

-- Remove new columns from activities
ALTER TABLE activities
  DROP COLUMN IF EXISTS source,
  DROP COLUMN IF EXISTS external_id,
  DROP COLUMN IF EXISTS external_url;
```

## Migration Status

| Migration | Status | Applied Date |
|-----------|--------|--------------|
| 001_initial_schema.sql | ✅ Applied | - |
| 002_add_sync_fields.sql | ✅ Applied | - |
| 003_ai_integrations.sql | ⏳ Pending | - |

## Troubleshooting

### Error: "relation already exists"
This means the table/column already exists. You can either:
- Skip this error (it's safe)
- Use `IF NOT EXISTS` clauses (already included in 003)

### Error: "permission denied"
Make sure you're using the service role key, not the anon key.

### Error: "connection refused"
Check your Supabase URL and credentials in `.env.local`.

## Best Practices

1. **Always backup** before running migrations in production
2. **Test migrations** in a development environment first
3. **Use transactions** for complex migrations
4. **Document changes** in this README
5. **Version control** all migration files
6. **Never modify** existing migration files after they've been applied

## Support

For issues with migrations:
1. Check the [Supabase Documentation](https://supabase.com/docs)
2. Review the migration file for syntax errors
3. Check Supabase logs in the Dashboard
4. Verify your database connection
