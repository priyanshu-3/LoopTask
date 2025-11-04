# LoopTask - Deployment Guide 🚀

Complete guide for deploying LoopTask to production.

## Table of Contents

- [Vercel Deployment](#vercel-deployment)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Domain Configuration](#domain-configuration)
- [OAuth Configuration](#oauth-configuration)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

---

## Vercel Deployment

### Prerequisites

- GitHub account
- Vercel account (free tier works)
- All environment variables ready

### Step-by-Step Deployment

#### 1. Push Code to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/looptask.git

# Push to GitHub
git push -u origin main
```

#### 2. Import to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

#### 3. Add Environment Variables

In Vercel project settings, add all variables from `.env`:

```env
# NextAuth
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-production-secret

# OAuth Providers
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Slack (Optional)
SLACK_BOT_TOKEN=your_slack_bot_token
SLACK_CHANNEL_ID=your_channel_id

# Notion (Optional)
NOTION_API_KEY=your_notion_api_key
NOTION_DATABASE_ID=your_database_id
```

#### 4. Deploy

Click "Deploy" and wait for build to complete (usually 2-3 minutes).

---

## Environment Variables

### Production Secrets

Generate secure secrets for production:

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Store securely (use password manager)
```

### Environment-Specific Variables

**Development**:
```env
NEXTAUTH_URL=http://localhost:3000
```

**Production**:
```env
NEXTAUTH_URL=https://looptask.com
```

**Staging**:
```env
NEXTAUTH_URL=https://staging.looptask.com
```

---

## Database Setup

### Supabase Production Configuration

#### 1. Create Production Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create new project
3. Choose region closest to users
4. Select appropriate plan:
   - **Free**: Development/Testing
   - **Pro**: Production (recommended)
   - **Team**: Team collaboration
   - **Enterprise**: Large scale

#### 2. Run Migrations

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
  user_id TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_integrations_user_id ON integrations(user_id);
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_timestamp ON activities(timestamp DESC);
CREATE INDEX idx_summaries_user_id ON summaries(user_id);
CREATE INDEX idx_summaries_created_at ON summaries(created_at DESC);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE summaries ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your needs)
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);
```

#### 3. Backup Strategy

```bash
# Automated daily backups (Supabase Pro+)
# Manual backup
pg_dump -h db.your-project.supabase.co -U postgres -d postgres > backup.sql
```

---

## Domain Configuration

### Custom Domain Setup

#### 1. Add Domain in Vercel

1. Go to Project Settings → Domains
2. Add your domain (e.g., `looptask.com`)
3. Follow DNS configuration instructions

#### 2. DNS Configuration

Add these records to your DNS provider:

```
Type    Name    Value
A       @       76.76.21.21
CNAME   www     cname.vercel-dns.com
```

#### 3. SSL Certificate

- Automatically provisioned by Vercel
- Usually takes 5-10 minutes
- Supports wildcard domains

### Subdomain Setup

For staging environment:

```
Type    Name        Value
CNAME   staging     cname.vercel-dns.com
```

---

## OAuth Configuration

### Update Callback URLs

After deploying, update OAuth callback URLs:

#### GitHub OAuth

1. Go to GitHub OAuth App settings
2. Update Authorization callback URL:
   ```
   https://looptask.com/api/auth/callback/github
   ```

#### Google OAuth

1. Go to Google Cloud Console
2. Update Authorized redirect URIs:
   ```
   https://looptask.com/api/auth/callback/google
   ```

### Multiple Environments

Set up separate OAuth apps for each environment:

- **Development**: `http://localhost:3000/api/auth/callback/github`
- **Staging**: `https://staging.looptask.com/api/auth/callback/github`
- **Production**: `https://looptask.com/api/auth/callback/github`

---

## Monitoring

### Vercel Analytics

Enable in Project Settings:
- **Analytics**: Track page views, performance
- **Speed Insights**: Monitor Core Web Vitals
- **Logs**: View function logs

### Error Tracking

#### Sentry Integration

