# API Testing Guide 🧪

Complete guide for testing LoopTask API endpoints.

---

## 🚀 Quick Start

### Prerequisites

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Run development server
npm run dev
```

### Authentication

All API endpoints require authentication via NextAuth session.

```typescript
// Login first
await signIn('github'); // or 'google'

// Then make API calls
const response = await fetch('/api/endpoint', {
  credentials: 'include' // Include session cookie
});
```

---

## 📋 API Endpoints

### Automations

#### List Automations
```bash
GET /api/automations
```

**Response:**
```json
{
  "automations": [
    {
      "id": "uuid",
      "name": "Daily Standup",
      "description": "...",
      "trigger_type": "schedule",
      "trigger_config": {...},
      "actions": [...],
      "enabled": true,
      "total_runs": 42,
      "success_count": 40,
      "failure_count": 2,
      "last_run_at": "2025-10-28T10:00:00Z"
    }
  ]
}
```

#### Create Automation
```bash
POST /api/automations
Content-Type: application/json

{
  "name": "Daily Summary",
  "description": "Generate daily summary",
  "trigger_type": "schedule",
  "trigger_config": {
    "schedule": "0 9 * * *"
  },
  "actions": [
    {
      "type": "ai_summary",
      "config": { "days": 1 },
      "order": 1
    },
    {
      "type": "send_slack",
      "config": { "message": "{{summary}}" },
      "order": 2
    }
  ]
}
```

**Response:**
```json
{
  "automation": {
    "id": "uuid",
    "name": "Daily Summary",
    ...
  }
}
```

#### Get Automation
```bash
GET /api/automations/:id
```

#### Update Automation
```bash
PATCH /api/automations/:id
Content-Type: application/json

{
  "enabled": false
}
```

#### Delete Automation
```bash
DELETE /api/automations/:id
```

#### Execute Automation
```bash
POST /api/automations/:id/execute
```

**Response:**
```json
{
  "message": "Automation triggered successfully",
  "run_id": "uuid"
}
```

---

### Activities

#### List Activities
```bash
GET /api/activities?type=commit&limit=50&offset=0
```

**Query Parameters:**
- `type`: Filter by type (commit, pr, review, meeting, deployment)
- `limit`: Number of results (default: 50)
- `offset`: Pagination offset (default: 0)

**Response:**
```json
{
  "activities": [...],
  "total": 150,
  "limit": 50,
  "offset": 0
}
```

#### Create Activity
```bash
POST /api/activities
Content-Type: application/json

{
  "type": "commit",
  "title": "Fix authentication bug",
  "description": "Fixed OAuth callback issue",
  "repository": "looptask/main",
  "url": "https://github.com/...",
  "metadata": {
    "sha": "abc123",
    "branch": "main"
  },
  "status": "success"
}
```

---

### Goals

#### List Goals
```bash
GET /api/goals?team_id=uuid
```

**Response:**
```json
{
  "goals": [
    {
      "id": "uuid",
      "team_id": "uuid",
      "title": "Ship Q4 Features",
      "description": "...",
      "type": "quarterly",
      "status": "on-track",
      "progress": 75,
      "target": 100,
      "unit": "%",
      "deadline": "2025-12-31",
      "key_results": [...]
    }
  ]
}
```

#### Create Goal
```bash
POST /api/goals
Content-Type: application/json

{
  "team_id": "uuid",
  "title": "Improve Code Quality",
  "description": "Increase test coverage",
  "type": "quarterly",
  "target": 80,
  "unit": "%",
  "deadline": "2025-12-31",
  "key_results": [
    { "title": "Achieve 80% test coverage" },
    { "title": "Reduce code duplication" }
  ]
}
```

---

### Webhooks

#### List Webhooks
```bash
GET /api/webhooks
```

#### Create Webhook
```bash
POST /api/webhooks
Content-Type: application/json

