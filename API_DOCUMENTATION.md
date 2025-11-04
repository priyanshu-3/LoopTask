# LoopTask API Documentation 📚

Complete API reference for LoopTask.

## Base URL

```
Development: http://localhost:3000
Production: https://looptask.com
```

## Authentication

All API requests require authentication via NextAuth session or API key.

### Session-based (Browser)

```typescript
// Automatic with NextAuth
import { useSession } from 'next-auth/react';

const { data: session } = useSession();
```

### API Key (Server)

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://looptask.com/api/endpoint
```

---

## Endpoints

### 1. Authentication

#### POST `/api/auth/signin`

Sign in with OAuth provider.

**Request:**
```typescript
{
  provider: 'github' | 'google',
  callbackUrl?: string
}
```

**Response:**
```typescript
{
  url: string // Redirect URL
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"provider":"github","callbackUrl":"/dashboard"}'
```

---

#### GET `/api/auth/session`

Get current session.

**Response:**
```typescript
{
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  expires: string;
}
```

**Example:**
```bash
curl http://localhost:3000/api/auth/session
```

---

#### POST `/api/auth/signout`

Sign out current user.

**Response:**
```typescript
{
  url: string // Redirect URL
}
```

---

### 2. AI Summary

#### POST `/api/summary`

Generate AI-powered activity summary.

**Request:**
```typescript
{
  username: string;      // GitHub username
  meetings?: Array<{     // Optional calendar events
    title: string;
    start: string;
    end: string;
  }>;
}
```

**Response:**
```typescript
{
  summary: string;       // AI-generated summary
  stats: {
    commits: number;
    prs: number;
    meetings: number;
  };
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/summary \
  -H "Content-Type: application/json" \
  -d '{
    "username": "ayushkumardev",
    "meetings": [
      {
        "title": "Team Standup",
        "start": "2025-10-28T09:00:00Z",
        "end": "2025-10-28T09:30:00Z"
      }
    ]
  }'
```

**Response Example:**
```json
{
  "summary": "Great progress today! You've made 5 commits across 3 repositories, focusing mainly on authentication improvements and dashboard enhancements. You merged 2 pull requests and have 1 code review pending. Your upcoming meeting at 9 AM is the team standup. Keep up the momentum! 🚀",
  "stats": {
    "commits": 5,
    "prs": 2,
    "meetings": 1
  }
}
```

**Error Responses:**

```typescript
// 400 Bad Request
{
  error: "Username is required"
}

// 500 Internal Server Error
{
  error: "Failed to generate summary"
}
```

---

### 3. User Profile (Coming Soon)

#### GET `/api/user`

Get current user profile.

**Response:**
```typescript
{
  id: string;
  email: string;
  name: string;
  image?: string;
  created_at: string;
  integrations: {
    github: boolean;
    slack: boolean;
    notion: boolean;
    calendar: boolean;
  };
}
```

---

#### PATCH `/api/user`

Update user profile.

**Request:**
```typescript
{
  name?: string;
  image?: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  user: UserProfile;
}
```

---

### 4. Activities (Coming Soon)

#### GET `/api/activities`

Get user activities.

**Query Parameters:**
- `limit` (number): Max results (default: 50)
- `offset` (number): Pagination offset (default: 0)
- `type` (string): Filter by type (commit, pr, meeting)
- `from` (string): Start date (ISO 8601)
- `to` (string): End date (ISO 8601)

**Response:**
```typescript
{
  activities: Array<{
    id: string;
    type: 'commit' | 'pr' | 'meeting' | 'task';
    content: string;
    timestamp: string;
    metadata?: Record<string, any>;
  }>;
  total: number;
  hasMore: boolean;
}
```

**Example:**
```bash
curl "http://localhost:3000/api/activities?limit=10&type=commit"
```

---

#### POST `/api/activities`

Create new activity.

**Request:**
```typescript
{
  type: 'commit' | 'pr' | 'meeting' | 'task';
  content: string;
  metadata?: Record<string, any>;
}
```

**Response:**
```typescript
{
  success: boolean;
  activity: Activity;
}
```

---

### 5. Analytics (Coming Soon)

#### GET `/api/analytics`

Get analytics data.

**Query Parameters:**
- `period` (string): 'day' | 'week' | 'month' | 'year'
- `from` (string): Start date
- `to` (string): End date

**Response:**
```typescript
{
  commits: {
    total: number;
    byDay: Array<{ date: string; count: number }>;
  };
  prs: {
    total: number;
    merged: number;
    open: number;
  };
  productivity: {
    score: number; // 0-100
    trend: 'up' | 'down' | 'stable';
  };
}
```

---

### 6. Integrations

#### GET `/api/integrations`

Get all integration statuses for the current user.

**Response:**
```typescript
{
  integrations: {
    github: {
      connected: boolean;
      lastSync?: string;
      activityCount: number;
    };
    notion: {
      connected: boolean;
      lastSync?: string;
      activityCount: number;
    };
    slack: {
      connected: boolean;
      lastSync?: string;
      activityCount: number;
    };
    calendar: {
      connected: boolean;
      lastSync?: string;
      activityCount: number;
    };
  };
}
```

**Example:**
```bash
curl http://localhost:3000/api/integrations \
  -H "Cookie: next-auth.session-token=..."
