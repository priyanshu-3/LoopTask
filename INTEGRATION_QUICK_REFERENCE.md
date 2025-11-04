# Integration Quick Reference 📋

Quick reference card for LoopTask integrations - keep this handy during development!

## Environment Variables

```bash
# Required
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
GITHUB_CLIENT_ID=<from GitHub OAuth app>
GITHUB_CLIENT_SECRET=<from GitHub OAuth app>
ENCRYPTION_MASTER_KEY=<generate with: openssl rand -base64 32>

# Optional
GOOGLE_CLIENT_ID=<from Google Cloud Console>
GOOGLE_CLIENT_SECRET=<from Google Cloud Console>
NOTION_CLIENT_ID=<from Notion integrations>
NOTION_CLIENT_SECRET=<from Notion integrations>
SLACK_CLIENT_ID=<from Slack API>
SLACK_CLIENT_SECRET=<from Slack API>
OPENAI_API_KEY=<from OpenAI platform>

# Database
NEXT_PUBLIC_SUPABASE_URL=<from Supabase dashboard>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from Supabase dashboard>
SUPABASE_SERVICE_ROLE_KEY=<from Supabase dashboard>
```

## OAuth Redirect URIs

### Development
```
GitHub:
  http://localhost:3000/api/auth/callback/github
  http://localhost:3000/api/integrations/github/callback

Google:
  http://localhost:3000/api/auth/callback/google
  http://localhost:3000/api/integrations/calendar/callback

Notion:
  http://localhost:3000/api/integrations/notion/callback

Slack:
  http://localhost:3000/api/integrations/slack/callback
```

### Production
```
Replace localhost:3000 with your domain:
  https://yourdomain.com/api/...
```

## Required OAuth Scopes

```
GitHub:
  - repo
  - read:user
  - read:org

Google Calendar:
  - https://www.googleapis.com/auth/calendar.readonly
  - https://www.googleapis.com/auth/calendar.events.readonly

Notion:
  - Read content
  - Read user information

Slack:
  - channels:history
  - channels:read
  - users:read
  - team:read
  - im:history
  - reactions:read
```

## API Endpoints

### Integration Management
```bash
# List all integrations
GET /api/integrations

# Connect integration (redirects to OAuth)
GET /api/integrations/[provider]/connect

# OAuth callback (automatic)
GET /api/integrations/[provider]/callback?code=...&state=...

# Disconnect integration
POST /api/integrations/[provider]/disconnect

# Get integration status
GET /api/integrations/[provider]/status

# Manual sync
POST /api/integrations/[provider]/sync
```

### AI & Analytics
```bash
# Generate AI summary
GET /api/integrations/summary?type=daily&start=...&end=...

# Get analytics
GET /api/integrations/analytics?period=7d

# Get notifications
GET /api/integrations/notifications?unreadOnly=true

# Mark notification as read
PATCH /api/integrations/notifications/[id]
```

## Common Commands

```bash
# Generate encryption key
openssl rand -base64 32

# Check environment variables
node -e "console.log('GitHub:', !!process.env.GITHUB_CLIENT_ID)"

# Start dev server
npm run dev

# Test integration endpoint
curl http://localhost:3000/api/integrations

# Trigger manual sync
curl -X POST http://localhost:3000/api/integrations/github/sync

# View logs with debug
DEBUG=looptask:integrations:* npm run dev

# Clear Next.js cache
rm -rf .next && npm run dev
```

## Database Tables

```sql
-- integrations table
- github_token_encrypted
- github_token_expires_at
- notion_token_encrypted
- slack_token_encrypted
- calendar_token_encrypted
- last_github_sync
- last_notion_sync
- last_slack_sync
- last_calendar_sync

-- activities table
- source (github, notion, slack, calendar)
- external_id
- external_url
- type
- content
- timestamp

-- integration_sync_logs table
- provider
- status (success, failed, partial)
- items_synced
- error_message
- duration_ms
- started_at
- completed_at

-- ai_summaries table
- type (daily, weekly, monthly)
- summary
- highlights
- insights
- recommendations
- stats
```

## Sync Frequencies

```
GitHub:     Every 15 minutes (automatic)
Notion:     Every 30 minutes (automatic)
Slack:      Every 30 minutes (automatic)
Calendar:   Every 30 minutes (automatic)

Manual:     10 requests/minute per user (rate limited)
```

## Rate Limits

```
Provider APIs:
  GitHub:    5,000 requests/hour (authenticated)
  Google:    1,000,000 queries/day
  Notion:    3 requests/second
  Slack:     Tier-based (1+ req/sec)

LoopTask APIs:
  Sync:      10 requests/minute per user
  Summary:   20 requests/minute per user
```

## Error Codes

