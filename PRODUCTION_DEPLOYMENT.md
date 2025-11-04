# Production Deployment Guide 🚀

Complete guide for deploying LoopTask to production.

---

## 📋 Pre-Deployment Checklist

### Code Quality
- [ ] All TypeScript errors resolved
- [ ] ESLint warnings fixed
- [ ] Tests passing
- [ ] Code reviewed
- [ ] Documentation updated

### Security
- [ ] Environment variables secured
- [ ] API keys rotated
- [ ] CORS configured
- [ ] Rate limiting enabled
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF tokens implemented

### Performance
- [ ] Images optimized
- [ ] Bundle size optimized
- [ ] Database indexed
- [ ] Caching configured
- [ ] CDN setup
- [ ] Lazy loading implemented

---

## 🗄️ Database Setup

### 1. Create Supabase Project

```bash
# Visit https://supabase.com
# Create new project
# Note your project URL and keys
```

### 2. Run Migrations

```bash
# Using Supabase CLI
supabase db push

# Or manually via SQL Editor
# Copy contents of supabase/migrations/001_initial_schema.sql
# Paste into Supabase SQL Editor
# Execute
```

### 3. Configure RLS Policies

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
-- ... (already in migration file)

-- Test policies
SELECT * FROM users WHERE auth.uid() = id;
```

### 4. Create Indexes

```sql
-- Already included in migration
-- Verify indexes exist
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public';
```

---

## 🔐 Environment Variables

### Production .env

```bash
# NextAuth
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32

# OAuth Providers
GITHUB_CLIENT_ID=your-production-github-id
GITHUB_CLIENT_SECRET=your-production-github-secret
GOOGLE_CLIENT_ID=your-production-google-id
GOOGLE_CLIENT_SECRET=your-production-google-secret

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI
OPENAI_API_KEY=sk-your-production-key

# Slack
SLACK_BOT_TOKEN=xoxb-your-production-token
SLACK_CHANNEL_ID=your-channel-id

# Notion
NOTION_API_KEY=secret_your-production-key
NOTION_DATABASE_ID=your-database-id

# Google Calendar
GOOGLE_CALENDAR_API_KEY=your-calendar-key

# Optional: Error Tracking
SENTRY_DSN=your-sentry-dsn

# Optional: Analytics
NEXT_PUBLIC_POSTHOG_KEY=your-posthog-key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### Generate Secrets

```bash
# NEXTAUTH_SECRET
openssl rand -base64 32

# Webhook secrets
openssl rand -hex 32
```

---

## 🚀 Vercel Deployment

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Login

```bash
vercel login
```

### 3. Configure Project

```bash
# Initialize
vercel

# Follow prompts:
# - Link to existing project or create new
# - Set project name
# - Configure build settings
```

### 4. Set Environment Variables

```bash
# Via CLI
vercel env add NEXTAUTH_SECRET production
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# ... add all variables

# Or via Vercel Dashboard
# Project Settings → Environment Variables
```

### 5. Deploy

```bash
# Deploy to production
vercel --prod

# Or push to main branch (auto-deploy)
git push origin main
```

### 6. Configure Domain

```bash
# Via Vercel Dashboard
# Project Settings → Domains
# Add custom domain
# Update DNS records
```

---

## 🐳 Docker Deployment

### Dockerfile

```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXTAUTH_URL=https://your-domain.com
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    restart: unless-stopped
    
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped
```

### Build and Run

```bash
# Build image
docker build -t looptask .

# Run container
docker run -p 3000:3000 --env-file .env looptask

# Or use docker-compose
docker-compose up -d
```

---

## ☁️ AWS Deployment

### Using AWS Amplify

```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize
amplify init

# Add hosting
amplify add hosting

# Deploy
amplify publish
```

### Using EC2

```bash
# SSH into EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repository
git clone https://github.com/your-repo/looptask.git
cd looptask

# Install dependencies
npm install

# Build
npm run build

# Install PM2
npm install -g pm2

# Start with PM2
pm2 start npm --name "looptask" -- start
pm2 save
pm2 startup
```

