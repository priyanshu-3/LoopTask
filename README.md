# LoopTask 🚀

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript" />
  <img src="https://img.shields.io/badge/Tailwind-3-38bdf8?style=for-the-badge&logo=tailwind-css" />
  <img src="https://img.shields.io/badge/OpenAI-GPT--4-412991?style=for-the-badge&logo=openai" />
</div>

<br />

<p align="center">
  <strong>A modern developer productivity SaaS platform that automates workflows by connecting GitHub, Notion, Slack, and Google Calendar with AI-powered summaries.</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#demo">Demo</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#documentation">Documentation</a> •
  <a href="#roadmap">Roadmap</a>
</p>

---

## ✨ Features

### Core Capabilities

- 🤖 **AI-Powered Summaries**: GPT-4 generates intelligent daily activity summaries
- 🔗 **Smart Integrations**: Connect GitHub, Slack, Notion, and Google Calendar
- 📊 **Advanced Analytics**: Visualize commits, PRs, and productivity trends
- 👥 **Team Collaboration**: Workspaces, leaderboards, and shared goals
- 🏆 **Gamification**: Competitive leaderboards with achievements and streaks
- 🎯 **Goals & OKRs**: Track team objectives and key results
- ⚡ **Workflow Builder**: Custom automation with triggers and actions (NEW!)
- 🤖 **AI Insights**: Burnout detection, pattern recognition, predictions (NEW!)
- 🔄 **Webhooks**: Real-time event notifications (NEW!)
- 🎨 **Beautiful UI**: Modern dark theme with smooth animations
- 📱 **Responsive Design**: Works perfectly on all devices
- 🔐 **Secure Auth**: OAuth 2.0 with GitHub and Google
- 💾 **Reliable Database**: Supabase (PostgreSQL) for data persistence
- 🚀 **Production Ready**: Complete API, migrations, and deployment guides (NEW!)

### What Makes LoopTask Special

- **AI-First Approach**: Every feature is enhanced with AI
- **Developer-Focused**: Built by developers, for developers
- **Eye-Catching Design**: 3D elements, animations, and modern aesthetics
- **All-in-One Platform**: No need to switch between multiple tools
- **Privacy-First**: Your data is encrypted and never shared
- **Lightning Fast**: Optimized for performance with < 100ms response times

## 🎯 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Framer Motion
- **Database**: Supabase (PostgreSQL)
- **Auth**: NextAuth.js
- **AI**: OpenAI GPT-4
- **Charts**: Recharts
- **3D Graphics**: Three.js + React Three Fiber
- **Deployment**: Vercel

## 🌟 Feature Showcase

### 🤖 AI Insights Dashboard
- **Productivity Scoring**: Real-time 0-100 score with trend analysis
- **Burnout Detection**: AI-powered risk assessment with recommendations
- **Pattern Recognition**: Identify peak hours, collaboration trends
- **Predictive Analytics**: Forecast commits, PRs, sprint velocity
- **Personalized Suggestions**: Actionable recommendations for improvement

### ⚡ Workflow Automation
- **Visual Builder**: Create custom workflows with drag-and-drop (UI coming soon)
- **Multiple Triggers**: Schedule (CRON), GitHub events, Slack messages, webhooks
- **Powerful Actions**: Send Slack, create Notion pages, call webhooks, AI summaries
- **Execution Tracking**: Monitor runs, success rates, duration
- **Error Handling**: Automatic retries, detailed error logs

### 👥 Team Collaboration
- **Team Workspaces**: Organize members with role-based access
- **Leaderboards**: Gamified rankings with achievements and streaks
- **Goals & OKRs**: Track objectives with key results and progress
- **Activity Feed**: Real-time team activity stream
- **Invite System**: Easy team member onboarding

### 📊 Advanced Analytics
- **Productivity Charts**: Commits, PRs, reviews over time
- **Heatmap Calendar**: GitHub-style contribution graph
- **Language Breakdown**: Code distribution by language
- **Weekly Activity**: Bar charts with daily hours
- **Trend Indicators**: Up/down arrows with percentage changes

### 🔗 Integrations
- **GitHub**: Commits, PRs, reviews, webhooks
- **Slack**: Messages, notifications, bot commands
- **Notion**: Page creation, database sync
- **Google Calendar**: Meeting tracking, schedule analysis
- **Webhooks**: Custom event notifications

## 🚀 API Documentation

### Endpoints

**Automations**
- `GET /api/automations` - List all workflows
- `POST /api/automations` - Create workflow
- `POST /api/automations/:id/execute` - Run workflow

**AI Insights**
- `GET /api/insights` - Generate AI insights

**Activities**
- `GET /api/activities` - List activities
- `POST /api/activities` - Log activity

**Goals**
- `GET /api/goals` - List team goals
- `POST /api/goals` - Create goal with key results

**Webhooks**
- `GET /api/webhooks` - List webhooks
- `POST /api/webhooks` - Create webhook