```

---

#### GET `/api/integrations/[provider]/connect`

Initiate OAuth flow for a provider.

**Parameters:**
- `provider`: 'github' | 'notion' | 'slack' | 'calendar'

**Response:**
Redirects to provider's OAuth authorization page.

**Example:**
```bash
# Visit in browser
http://localhost:3000/api/integrations/github/connect
```

---

#### GET `/api/integrations/[provider]/callback`

OAuth callback handler (called by provider after authorization).

**Parameters:**
- `provider`: 'github' | 'notion' | 'slack' | 'calendar'

**Query Parameters:**
- `code`: Authorization code from provider
- `state`: CSRF protection token

**Response:**
Redirects to `/dashboard/integrations` with success/error message.

---

#### POST `/api/integrations/[provider]/disconnect`

Disconnect an integration and revoke tokens.

**Parameters:**
- `provider`: 'github' | 'notion' | 'slack' | 'calendar'

**Response:**
```typescript
{
  success: boolean;
  message: string;
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/integrations/github/disconnect \
  -H "Cookie: next-auth.session-token=..."
```

---

#### POST `/api/integrations/[provider]/sync`

Manually trigger sync for a provider.

**Parameters:**
- `provider`: 'github' | 'notion' | 'slack' | 'calendar'

**Response:**
```typescript
{
  success: boolean;
  itemsSynced: number;
  duration: number; // milliseconds
  lastSync: string; // ISO 8601
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/integrations/github/sync \
  -H "Cookie: next-auth.session-token=..."
```

**Rate Limit:** 10 requests per minute per user

---

#### GET `/api/integrations/[provider]/status`

Get sync status and logs for a provider.

**Parameters:**
- `provider`: 'github' | 'notion' | 'slack' | 'calendar'

**Response:**
```typescript
{
  connected: boolean;
  lastSync?: string;
  status: 'idle' | 'syncing' | 'success' | 'error';
  activityCount: number;
  syncLogs: Array<{
    id: string;
    status: 'success' | 'failed' | 'partial';
    itemsSynced: number;
    errorMessage?: string;
    startedAt: string;
    completedAt?: string;
    duration: number;
  }>;
}
```

**Example:**
```bash
curl http://localhost:3000/api/integrations/github/status \
  -H "Cookie: next-auth.session-token=..."
```

---

#### GET `/api/integrations/summary`

Get AI-generated summary of activity across all integrations.

**Query Parameters:**
- `start` (string): Start date (ISO 8601) - default: 24 hours ago
- `end` (string): End date (ISO 8601) - default: now
- `type` (string): 'daily' | 'weekly' | 'monthly' - default: 'daily'

**Response:**
```typescript
{
  summary: string;
  highlights: string[];
  insights: string[];
  recommendations: string[];
  stats: {
    totalCommits: number;
    totalPRs: number;
    totalMeetings: number;
    meetingHours: number;
    focusTime: number;
    collaborationScore: number;
  };
  breakdown: {
    github: { commits: number; prs: number; issues: number };
    notion: { pagesEdited: number };
    slack: { messages: number; channels: number };
    calendar: { meetings: number; hours: number };
  };
  generatedAt: string;
  cached: boolean;
}
```

**Example:**
```bash
curl "http://localhost:3000/api/integrations/summary?type=daily" \
  -H "Cookie: next-auth.session-token=..."
```

**Rate Limit:** 20 requests per minute per user

**Caching:** Summaries are cached for 1 hour

---

#### GET `/api/integrations/analytics`

Get analytics data for all integrations.

**Query Parameters:**
- `period` (string): '7d' | '30d' | 'all' - default: '7d'

**Response:**
```typescript
{
  totalActivities: number;
  byProvider: {
    github: number;
    notion: number;
    slack: number;
    calendar: number;
  };
  byDay: Array<{
    date: string;
    github: number;
    notion: number;
    slack: number;
    calendar: number;
  }>;
  topRepositories?: Array<{
    name: string;
    commits: number;
  }>;
  topChannels?: Array<{
    name: string;
    messages: number;
  }>;
}
```

**Example:**
```bash
curl "http://localhost:3000/api/integrations/analytics?period=30d" \
  -H "Cookie: next-auth.session-token=..."
```

---

#### GET `/api/integrations/notifications`

Get integration notifications (reauth required, sync failures, etc.).

**Query Parameters:**
- `unreadOnly` (boolean): Only return unread notifications - default: false
- `limit` (number): Max results - default: 50

**Response:**
```typescript
{
  notifications: Array<{
    id: string;
    type: 'reauth_required' | 'sync_failed' | 'rate_limited';
    provider: string;
    message: string;
    read: boolean;
    createdAt: string;
  }>;
  unreadCount: number;
}
```

**Example:**
```bash
curl "http://localhost:3000/api/integrations/notifications?unreadOnly=true" \
  -H "Cookie: next-auth.session-token=..."
```

---

#### GET `/api/integrations/notifications/count`

Get count of unread notifications.

**Response:**
```typescript
{
  count: number;
}
```

**Example:**
```bash
curl http://localhost:3000/api/integrations/notifications/count \
  -H "Cookie: next-auth.session-token=..."
```

---

#### PATCH `/api/integrations/notifications/[id]`

Mark notification as read.

**Parameters:**
- `id`: Notification ID

**Response:**
```typescript
{
  success: boolean;
}
```

**Example:**
```bash
curl -X PATCH http://localhost:3000/api/integrations/notifications/123 \
  -H "Cookie: next-auth.session-token=..."
```

---

## Webhooks (Coming Soon)

### GitHub Webhook

Receive GitHub events in real-time.

**Endpoint:** `POST /api/webhooks/github`

**Headers:**
```
X-GitHub-Event: push | pull_request | issues
X-Hub-Signature-256: sha256=...
```

**Payload:**
```typescript
{
  action: string;
  repository: {
    name: string;
    full_name: string;
  };
  // Event-specific data
}
```

---

### Slack Webhook

Receive Slack events.

**Endpoint:** `POST /api/webhooks/slack`

**Payload:**
```typescript
{
  type: 'event_callback';
  event: {
    type: string;
    user: string;
    text: string;
  };
}
```

---

## Rate Limiting

### Limits

- **Free Plan**: 100 requests/hour
- **Pro Plan**: 1,000 requests/hour
- **Team Plan**: 10,000 requests/hour
- **Enterprise**: Unlimited

### Headers

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1635724800
```

### Rate Limit Exceeded

```typescript
// 429 Too Many Requests
{
  error: "Rate limit exceeded",
  retryAfter: 3600 // seconds
}
```

---

## Error Handling

### Error Response Format

```typescript
{
  error: string;           // Error message
  code?: string;           // Error code
  details?: any;           // Additional details
  timestamp: string;       // ISO 8601
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error
- `503` - Service Unavailable

### Common Errors

```typescript
// Authentication Error
{
  error: "Unauthorized",
  code: "AUTH_REQUIRED"
}

// Validation Error
{
  error: "Invalid request",
  code: "VALIDATION_ERROR",
  details: {
    field: "username",
    message: "Username is required"
  }
}

// Not Found
{
  error: "Resource not found",
  code: "NOT_FOUND"
}
```

---

## SDKs

### JavaScript/TypeScript

```typescript
import { LoopTaskClient } from '@looptask/sdk';

const client = new LoopTaskClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://looptask.com'
});