---

## 🔒 SSL/TLS Setup

### Using Let's Encrypt

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal
sudo certbot renew --dry-run
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 📊 Monitoring Setup

### Sentry (Error Tracking)

```bash
npm install @sentry/nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});
```

### PostHog (Analytics)

```bash
npm install posthog-js
```

```typescript
// lib/posthog.ts
import posthog from 'posthog-js';

if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  });
}
```

### Uptime Monitoring

```bash
# Use services like:
# - UptimeRobot (https://uptimerobot.com)
# - Pingdom (https://www.pingdom.com)
# - Better Uptime (https://betteruptime.com)
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
          
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 🧪 Post-Deployment Testing

### Health Check

```bash
# Test API endpoints
curl https://your-domain.com/api/health

# Test authentication
curl https://your-domain.com/api/auth/session

# Test database connection
curl https://your-domain.com/api/automations
```

### Load Testing

```bash
# Using Artillery
artillery quick --count 100 --num 10 https://your-domain.com

# Using Apache Bench
ab -n 1000 -c 10 https://your-domain.com/
```

### Security Scan

```bash
# Using OWASP ZAP
docker run -t owasp/zap2docker-stable zap-baseline.py -t https://your-domain.com

# Using npm audit
npm audit --production
```

---

## 📈 Performance Optimization

### Next.js Optimizations

```typescript
// next.config.js
module.exports = {
  images: {
    domains: ['your-cdn.com'],
    formats: ['image/avif', 'image/webp'],
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  swcMinify: true,
};
```

### Database Optimizations

```sql
-- Add missing indexes
CREATE INDEX CONCURRENTLY idx_activities_user_created 
ON activities(user_id, created_at DESC);

-- Analyze tables
ANALYZE activities;
ANALYZE automations;

-- Vacuum
VACUUM ANALYZE;
```

### CDN Setup

```bash
# Use Vercel Edge Network (automatic)
# Or configure Cloudflare:
# 1. Add site to Cloudflare
# 2. Update nameservers
# 3. Enable caching rules
```

---

## 🔐 Security Hardening

### Headers

```typescript
// next.config.js
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
            key: 'X-XSS-Protection',
            value: '1; mode=block'
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

### Rate Limiting

```typescript
// middleware.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});

export async function middleware(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? 'anonymous';
  const { success } = await ratelimit.limit(ip);
  
  if (!success) {
    return new Response('Too Many Requests', { status: 429 });
  }
}
```

---

## 📱 Mobile Optimization

### PWA Setup

```typescript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
});

module.exports = withPWA({
  // ... other config
});
```

### Manifest

```json
// public/manifest.json
{
  "name": "LoopTask",
  "short_name": "LoopTask",
  "description": "Developer Productivity Platform",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0a0a",
  "theme_color": "#3b82f6",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## 🎯 Launch Checklist

### Pre-Launch
- [ ] All features tested
- [ ] Database migrated
- [ ] Environment variables set
- [ ] SSL certificate installed
- [ ] Monitoring configured
- [ ] Backups enabled
- [ ] Documentation complete

### Launch Day
- [ ] Deploy to production
- [ ] Verify all endpoints
- [ ] Test authentication
- [ ] Check integrations
- [ ] Monitor errors
- [ ] Watch performance
- [ ] Announce launch

### Post-Launch
- [ ] Monitor metrics
- [ ] Collect feedback
- [ ] Fix critical bugs
- [ ] Optimize performance
- [ ] Update documentation
- [ ] Plan next features

---

## 📞 Support

### Monitoring Dashboards
- Vercel: https://vercel.com/dashboard
- Supabase: https://app.supabase.com
- Sentry: https://sentry.io
- PostHog: https://app.posthog.com

### Emergency Contacts
- DevOps: devops@looptask.com
- Security: security@looptask.com
- Support: support@looptask.com

---

**Deployment Status: Ready for Production** ✅

*Last Updated: October 28, 2025*
*Version: 1.0*