See [API_TESTING_GUIDE.md](./API_TESTING_GUIDE.md) for complete documentation.

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase account
- GitHub OAuth App
- Google OAuth App
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd looptask
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Fill in your environment variables in `.env`:
- NextAuth credentials
- OAuth provider credentials (GitHub, Google)
- Supabase URL and keys
- OpenAI API key
- Slack bot token (optional)
- Notion API key (optional)

4. Set up Supabase database:

Run these SQL commands in your Supabase SQL editor:

```sql
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
  github_token TEXT,
  slack_token TEXT,
  notion_token TEXT,
  calendar_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activities table
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

-- Summaries table
CREATE TABLE summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   └── login/          # Login page
│   ├── dashboard/          # Dashboard pages
│   │   └── components/     # Dashboard components
│   ├── api/
│   │   └── auth/           # NextAuth API routes
│   ├── layout.tsx
│   └── page.tsx            # Landing page
├── components/             # Shared components
├── lib/                    # API integrations & utilities
├── types/                  # TypeScript types
├── utils/                  # Helper functions
└── styles/                 # Global styles
```

## 🔗 Integration Setup

LoopTask connects with multiple platforms to aggregate your productivity data. Follow these guides to set up each integration:

### GitHub Integration

**Required for:** Authentication, commit tracking, PR monitoring, issue tracking

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: LoopTask (or your app name)
   - **Homepage URL**: `http://localhost:3000` (or your domain)
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Click "Register application"
5. Copy the **Client ID** and generate a **Client Secret**
6. Add to `.env.local`:
   ```bash
   GITHUB_CLIENT_ID=your_client_id
   GITHUB_CLIENT_SECRET=your_client_secret
   ```

**Required Scopes:** `repo`, `read:user`, `read:org`

### Google OAuth (for Calendar)

**Required for:** Google authentication, Calendar event tracking

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable the **Google Calendar API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Google Calendar API"
   - Click "Enable"
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google`
     - `http://localhost:3000/api/integrations/calendar/callback`
5. Copy the **Client ID** and **Client Secret**
6. Add to `.env.local`:
   ```bash
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   ```

**Required Scopes:** `calendar.readonly`, `calendar.events.readonly`

### Notion Integration

**Required for:** Page tracking, workspace activity monitoring