// Generate summary
const summary = await client.summary.generate({
  username: 'ayushkumardev',
  meetings: []
});

// Get activities
const activities = await client.activities.list({
  limit: 10,
  type: 'commit'
});
```

### Python

```python
from looptask import LoopTaskClient

client = LoopTaskClient(api_key='your-api-key')

# Generate summary
summary = client.summary.generate(
    username='ayushkumardev',
    meetings=[]
)

# Get activities
activities = client.activities.list(
    limit=10,
    type='commit'
)
```

### cURL

```bash
# Set API key
export LOOPTASK_API_KEY="your-api-key"

# Generate summary
curl -X POST https://looptask.com/api/summary \
  -H "Authorization: Bearer $LOOPTASK_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"username":"ayushkumardev","meetings":[]}'
```

---

## Pagination

For endpoints that return lists:

**Request:**
```
GET /api/activities?limit=50&offset=0
```

**Response:**
```typescript
{
  data: Array<T>;
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}
```

---

## Filtering

Use query parameters for filtering:

```
GET /api/activities?type=commit&from=2025-10-01&to=2025-10-31
```

---

## Sorting

Use `sort` and `order` parameters:

```
GET /api/activities?sort=timestamp&order=desc
```

---

## Webhooks Setup

### 1. Create Webhook

```bash
curl -X POST https://looptask.com/api/webhooks \
  -H "Authorization: Bearer $API_KEY" \
  -d '{
    "url": "https://your-app.com/webhook",
    "events": ["activity.created", "summary.generated"],
    "secret": "your-webhook-secret"
  }'