{
  "name": "Deployment Webhook",
  "url": "https://api.example.com/webhook",
  "events": ["deployment.created", "deployment.completed"],
  "team_id": "uuid"
}
```

**Response:**
```json
{
  "webhook": {
    "id": "uuid",
    "name": "Deployment Webhook",
    "url": "...",
    "secret": "generated-secret-key",
    "events": [...],
    "enabled": true
  }
}
```

---

### AI Insights

#### Get Insights
```bash
GET /api/insights
```

**Response:**
```json
{
  "insights": {
    "productivity": {
      "score": 87,
      "trend": "up",
      "change": 12,
      "message": "..."
    },
    "burnout": {
      "risk": "low",
      "score": 25,
      "message": "...",
      "recommendations": [...]
    },
    "patterns": [...],
    "suggestions": [...],
    "predictions": {...},
    "aiInsights": [...]
  }
}
```

---

## 🧪 Testing with cURL

### Create Automation
```bash
curl -X POST http://localhost:3000/api/automations \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "name": "Test Workflow",
    "trigger_type": "schedule",
    "trigger_config": {"schedule": "0 9 * * *"},
    "actions": [{"type": "send_slack", "config": {"message": "Test"}, "order": 1}]
  }'
```

### Execute Automation
```bash
curl -X POST http://localhost:3000/api/automations/UUID/execute \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

### Get Insights
```bash
curl http://localhost:3000/api/insights \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

---

## 🧪 Testing with Postman

### Setup

1. Import collection (create from endpoints above)
2. Set environment variables:
   - `base_url`: http://localhost:3000
   - `session_token`: Your NextAuth session token

### Getting Session Token

1. Login via browser
2. Open DevTools → Application → Cookies
3. Copy `next-auth.session-token` value
4. Add to Postman environment

### Example Collection

```json
{
  "info": {
    "name": "LoopTask API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Automations",
      "item": [
        {
          "name": "List Automations",
          "request": {
            "method": "GET",
            "url": "{{base_url}}/api/automations"
          }
        },
        {
          "name": "Create Automation",
          "request": {
            "method": "POST",
            "url": "{{base_url}}/api/automations",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"Test\",\n  \"trigger_type\": \"schedule\",\n  \"trigger_config\": {},\n  \"actions\": []\n}"
            }
          }
        }
      ]
    }
  ]
}
```

---

## 🧪 Testing with Jest

### Setup

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom jest
```

### Example Test

```typescript
// __tests__/api/automations.test.ts
import { createMocks } from 'node-mocks-http';
import handler from '@/app/api/automations/route';

describe('/api/automations', () => {
  it('returns automations list', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toHaveProperty('automations');
  });

  it('creates automation', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        name: 'Test Workflow',
        trigger_type: 'schedule',
        trigger_config: {},
        actions: [],
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(201);
    expect(JSON.parse(res._getData())).toHaveProperty('automation');
  });
});
```

---

## 🔍 Error Handling

### Common Errors

**401 Unauthorized**
```json
{
  "error": "Unauthorized"
}
```
**Solution:** Ensure you're authenticated

**404 Not Found**
```json
{
  "error": "Resource not found"
}
```
**Solution:** Check resource ID

**400 Bad Request**
```json
{
  "error": "Missing required fields"
}
```
**Solution:** Validate request body

**500 Internal Server Error**
```json
{
  "error": "Internal server error"
}
```
**Solution:** Check server logs

---

## 📊 Performance Testing

### Load Testing with Artillery

```yaml
# artillery.yml
config:
  target: "http://localhost:3000"
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "List automations"
    flow:
      - get:
          url: "/api/automations"
          headers:
            Cookie: "next-auth.session-token={{session_token}}"
```

Run:
```bash
artillery run artillery.yml
```

---

## 🐛 Debugging

### Enable Debug Logs

```bash
# .env.local
DEBUG=looptask:*
NODE_ENV=development
```

### Check Logs

```bash
# Server logs
npm run dev

# Database logs
# Check Supabase dashboard

# API logs
# Check browser DevTools → Network
```

---

## ✅ Testing Checklist

### Before Deployment

- [ ] All endpoints return correct status codes
- [ ] Authentication works properly
- [ ] Error handling is comprehensive
- [ ] Database queries are optimized
- [ ] Rate limiting is implemented
- [ ] CORS is configured
- [ ] Environment variables are set
- [ ] Migrations are applied
- [ ] Tests pass
- [ ] Documentation is updated

---

## 📚 Additional Resources

- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Supabase Documentation](https://supabase.com/docs)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [Jest Testing](https://jestjs.io/docs/getting-started)
- [Postman Documentation](https://learning.postman.com/docs)

---

*Last Updated: October 28, 2025*
*Version: 1.0*
