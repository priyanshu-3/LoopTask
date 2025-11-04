# 🧪 Testing Guide - GitHub Integration

## Prerequisites

Before testing, ensure:
- ✅ Supabase is configured
- ✅ First migration (001_initial_schema.sql) is run
- ✅ User is created in database
- ✅ Server is running on port 3001

## Step 1: Run Second Migration

### Using Supabase Dashboard

1. Go to: https://supabase.com/dashboard/project/yspvirbstukujlffmrnf/sql/new
2. Copy contents of `supabase/migrations/002_add_sync_fields.sql`
3. Paste and click "Run"
4. Should see: ✅ "Success. No rows returned"

### Migration Contents
```sql
-- Adds last_synced_at field
-- Adds unique constraint for activities
-- Adds performance indexes
```

## Step 2: Restart Server

```bash
# Stop current server (if running)
# Restart to pick up new code
npm run dev
```

Server should start on port 3001.

## Step 3: Test Integration Status API

### Check Integration Status
```bash
# Open browser console at http://localhost:3001/dashboard
# Run this command:
fetch('/api/integrations').then(r => r.json()).then(console.log)
```

**Expected Response:**
```json
{
  "github_connected": true,
  "slack_connected": false,
  "notion_connected": false,
  "calendar_connected": false,
  "last_synced_at": null
}
```

## Step 4: Test GitHub Sync

### Method 1: Using Dashboard UI

1. Go to http://localhost:3001/dashboard
2. Look for "Sync GitHub" button (top right of Integrations section)
3. Click the button
4. Should see: "Syncing GitHub data..."
5. Wait 10-30 seconds
6. Should see: "✓ Synced X commits and Y PRs!"

### Method 2: Using Browser Console

```javascript
// In browser console at /dashboard
fetch('/api/github/sync', { method: 'POST' })
  .then(r => r.json())
  .then(console.log)
```

**Expected Response:**
```json
{
  "success": true,
  "synced": {
    "commits": 15,
    "pullRequests": 3,
    "activities": 18
  },
  "stats": {
    "totalCommits": 15,
    "totalPRs": 3,
    "totalRepos": 5,
    "languages": {
      "TypeScript": 3,
      "JavaScript": 2
    },
    "commitsByDay": {
      "2025-01-28": 5,
      "2025-01-27": 10
    }
  }
}
```

### Method 3: Using curl

```bash
# Get your session cookie first by logging in
# Then run:
curl -X POST http://localhost:3001/api/github/sync \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json"
```

## Step 5: Verify Data in Supabase

### Check Activities Table

1. Go to: https://supabase.com/dashboard/project/yspvirbstukujlffmrnf/editor
2. Click on "activities" table
3. Should see your commits and PRs!

**Example Data:**
```
| id | user_id | type | title | created_at |
|----|---------|------|-------|------------|
| 1  | uuid... | commit | Fixed auth bug | 2025-01-28... |
| 2  | uuid... | pull_request | Added dashboard | 2025-01-27... |
```

### Check Integrations Table

1. Click on "integrations" table
2. Should see `last_synced_at` updated

## Step 6: Test Activity Feed

### View Activities on Dashboard

1. Go to http://localhost:3001/dashboard
2. Look at "Recent Activity" section
3. Should see your actual commits and PRs!
4. Should show:
   - Commit messages
   - Repository names
   - Relative timestamps ("2 hours ago")

### Test Loading State

1. Open browser DevTools → Network tab
2. Throttle network to "Slow 3G"
3. Refresh dashboard
4. Should see skeleton loading animation

### Test Error State

1. Stop Supabase (or disconnect internet)
2. Refresh dashboard
3. Should see error message with retry button

## Step 7: Test Settings Page

### View Integration Status

1. Go to http://localhost:3001/dashboard/settings
2. Click "Integrations" tab
3. Should see:
   - GitHub: Connected ✓
   - Last synced: [timestamp]
   - "Sync Now" button

### Test Manual Sync

1. Click "Sync Now" button
2. Button should show "Syncing..." with spinning icon
3. Wait for completion
4. Should see success message
5. Last synced timestamp should update