```

### 2. Verify Signature

```typescript
import crypto from 'crypto';

function verifyWebhook(payload: string, signature: string, secret: string) {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return signature === `sha256=${digest}`;
}
```

### 3. Handle Events

```typescript
app.post('/webhook', (req, res) => {
  const signature = req.headers['x-looptask-signature'];
  const payload = JSON.stringify(req.body);
  
  if (!verifyWebhook(payload, signature, WEBHOOK_SECRET)) {
    return res.status(401).send('Invalid signature');
  }
  
  const { event, data } = req.body;
  
  switch (event) {
    case 'activity.created':
      // Handle activity
      break;
    case 'summary.generated':
      // Handle summary
      break;
  }
  
  res.status(200).send('OK');
});
```

---

## Best Practices

### 1. Use API Keys Securely

```typescript
// ❌ Bad
const apiKey = 'sk-1234567890';

// ✅ Good
const apiKey = process.env.LOOPTASK_API_KEY;
```

### 2. Handle Errors Gracefully

```typescript
try {
  const summary = await client.summary.generate(data);
} catch (error) {
  if (error.code === 'RATE_LIMIT_EXCEEDED') {
    // Wait and retry
  } else {
    // Log error
  }
}
```

### 3. Cache Responses

```typescript
const cache = new Map();

async function getSummary(username: string) {
  const cacheKey = `summary:${username}`;
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  
  const summary = await client.summary.generate({ username });
  cache.set(cacheKey, summary);
  
  return summary;
}
```

### 4. Use Pagination

```typescript
async function getAllActivities() {
  const activities = [];
  let offset = 0;
  let hasMore = true;
  
  while (hasMore) {
    const response = await client.activities.list({
      limit: 100,
      offset
    });
    
    activities.push(...response.data);
    hasMore = response.pagination.hasMore;
    offset += 100;
  }
  
  return activities;
}
```

---

---

## Integration-Specific Details

### GitHub Integration

**Data Synced:**
- Commits (with message, files changed, additions/deletions)
- Pull Requests (with status, reviews, comments)
- Issues (with labels, assignees, comments)
- Repositories (with languages, stars, forks)

**Sync Frequency:** Every 15 minutes (automatic)

**Rate Limits:**
- GitHub API: 5,000 requests/hour (authenticated)
- LoopTask: 10 manual syncs/minute

**Required Scopes:**
- `repo` - Full repository access
- `read:user` - Read user profile
- `read:org` - Read organization membership

---

### Notion Integration

**Data Synced:**
- Pages (with title, last edited time, content summary)
- Databases (with properties and records)
- Workspace information

**Sync Frequency:** Every 30 minutes (automatic)

**Rate Limits:**
- Notion API: 3 requests/second
- LoopTask: 10 manual syncs/minute

**Required Capabilities:**
- Read content
- Read user information

**Important:** Users must manually share pages with the integration.

---

### Slack Integration

**Data Synced:**
- Message counts (no content for privacy)
- Channel participation metrics
- Reaction counts
- Team information

**Sync Frequency:** Every 30 minutes (automatic)

**Rate Limits:**
- Slack API: Tier-based (typically 1+ req/sec)
- LoopTask: 10 manual syncs/minute

**Required Scopes:**
- `channels:history` - View messages in public channels
- `channels:read` - View basic channel info
- `users:read` - View people in workspace
- `team:read` - View workspace info
- `im:history` - View DM counts
- `reactions:read` - View emoji reactions

**Privacy:** Message content is never stored, only counts and metrics.

---

### Google Calendar Integration

**Data Synced:**
- Events (with title, start/end time, duration, attendee count)
- Calendar list
- Meeting statistics

**Sync Frequency:** Every 30 minutes (automatic)

**Rate Limits:**
- Google Calendar API: 1,000,000 queries/day
- LoopTask: 10 manual syncs/minute

**Required Scopes:**
- `https://www.googleapis.com/auth/calendar.readonly`
- `https://www.googleapis.com/auth/calendar.events.readonly`

**Privacy:** Event descriptions and attendee details are not stored.

