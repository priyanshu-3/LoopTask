# Cron Jobs Guide

This guide explains how to set up and monitor scheduled background sync for integrations.

## Overview

The platform uses Vercel Cron Jobs to automatically sync integration data for all users with active connections. This ensures that data from GitHub, Notion, Slack, and Google Calendar is always up-to-date without requiring manual syncs.

## Sync Intervals

- **GitHub**: Every 15 minutes
- **Notion**: Every 30 minutes
- **Slack**: Every 30 minutes
- **Google Calendar**: Every 30 minutes

## Setup

### 1. Database Migration

First, apply the database migration to create the `cron_job_executions` table:

```bash
# Run the migration
psql $DATABASE_URL -f supabase/migrations/005_cron_job_executions.sql
```

Or use the Supabase dashboard to run the migration SQL.

### 2. Environment Variables

Add the `CRON_SECRET` to your environment variables:

```bash
# Generate a secure random secret
openssl rand -base64 32

# Add to .env.local
CRON_SECRET=your-generated-secret
```

In production (Vercel), add this as an environment variable in your project settings.

### 3. Vercel Cron Configuration

The `vercel.json` file is already configured with two cron jobs:

```json
{
  "crons": [
    {
      "path": "/api/cron/sync-integrations?interval=15min",
      "schedule": "*/15 * * * *"
    },
    {
      "path": "/api/cron/sync-integrations?interval=30min",
      "schedule": "*/30 * * * *"
    }
  ]
}
```

When you deploy to Vercel, these cron jobs will be automatically configured.

### 4. Deploy to Vercel

```bash
# Deploy to production
vercel --prod
```

The cron jobs will start running automatically after deployment.

## API Endpoints

### Sync Integrations (Cron Job)

**POST** `/api/cron/sync-integrations`

Triggered by Vercel Cron Jobs to sync all users' integrations.

**Query Parameters:**
- `interval` - Sync interval (`15min` or `30min`)

**Headers:**
- `Authorization: Bearer <CRON_SECRET>` - Required for authentication

**Response:**
```json
{
  "message": "Sync completed",
  "usersProcessed": 10,
  "providersSync": 25,
  "successCount": 23,
  "failureCount": 2,
  "durationMs": 15000
}
```

### Monitoring Dashboard

**GET** `/api/cron/monitoring`

Get monitoring data for cron jobs.

**Query Parameters:**
- `timeRange` - Time range in hours (default: 24, max: 168)

**Response:**
```json
{
  "stats": [
    {
      "jobName": "sync-integrations",
      "totalExecutions": 96,
      "successCount": 94,
      "failureCount": 2,
      "successRate": 0.979,
      "averageDuration": 12500,
      "lastExecution": "2024-01-15T10:30:00Z",
      "lastStatus": "success",
      "recentFailures": 0
    }
  ],
  "alerts": [],
  "recentExecutions": {
    "sync-integrations": [...]
  },
  "timeRange": {
    "hours": 24,
    "since": "2024-01-14T10:30:00Z"
  }
}
```

## Monitoring Dashboard

Access the monitoring dashboard at:

```
https://your-domain.com/dashboard/monitoring
```

The dashboard displays:

- **Active Alerts**: High failure rates, consecutive failures, long durations
- **Job Statistics**: Success rates, execution counts, average duration
- **Recent Executions**: Detailed logs of recent cron job runs

### Alert Thresholds

The monitoring system automatically detects and alerts on:

- **High Failure Rate**: >50% failures (minimum 5 executions)
- **Consecutive Failures**: 3 or more consecutive failures
- **Long Duration**: Average execution time >5 minutes

## Manual Testing

You can manually trigger a sync for testing:

```bash
# Sync all providers
curl -X POST https://your-domain.com/api/cron/sync-integrations \
  -H "Authorization: Bearer $CRON_SECRET"

# Sync only GitHub (15min interval)
curl -X POST "https://your-domain.com/api/cron/sync-integrations?interval=15min" \
  -H "Authorization: Bearer $CRON_SECRET"

# Sync Notion, Slack, Calendar (30min interval)
curl -X POST "https://your-domain.com/api/cron/sync-integrations?interval=30min" \
  -H "Authorization: Bearer $CRON_SECRET"
```

## Local Development

Vercel Cron Jobs don't run in local development. To test locally:

1. Use the manual testing commands above
2. Or create a simple script to call the endpoint periodically

Example test script:

```bash
#!/bin/bash
# test-cron.sh

while true; do
  echo "Running sync..."
  curl -X POST http://localhost:3000/api/cron/sync-integrations \
    -H "Authorization: Bearer $CRON_SECRET"
  echo ""
  sleep 900  # Wait 15 minutes
done
```

## Troubleshooting

### Cron Jobs Not Running

1. Check Vercel dashboard → Project → Settings → Cron Jobs
2. Verify `vercel.json` is in the root directory
3. Ensure you've deployed to production (crons don't run in preview)
4. Check Vercel logs for any errors

### High Failure Rates

1. Check the monitoring dashboard for specific errors
2. Review integration health in `/dashboard/integrations`
3. Check if tokens need to be refreshed
4. Verify API rate limits aren't being exceeded

### Missing Logs

1. Ensure the database migration was applied
2. Check Supabase logs for any errors
3. Verify the `cron_job_executions` table exists

## Log Cleanup

Old execution logs are automatically cleaned up. You can also manually trigger cleanup:

```bash
curl -X POST https://your-domain.com/api/cron/monitoring/cleanup \
  -H "Content-Type: application/json" \
  -d '{"retentionDays": 30}'
```

This will delete logs older than 30 days.

## Best Practices

1. **Monitor Regularly**: Check the monitoring dashboard weekly
2. **Set Up Alerts**: Configure external alerts (Sentry, Slack) for critical failures
3. **Review Logs**: Investigate any consecutive failures immediately
4. **Rate Limits**: Be aware of API rate limits for each provider
5. **Token Refresh**: Ensure refresh tokens are working properly
6. **Cleanup**: Run log cleanup monthly to keep database size manageable

## Security

- The `CRON_SECRET` is required to prevent unauthorized access
- Only Vercel's cron service should call these endpoints
- The secret should be different from other secrets
- Rotate the secret periodically for security

## Requirements Covered

This implementation satisfies the following requirements:

- **2.4**: GitHub sync every 15 minutes
- **3.4**: Notion sync every 30 minutes
- **4.4**: Slack sync every 30 minutes
- **5.4**: Google Calendar sync every 30 minutes
- **7.5**: Comprehensive logging and monitoring of sync operations
