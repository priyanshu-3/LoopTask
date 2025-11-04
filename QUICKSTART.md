# LoopTask - Quick Start Guide ⚡

Get LoopTask running in **5 minutes**!

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- GitHub account (for OAuth)

## 1. Clone & Install (1 minute)

```bash
# Clone the repository
git clone <your-repo-url>
cd looptask

# Install dependencies
npm install
```

## 2. Environment Setup (2 minutes)

```bash
# Copy environment template
cp .env.example .env
```

Edit `.env` and add **minimum required** variables:

```env
# NextAuth (required)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here

# Generate secret:
# openssl rand -base64 32

# GitHub OAuth (required for login)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI (optional - for AI summaries)
OPENAI_API_KEY=your_openai_api_key
```

### Quick OAuth Setup

**GitHub OAuth** (30 seconds):
1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and Secret to `.env`

**Supabase** (1 minute):
1. Go to https://supabase.com
2. Create new project
3. Copy URL and anon key from Settings → API
4. Add to `.env`

## 3. Database Setup (1 minute)

Go to Supabase SQL Editor and run:

```sql
-- Enable UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Integrations table
CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  github_connected BOOLEAN DEFAULT FALSE,
  slack_connected BOOLEAN DEFAULT FALSE,
  notion_connected BOOLEAN DEFAULT FALSE,
  calendar_connected BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activities table
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Summaries table
CREATE TABLE summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 4. Run Development Server (30 seconds)

```bash
npm run dev
```

Open http://localhost:3000 🎉

## 5. Test the App (30 seconds)

1. Click "Sign In" → Sign in with GitHub
2. You'll be redirected to dashboard
3. Click "Generate" on AI Summary card (if OpenAI key is set)

## That's It! 🚀

You now have LoopTask running locally!

---

## Optional: Add More Features

### Slack Integration

```env
SLACK_BOT_TOKEN=xoxb-your-token
SLACK_CHANNEL_ID=C1234567890
```

1. Go to https://api.slack.com/apps
2. Create new app
3. Add `chat:write` permission
4. Install to workspace
5. Copy Bot Token

### Notion Integration

```env
NOTION_API_KEY=secret_your-key
NOTION_DATABASE_ID=your-database-id
```

1. Go to https://www.notion.so/my-integrations
2. Create new integration
3. Share a database with integration
4. Copy API key and database ID

### Google Calendar

```env
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

1. Go to https://console.cloud.google.com
2. Create OAuth credentials
3. Enable Google Calendar API
4. Add callback URL: `http://localhost:3000/api/auth/callback/google`

---

## Troubleshooting

### "Module not found" error
```bash
rm -rf node_modules .next
npm install
```

### OAuth redirect error
- Check callback URLs match exactly
- No trailing slashes
- Use http://localhost:3000 (not 127.0.0.1)

### Database connection error
- Verify Supabase URL and keys
- Check if project is active
- Run SQL migrations

### AI summary not working
- Add OPENAI_API_KEY to .env
- Check if you have credits
- Try using gpt-4o-mini instead of gpt-4

---

## Next Steps

1. ✅ App is running
2. 📖 Read [FEATURES.md](./FEATURES.md) for all features
3. 🚀 Deploy to Vercel (see [DEPLOYMENT.md](./DEPLOYMENT.md))
4. 🎨 Customize branding and colors
5. 📊 Add more integrations

---

## Need Help?

- 📖 Full Setup Guide: [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- 💬 Discord: https://discord.gg/looptask
- 📧 Email: support@looptask.com
- 🐛 Issues: GitHub Issues

---

**Happy Coding! 🎉**