## Step 8: Test Multiple Syncs

### Verify No Duplicates

1. Sync GitHub data
2. Check activities count in Supabase
3. Sync again immediately
4. Check activities count again
5. **Should be the same** (no duplicates!)

This works because of the unique constraint:
```sql
UNIQUE (user_id, type, created_at)
```

## Step 9: Test Edge Cases

### No Commits in Last 30 Days

1. If you have no recent commits:
2. Sync should complete successfully
3. Should show: "Synced 0 commits and 0 PRs"
4. Activity feed should show empty state

### Rate Limit

1. Sync multiple times rapidly
2. GitHub API has 5000 requests/hour limit
3. Should handle gracefully
4. Show appropriate error message

### Network Error

1. Disconnect internet
2. Try to sync
3. Should show error: "Failed to sync GitHub data"
4. Retry button should work when reconnected

## Step 10: Performance Testing

### Sync Speed

- **Expected**: 10-30 seconds for 30 days of data
- **Depends on**: Number of repos, commits, PRs
- **Limit**: 20 repos to avoid rate limits

### Database Performance

```sql
-- Check query performance
EXPLAIN ANALYZE
SELECT * FROM activities
WHERE user_id = 'your-user-id'
ORDER BY created_at DESC
LIMIT 10;
```

Should use index and be fast (<10ms).

## Common Issues & Solutions

### Issue: "User not found"
**Solution**: Make sure you're logged in and user exists in database

### Issue: "GitHub not connected"
**Solution**: Sign in with GitHub OAuth to get token

### Issue: Sync takes too long
**Solution**: Normal for first sync. Subsequent syncs are faster.

### Issue: No activities showing
**Solution**: 
1. Check if sync completed successfully
2. Verify data in Supabase activities table
3. Check browser console for errors

### Issue: Duplicate activities
**Solution**: Run migration 002 to add unique constraint

### Issue: "Failed to fetch activities"
**Solution**: 
1. Check Supabase is running
2. Verify credentials in .env.local
3. Check browser console for detailed error

## Success Criteria

✅ **All tests should pass:**

1. Migration runs successfully
2. Integration status API works
3. GitHub sync completes without errors
4. Activities appear in database
5. Dashboard shows real data
6. No duplicate activities
7. Loading states work
8. Error handling works
9. Settings page shows correct status
10. Performance is acceptable

## Next Steps After Testing

Once all tests pass:

1. ✅ GitHub integration is working!
2. ⏳ Add background sync (cron job)
3. ⏳ Add webhook support
4. ⏳ Implement other integrations (Slack, Notion)
5. ⏳ Add advanced analytics

## Monitoring

### Check Logs

```bash
# Server logs
# Look for:
- "Syncing GitHub data..."
- "Synced X commits and Y PRs"
- Any error messages
```

### Check Database

```sql
-- Count activities
SELECT COUNT(*) FROM activities;

-- Recent activities
SELECT * FROM activities
ORDER BY created_at DESC
LIMIT 10;

-- Activities by type
SELECT type, COUNT(*) 
FROM activities 
GROUP BY type;
```

## Troubleshooting Commands

```bash
# Check if server is running
lsof -i :3001

# Check Supabase connection
# In browser console:
fetch('/api/integrations').then(r => r.json()).then(console.log)

# Clear activities (if needed)
# In Supabase SQL Editor:
DELETE FROM activities WHERE user_id = 'your-user-id';

# Reset sync timestamp
UPDATE integrations 
SET last_synced_at = NULL 
WHERE user_id = 'your-user-id';
```

---

## Quick Test Checklist

- [ ] Run migration 002
- [ ] Restart server
- [ ] Test /api/integrations
- [ ] Test /api/github/sync
- [ ] Check Supabase activities table
- [ ] View dashboard activity feed
- [ ] Test settings page sync
- [ ] Verify no duplicates
- [ ] Test error handling
- [ ] Check performance

**All done? You're ready to use real GitHub data! 🎉**