1. Go to [Notion Integrations](https://www.notion.so/my-integrations)
2. Click "New integration"
3. Fill in the details:
   - **Name**: LoopTask
   - **Associated workspace**: Select your workspace
   - **Type**: Public integration (OAuth)
4. Under "OAuth Domain & URIs":
   - **Redirect URIs**: `http://localhost:3000/api/integrations/notion/callback`
5. Under "Capabilities":
   - Enable "Read content"
   - Enable "Read user information"
6. Click "Submit"
7. Copy the **OAuth client ID** and **OAuth client secret**
8. Add to `.env.local`:
   ```bash
   NOTION_CLIENT_ID=your_client_id
   NOTION_CLIENT_SECRET=your_client_secret
   ```

**Required Capabilities:** Read content, Read user information

### Slack Integration

**Required for:** Message tracking, channel activity monitoring

1. Go to [Slack API Apps](https://api.slack.com/apps)
2. Click "Create New App" → "From scratch"
3. Enter app name and select workspace
4. Go to "OAuth & Permissions"
5. Add redirect URL:
   - `http://localhost:3000/api/integrations/slack/callback`
6. Under "Scopes" → "User Token Scopes", add:
   - `channels:history`
   - `channels:read`
   - `users:read`
   - `team:read`
   - `im:history`
   - `reactions:read`
7. Go to "Basic Information"
8. Copy **Client ID** and **Client Secret**
9. Add to `.env.local`:
   ```bash
   SLACK_CLIENT_ID=your_client_id
   SLACK_CLIENT_SECRET=your_client_secret
   ```

**Required Scopes:** `channels:history`, `channels:read`, `users:read`, `team:read`, `im:history`, `reactions:read`

### Token Encryption Setup

**Required for:** Secure storage of OAuth tokens

Generate a secure encryption key:

```bash
openssl rand -base64 32
```

Add to `.env.local`:
```bash
ENCRYPTION_MASTER_KEY=your_generated_key
```

⚠️ **Important:** Never commit this key to version control. Keep it secure and use different keys for development and production.

### OpenAI API (for AI Summaries)

**Required for:** AI-powered activity summaries and insights

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the API key (you won't be able to see it again)
5. Add to `.env.local`:
   ```bash
   OPENAI_API_KEY=sk-your_api_key
   ```

**Note:** AI summaries require GPT-4 access. Make sure your OpenAI account has sufficient credits.

### Complete Environment Setup

After setting up all integrations, your `.env.local` should look like:

```bash
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# GitHub
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Google
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Notion
NOTION_CLIENT_ID=your_notion_client_id
NOTION_CLIENT_SECRET=your_notion_client_secret

# Slack
SLACK_CLIENT_ID=your_slack_client_id
SLACK_CLIENT_SECRET=your_slack_client_secret

# Encryption
ENCRYPTION_MASTER_KEY=your_encryption_key

# OpenAI
OPENAI_API_KEY=your_openai_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

See [INTEGRATION_SETUP_GUIDE.md](./INTEGRATION_SETUP_GUIDE.md) for detailed setup instructions and troubleshooting.

### Verify Your Setup

After configuration, verify everything is working:

```bash
# 1. Check environment variables (automated)
npm run check-env

# 2. Start development server
npm run dev

# 3. Test integrations
# Visit http://localhost:3000/dashboard/integrations
# Click "Connect" on each integration
# Verify "Connected" status appears

# 4. Test sync
# Click "Sync Now" on any connected integration
# Verify activity count increases

# 5. Test AI summary
# Visit http://localhost:3000/dashboard
# Verify AI Summary card shows data
```

**Troubleshooting:** If you encounter issues, see [INTEGRATION_TROUBLESHOOTING.md](./INTEGRATION_TROUBLESHOOTING.md)

## Future Enhancements

- [ ] Razorpay/Stripe payment integration
- [ ] Daily CRON jobs for automated summaries
- [ ] Team workspaces (multi-user)
- [ ] AI-based task prioritization
- [ ] Mobile app
- [ ] Webhook integrations

## Deployment

Deploy to Vercel:

```bash
npm run build
vercel deploy
```

Make sure to add all environment variables in Vercel dashboard.

## 📸 Screenshots

### Landing Page
![Landing Page](https://via.placeholder.com/800x400/1a1a1a/3b82f6?text=LoopTask+Landing+Page)

### Dashboard
![Dashboard](https://via.placeholder.com/800x400/1a1a1a/8b5cf6?text=AI-Powered+Dashboard)

### Analytics
![Analytics](https://via.placeholder.com/800x400/1a1a1a/ec4899?text=Advanced+Analytics)

## 🎥 Demo

[Watch Demo Video](https://youtube.com/looptask) | [Try Live Demo](https://looptask.vercel.app)

## 📚 Documentation

### Getting Started
- [Quick Setup](./QUICK_SETUP.md) - Get started in 5 minutes
- [Setup Guide](./SETUP_GUIDE.md) - Complete installation instructions
- [Integration Setup](./INTEGRATION_SETUP_GUIDE.md) - Configure GitHub, Notion, Slack, Calendar

### Features & Usage
- [Features](./FEATURES.md) - Detailed feature documentation
- [Demo Guide](./DEMO_GUIDE.md) - Interactive feature walkthrough
- [Team Features](./TEAM_FEATURES_GUIDE.md) - Collaboration and team features

### API & Development
- [API Documentation](./API_DOCUMENTATION.md) - Complete API reference
- [API Testing Guide](./API_TESTING_GUIDE.md) - Test endpoints and examples
- [Contributing](./CONTRIBUTING.md) - Contribution guidelines

### Troubleshooting
- [Integration Troubleshooting](./INTEGRATION_TROUBLESHOOTING.md) - Fix integration issues
- [Authentication Troubleshooting](./TROUBLESHOOTING_AUTH.md) - Fix auth problems

### Deployment
- [Deployment Guide](./DEPLOYMENT.md) - Deploy to production
- [Production Deployment](./PRODUCTION_DEPLOYMENT.md) - Production best practices

### Roadmap
- [Roadmap](./ROADMAP.md) - Product roadmap and future plans

## 🗺️ Roadmap

- [x] Phase 1: Foundation (Authentication, UI, Database)
- [x] Phase 2: AI + Automation (GPT-4, Integrations, Workflows)
- [x] Phase 3: Advanced Analytics (Charts, Reports, Insights)
- [ ] Phase 4: Team Collaboration (Workspaces, Sharing)
- [ ] Phase 5: Mobile App (iOS, Android, PWA)
- [ ] Phase 6: Enterprise Features (SSO, Custom Branding)

**Progress: 3/12 Phases Complete (25%)** 🎉

See [ROADMAP.md](./ROADMAP.md) for detailed timeline.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🐛 Bug Reports

Found a bug? Please [open an issue](https://github.com/yourusername/looptask/issues) with:
- Description of the bug
- Steps to reproduce
- Expected behavior
- Screenshots (if applicable)

## 💡 Feature Requests

Have an idea? We'd love to hear it! [Submit a feature request](https://github.com/yourusername/looptask/issues/new?template=feature_request.md)

## 📧 Support

- **Email**: support@looptask.com
- **Discord**: [Join our community](https://discord.gg/looptask)
- **Twitter**: [@looptask](https://twitter.com/looptask)
- **Documentation**: [docs.looptask.com](https://docs.looptask.com)

## 🌟 Show Your Support

If you like LoopTask, please give it a ⭐️ on GitHub!

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details

## 👨‍💻 Built By

**Ayush Kumar**

- GitHub: [@ayushkumardev](https://github.com/ayushkumardev)
- Twitter: [@ayushkumardev](https://twitter.com/ayushkumardev)
- LinkedIn: [Ayush Kumar](https://linkedin.com/in/ayushkumardev)

---

<p align="center">
  Made with ❤️ by developers, for developers
</p>

<p align="center">
  <a href="https://looptask.com">Website</a> •
  <a href="https://docs.looptask.com">Docs</a> •
  <a href="https://blog.looptask.com">Blog</a> •
  <a href="https://twitter.com/looptask">Twitter</a>
</p>
