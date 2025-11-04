# 🗄️ Supabase Database Setup Guide

Complete guide to set up your Supabase database for LoopTask.

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign in with GitHub
4. Click "New Project"
5. Fill in:
   - **Name**: `looptask`
   - **Database Password**: (generate a strong password and save it!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free tier is fine for development
6. Click "Create new project"
7. Wait 2-3 minutes for project to be ready

## Step 2: Get Your API Keys

Once your project is ready:

1. Go to **Settings** (gear icon) → **API**
2. Copy these values:

```bash
# Project URL
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co

# anon/public key
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# service_role key (keep this secret!)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 3: Update .env.local

Open your `.env.local` file and update these lines:

```bash
# ============================================
# Supabase (REQUIRED for database)
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

Replace with your actual values from Step 2.

## Step 4: Run Database Migration

We have a migration file ready at `supabase/migrations/001_initial_schema.sql`.

### Option A: Using Supabase Dashboard (Easiest)

1. Go to your Supabase project
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
5. Paste into the SQL editor
6. Click **Run** (or press Cmd/Ctrl + Enter)
7. You should see "Success. No rows returned"

### Option B: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

## Step 5: Verify Database Setup

1. Go to **Table Editor** in Supabase dashboard
2. You should see these tables:
   - ✅ `users`
   - ✅ `integrations`
   - ✅ `automations`
   - ✅ `automation_runs`
   - ✅ `activities`
   - ✅ `goals`
   - ✅ `teams`
   - ✅ `team_members`
   - ✅ `webhooks`

3. Click on `users` table - it should be empty (will populate on first login)

## Step 6: Test the Connection

1. Restart your dev server:
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

2. Go to http://localhost:3001
3. Click "Get Started Free"
4. Sign in with GitHub or Google
5. You should be redirected to dashboard

6. Check Supabase dashboard:
   - Go to **Table Editor** → **users**
   - You should see your user record!

## Step 7: View and Edit Data

### Using Supabase Dashboard

1. **Table Editor**: View and edit data in a spreadsheet-like interface
2. **SQL Editor**: Run custom queries
3. **Database**: View schema, relationships, and indexes

### Example Queries

```sql
-- View all users
SELECT * FROM users;

-- View user with integrations
SELECT u.*, i.* 
FROM users u
LEFT JOIN integrations i ON u.id = i.user_id;

-- View automations for a user
SELECT * FROM automations 
WHERE user_id = 'your-user-id';

-- View recent activities
SELECT * FROM activities 
ORDER BY created_at DESC 
LIMIT 10;
```

## Database Schema Overview

### Users Table
```sql
- id (uuid, primary key)
- email (text, unique)
- name (text)
- image (text)
- created_at (timestamp)
- updated_at (timestamp)
```

### Integrations Table
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key → users)
- github_connected (boolean)
- slack_connected (boolean)
- notion_connected (boolean)
- calendar_connected (boolean)
- github_token (text, encrypted)
- slack_token (text, encrypted)
- notion_token (text, encrypted)
- calendar_token (text, encrypted)
```

### Automations Table
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key → users)
- team_id (uuid, foreign key → teams, nullable)
- name (text)
- description (text)
- trigger_type (text)
- trigger_config (jsonb)
- actions (jsonb)
- enabled (boolean)
- last_run_at (timestamp)
- created_at (timestamp)
```

### Activities Table
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key → users)
- type (text) - 'commit', 'pr', 'meeting', etc.
- title (text)
- description (text)
- metadata (jsonb)
- created_at (timestamp)
```

## Troubleshooting

### Error: "User not found"
- Make sure you've run the migration
- Check if Supabase credentials are correct in `.env.local`
- Restart your dev server after updating `.env.local`
- Try signing out and signing in again

### Error: "relation 'users' does not exist"
- You haven't run the migration yet
- Go to SQL Editor and run the migration file

### Error: "Invalid API key"
- Check your `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`
- Make sure there are no extra spaces or quotes
- Copy the key again from Supabase dashboard

### Error: "Failed to fetch automations"
- Check browser console for detailed error
- Verify user exists in `users` table
- Check if `integrations` table has a record for your user

## Security Notes

⚠️ **IMPORTANT**:
- Never commit `.env.local` to git
- Never share your `SUPABASE_SERVICE_ROLE_KEY`
- The service role key bypasses Row Level Security (RLS)
- For production, enable RLS policies on all tables

## Row Level Security (RLS) - Optional for Production

For production, enable RLS:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Create policies (example for users table)
CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid()::text = id::text);
```

## Next Steps

Once your database is set up:

1. ✅ Sign in to create your user record
2. ✅ Create your first automation
3. ✅ Connect GitHub integration
4. ✅ View your activity feed
5. ✅ Check analytics dashboard

## Need Help?

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- Check the `supabase/migrations/001_initial_schema.sql` file for the complete schema

---

**Your database is now ready! 🎉**

Go to http://localhost:3001 and start using LoopTask with real data!