```
401 Unauthorized          - Not logged in
403 Forbidden            - Insufficient permissions
404 Not Found            - Integration not connected
429 Too Many Requests    - Rate limit exceeded
500 Internal Error       - Server error
503 Service Unavailable  - Provider API down
```

## Common Issues & Quick Fixes

```bash
# Issue: Redirect URI mismatch
# Fix: Check OAuth app settings, ensure exact match

# Issue: Invalid client
# Fix: Verify CLIENT_ID and CLIENT_SECRET in .env.local

# Issue: Encryption error
# Fix: Generate new ENCRYPTION_MASTER_KEY

# Issue: Token expired
# Fix: Disconnect and reconnect integration

# Issue: No data syncing
# Fix: Check date range, verify data exists on provider

# Issue: Rate limit
# Fix: Wait for retry-after time, reduce sync frequency
```

## Testing Checklist

```
□ Environment variables set
□ OAuth apps created
□ Redirect URIs configured
□ Database migrations run
□ Server starts without errors
□ Can connect GitHub
□ Can connect Google Calendar
□ Can connect Notion
□ Can connect Slack
□ Manual sync works
□ Activities appear in feed
□ AI summary generates
□ Notifications work
□ Disconnect works
```

## File Locations

```
Integration Clients:
  src/lib/integrations/github-client.ts
  src/lib/integrations/notion-client.ts
  src/lib/integrations/slack-client.ts
  src/lib/integrations/calendar-client.ts

OAuth & Tokens:
  src/lib/integrations/oauth-manager.ts
  src/lib/integrations/token-manager.ts
  src/lib/integrations/encryption.ts

Sync Service:
  src/lib/integrations/sync-service.ts

AI Summary:
  src/lib/integrations/ai-summary-engine.ts

API Routes:
  src/app/api/integrations/[provider]/connect/route.ts
  src/app/api/integrations/[provider]/callback/route.ts
  src/app/api/integrations/[provider]/disconnect/route.ts
  src/app/api/integrations/[provider]/sync/route.ts
  src/app/api/integrations/[provider]/status/route.ts
  src/app/api/integrations/summary/route.ts

UI Components:
  src/app/dashboard/integrations/page.tsx
  src/components/integrations/IntegrationCard.tsx
  src/components/integrations/SyncStatusIndicator.tsx
  src/components/integrations/NotificationBadge.tsx

Database Migrations:
  supabase/migrations/003_ai_integrations.sql
```

## Useful Links

```
Documentation:
  Setup Guide:          ./INTEGRATION_SETUP_GUIDE.md
  Troubleshooting:      ./INTEGRATION_TROUBLESHOOTING.md
  API Docs:             ./API_DOCUMENTATION.md

Provider Docs:
  GitHub OAuth:         https://docs.github.com/en/apps/oauth-apps
  Google OAuth:         https://developers.google.com/identity/protocols/oauth2
  Notion API:           https://developers.notion.com
  Slack API:            https://api.slack.com/authentication/oauth-v2

Provider Status:
  GitHub:               https://www.githubstatus.com
  Google:               https://www.google.com/appsstatus
  Notion:               https://status.notion.so
  Slack:                https://status.slack.com

OAuth App Settings:
  GitHub:               https://github.com/settings/developers
  Google:               https://console.cloud.google.com/apis/credentials
  Notion:               https://www.notion.so/my-integrations
  Slack:                https://api.slack.com/apps
  OpenAI:               https://platform.openai.com/api-keys
```

## Security Checklist

```
□ ENCRYPTION_MASTER_KEY is 32 bytes
□ Never commit .env.local to git
□ Use different keys for dev/prod
□ HTTPS only in production
□ CSRF protection enabled (state parameter)
□ Rate limiting configured
□ Tokens encrypted in database
□ No tokens in logs
□ Minimal OAuth scopes requested
□ Regular security audits
```

## Performance Tips

```
- Cache AI summaries (1 hour TTL)
- Use database indexes on user_id, source, timestamp
- Paginate large datasets
- Implement exponential backoff for retries
- Use conditional requests (ETags) when possible
- Batch database operations
- Monitor memory usage
- Set up connection pooling
```

## Monitoring

```bash
# Check sync health
curl http://localhost:3000/api/integrations | jq '.integrations'

# View recent sync logs
curl http://localhost:3000/api/integrations/github/status | jq '.syncLogs'

# Check notification count
curl http://localhost:3000/api/integrations/notifications/count

# Monitor rate limits
# Check response headers: X-RateLimit-Remaining

# View error logs
npm run dev 2>&1 | grep -i error

# Database query performance
# Use EXPLAIN ANALYZE in Supabase SQL editor
```

---

**Print this page and keep it at your desk!** 📌

**Last Updated:** October 30, 2025  
**Version:** 1.0.0