```bash
npm install @sentry/nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

### Uptime Monitoring

Use services like:
- **UptimeRobot**: Free, 5-minute checks
- **Pingdom**: Advanced monitoring
- **StatusCake**: Global monitoring

### Performance Monitoring

```typescript
// lib/analytics.ts
export function trackPageView(url: string) {
  if (typeof window !== 'undefined') {
    // Google Analytics
    window.gtag('config', 'GA_MEASUREMENT_ID', {
      page_path: url,
    });
  }
}
```

---

## CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/ci.yml`:

```yaml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

## Security Checklist

- [ ] All secrets in environment variables
- [ ] HTTPS enabled
- [ ] CORS configured properly
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF tokens
- [ ] Secure headers configured
- [ ] Dependencies updated
- [ ] Security audit passed

### Security Headers

Add to `next.config.js`:

```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ];
  }
};
```

---

## Troubleshooting

### Common Issues

#### 1. Build Fails

**Error**: `Module not found`
```bash
# Solution: Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run build
```

#### 2. Environment Variables Not Working

**Error**: `undefined` values
```bash
# Solution: Redeploy after adding variables
vercel --prod
```

#### 3. OAuth Redirect Error

**Error**: `redirect_uri_mismatch`
```bash
# Solution: Verify callback URLs match exactly
# Check for trailing slashes
```

#### 4. Database Connection Error

**Error**: `Connection refused`
```bash
# Solution: Check Supabase project status
# Verify connection string
# Check firewall rules
```

### Debug Mode

Enable verbose logging:

```env
DEBUG=true
LOG_LEVEL=debug
```

### Rollback

If deployment fails:

```bash
# Rollback to previous deployment
vercel rollback
```

---

## Performance Optimization

### Image Optimization

```typescript
import Image from 'next/image';

<Image
  src="/hero.png"
  alt="Hero"
  width={800}
  height={400}
  priority
/>
```

### Code Splitting

```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>,
  ssr: false
});
```

### Caching Strategy

```typescript
// API route with caching
export const revalidate = 3600; // 1 hour

export async function GET() {
  const data = await fetchData();
  return Response.json(data);
}
```

---

## Scaling

### Horizontal Scaling

Vercel automatically scales based on traffic.

### Database Scaling

Supabase Pro features:
- Connection pooling
- Read replicas
- Point-in-time recovery

### CDN Configuration

Vercel Edge Network:
- Global CDN
- Edge functions
- Automatic optimization

---

## Cost Optimization

### Vercel Pricing

- **Hobby**: Free (personal projects)
- **Pro**: $20/month (production apps)
- **Enterprise**: Custom (large scale)

### Supabase Pricing

- **Free**: 500MB database, 2GB bandwidth
- **Pro**: $25/month (8GB database, 50GB bandwidth)
- **Team**: $599/month (unlimited)

### OpenAI Costs

- **GPT-4**: $0.03/1K tokens (input), $0.06/1K tokens (output)
- **GPT-4o-mini**: $0.15/1M tokens (cheaper alternative)

**Optimization Tips**:
- Use GPT-4o-mini for summaries
- Cache AI responses
- Implement rate limiting
- Set token limits

---

## Post-Deployment

### 1. Smoke Tests

```bash
# Test authentication
curl https://looptask.com/api/auth/session

# Test API endpoint
curl -X POST https://looptask.com/api/summary \
  -H "Content-Type: application/json" \
  -d '{"username":"test","meetings":[]}'
```

### 2. Monitor Logs

```bash
# View Vercel logs
vercel logs

# Real-time logs
vercel logs --follow
```

### 3. Set Up Alerts

Configure alerts for:
- Error rate > 1%
- Response time > 1s
- Uptime < 99.9%
- Database connections > 80%

---

## Support

Need help with deployment?

- 📧 Email: devops@looptask.com
- 💬 Discord: [Join server](https://discord.gg/looptask)
- 📖 Docs: [docs.looptask.com](https://docs.looptask.com)

---

**Happy Deploying! 🚀**