---

## Troubleshooting

### Common Integration Errors

#### 1. "Unauthorized" (401)

**Cause:** Session expired or invalid

**Solution:**
```bash
# Sign in again
curl -X POST http://localhost:3000/api/auth/signin \
  -d '{"provider":"github"}'
```

---

#### 2. "Reauthorization Required"

**Cause:** OAuth token expired or revoked

**Solution:**
1. Go to `/dashboard/integrations`
2. Click "Disconnect" on the affected integration
3. Click "Connect" to reauthorize

---

#### 3. "Rate Limit Exceeded" (429)

**Cause:** Too many requests in short time

**Solution:**
- Wait for the time specified in `Retry-After` header
- Reduce sync frequency
- Use cached data when possible

**Example Response:**
```json
{
  "error": "Rate limit exceeded",
  "retryAfter": 60
}
```

---

#### 4. "Sync Failed" - Network Error

**Cause:** Provider API is down or unreachable

**Solution:**
- Check provider status page
- Wait and retry automatically (exponential backoff)
- Check your network connection

---

#### 5. "Invalid Token" - Encryption Error

**Cause:** ENCRYPTION_MASTER_KEY changed or missing

**Solution:**
1. Verify `ENCRYPTION_MASTER_KEY` in environment
2. If key changed, disconnect and reconnect all integrations
3. Tokens encrypted with old key cannot be decrypted

---

#### 6. "Forbidden" (403) - Insufficient Permissions

**Cause:** OAuth scopes missing or revoked

**Solution:**
1. Check required scopes for the provider
2. Disconnect and reconnect with correct scopes
3. For Notion, ensure pages are shared with integration

---

#### 7. "Not Found" (404) - Resource Missing

**Cause:** Integration not connected or deleted

**Solution:**
```bash
# Check integration status
curl http://localhost:3000/api/integrations
```

---

### Debug Mode

Enable detailed logging:

```bash
# Add to .env.local
DEBUG=looptask:integrations:*
LOG_LEVEL=debug
```

Check logs for detailed error information.

---

### Testing Integrations

#### Test OAuth Flow

```bash
# 1. Initiate connection
curl -v http://localhost:3000/api/integrations/github/connect

# 2. Follow redirect to GitHub
# 3. Authorize application
# 4. Verify redirect back to /dashboard/integrations
```

#### Test Sync

```bash
# Trigger manual sync
curl -X POST http://localhost:3000/api/integrations/github/sync \
  -H "Cookie: next-auth.session-token=..." \
  -v

# Check sync status
curl http://localhost:3000/api/integrations/github/status \
  -H "Cookie: next-auth.session-token=..."
```

#### Test AI Summary

```bash
# Generate summary
curl "http://localhost:3000/api/integrations/summary?type=daily" \
  -H "Cookie: next-auth.session-token=..." \
  -v

# Check for cached response
curl "http://localhost:3000/api/integrations/summary?type=daily" \
  -H "Cookie: next-auth.session-token=..." \
  -v
```

---

### Health Check

Check if all integrations are healthy:

```bash
curl http://localhost:3000/api/integrations \
  -H "Cookie: next-auth.session-token=..." | jq
```

Expected response:
```json
{
  "integrations": {
    "github": {
      "connected": true,
      "lastSync": "2025-10-30T10:30:00Z",
      "activityCount": 42
    },
    "notion": {
      "connected": true,
      "lastSync": "2025-10-30T10:25:00Z",
      "activityCount": 15
    }
  }
}
```

---

## Webhook Events

### Integration Events

Subscribe to integration events via webhooks:

**Event Types:**
- `integration.connected` - Integration connected
- `integration.disconnected` - Integration disconnected
- `integration.sync.started` - Sync started
- `integration.sync.completed` - Sync completed
- `integration.sync.failed` - Sync failed
- `integration.reauth_required` - Reauthorization needed

**Payload Example:**
```json
{
  "event": "integration.sync.completed",
  "timestamp": "2025-10-30T10:30:00Z",
  "data": {
    "userId": "user_123",
    "provider": "github",
    "itemsSynced": 25,
    "duration": 3500
  }
}
```

---

## Support

- 📖 Documentation: https://docs.looptask.com
- 📖 Integration Guide: [INTEGRATION_SETUP_GUIDE.md](./INTEGRATION_SETUP_GUIDE.md)
- 💬 Discord: https://discord.gg/looptask
- 📧 Email: api@looptask.com
- 🐛 Issues: https://github.com/looptask/issues

---

**API Version: 1.0**
**Last Updated: October 30, 2025**
