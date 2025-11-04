# Integration Troubleshooting Guide 🔧

Complete troubleshooting guide for LoopTask integrations with solutions to common issues.

## Table of Contents

- [Quick Diagnostics](#quick-diagnostics)
- [OAuth Connection Issues](#oauth-connection-issues)
- [Sync Problems](#sync-problems)
- [Token and Encryption Issues](#token-and-encryption-issues)
- [Provider-Specific Issues](#provider-specific-issues)
- [Performance Issues](#performance-issues)
- [Security and Privacy](#security-and-privacy)
- [Getting Help](#getting-help)

---

## Quick Diagnostics

### Run Health Check

```bash
# Check all environment variables
npm run check-env

# Or manually:
node -e "
const required = ['NEXTAUTH_URL', 'NEXTAUTH_SECRET', 'GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET', 'ENCRYPTION_MASTER_KEY'];
const optional = ['GOOGLE_CLIENT_ID', 'NOTION_CLIENT_ID', 'SLACK_CLIENT_ID', 'OPENAI_API_KEY'];

console.log('✅ Required Variables:');
required.forEach(key => console.log(\`  \${key}: \${process.env[key] ? '✅' : '❌ MISSING'}\`));

console.log('\\n⚪ Optional Variables:');
optional.forEach(key => console.log(\`  \${key}: \${process.env[key] ? '✅' : '⚪ Not set'}\`));
"
```

### Check Integration Status

```bash
# Test API endpoint
curl http://localhost:3000/api/integrations \
  -H "Cookie: $(cat .cookies)" \
  | jq
```

### View Logs

```bash
# Enable debug mode
export DEBUG=looptask:integrations:*

# Start server and watch logs
npm run dev | grep -i error
```

---

## OAuth Connection Issues

### Issue: "Redirect URI Mismatch"

**Symptoms:**
- Error after clicking "Connect"
- Provider shows "redirect_uri_mismatch" error
- Can't complete OAuth flow

**Causes:**
1. Redirect URI not added to OAuth app
2. URI has typo or wrong protocol
3. Trailing slash mismatch
4. Port number mismatch

**Solutions:**

1. **Verify Redirect URI Format**
   ```
   ✅ Correct: http://localhost:3000/api/integrations/github/callback
   ❌ Wrong:   http://localhost:3000/api/integrations/github/callback/
   ❌ Wrong:   http://127.0.0.1:3000/api/integrations/github/callback
   ❌ Wrong:   https://localhost:3000/api/integrations/github/callback
   ```

2. **Check OAuth App Settings**
   - GitHub: https://github.com/settings/developers
   - Google: https://console.cloud.google.com/apis/credentials
   - Notion: https://www.notion.so/my-integrations
   - Slack: https://api.slack.com/apps

3. **Add All Required URIs**
   ```
   # For each provider, add both:
   http://localhost:3000/api/auth/callback/[provider]
   http://localhost:3000/api/integrations/[provider]/callback
   ```

4. **For Production**
   ```
   https://yourdomain.com/api/auth/callback/[provider]
   https://yourdomain.com/api/integrations/[provider]/callback
   ```

---

### Issue: "Invalid Client" or "Client Authentication Failed"

**Symptoms:**
- Error during OAuth callback
- "invalid_client" error message
- Can't exchange authorization code

**Causes:**
1. Wrong Client ID or Secret
2. Extra spaces in environment variables
3. Using wrong OAuth app
4. Client Secret regenerated but not updated

**Solutions:**

1. **Verify Credentials**
   ```bash
   # Check first 10 characters
   node -e "
   console.log('GITHUB_CLIENT_ID:', process.env.GITHUB_CLIENT_ID?.substring(0, 10));
   console.log('GITHUB_CLIENT_SECRET:', process.env.GITHUB_CLIENT_SECRET?.substring(0, 10));
   "
   ```

2. **Check for Extra Spaces**
   ```bash
   # Wrong - has quotes
   GITHUB_CLIENT_ID="Iv1.abc123"
   
   # Correct - no quotes
   GITHUB_CLIENT_ID=Iv1.abc123
   ```

3. **Regenerate Credentials**
   - Go to OAuth app settings
   - Generate new client secret
   - Update `.env.local` immediately
   - Restart dev server

4. **Restart Server**
   ```bash
   # Kill existing process
   pkill -f "next dev"
   
   # Start fresh
   npm run dev
   ```

---

### Issue: "Access Denied" or "Authorization Failed"

**Symptoms:**
- User clicks "Deny" or "Cancel"
- Error message after OAuth redirect
- Integration shows as not connected

**Causes:**
1. User denied permissions
2. Required scopes not requested
3. User account doesn't have access
4. App not approved by admin (Slack)

**Solutions:**

1. **Try Again**
   - Click "Connect" again
   - Click "Authorize" or "Allow"
   - Grant all requested permissions

2. **Check Required Scopes**
   ```typescript
   // GitHub
   scopes: ['repo', 'read:user', 'read:org']
   
   // Google Calendar
   scopes: ['calendar.readonly', 'calendar.events.readonly']
   
   // Notion
   capabilities: ['Read content', 'Read user information']
   
   // Slack
   scopes: ['channels:history', 'channels:read', 'users:read', 'team:read', 'im:history', 'reactions:read']
   ```

3. **For Slack - Request Admin Approval**
   - Go to Slack workspace settings
   - Request app installation approval
   - Wait for admin to approve

4. **For Google - Add Test User**
   - Go to OAuth consent screen
   - Add your email as test user
   - Wait 5 minutes for propagation

---

### Issue: "State Parameter Mismatch" (CSRF Error)

**Symptoms:**
- "Invalid state parameter" error
- Security error during callback
- OAuth flow fails at last step

**Causes:**
1. Session expired during OAuth flow
2. Cookies blocked by browser
3. Multiple tabs/windows
4. State parameter not stored correctly

**Solutions:**

1. **Enable Cookies**
   - Check browser settings
   - Allow cookies for localhost
   - Disable strict tracking prevention

2. **Use Single Tab**
   - Close other tabs
   - Start OAuth flow fresh
   - Complete in same tab

3. **Check Session Storage**
   ```bash
   # Verify session is working
   curl http://localhost:3000/api/auth/session
   ```

4. **Clear Browser Data**
   - Clear cookies for localhost
   - Clear local storage
   - Try in incognito mode

---

## Sync Problems

### Issue: Sync Fails Immediately

**Symptoms:**
- Click "Sync Now" but nothing happens
- Error message appears instantly
- No loading indicator

**Causes:**
1. Not connected to provider
2. Token expired or invalid
3. Network connectivity issue
4. Rate limit exceeded

**Solutions:**

1. **Check Connection Status**
   ```bash
   curl http://localhost:3000/api/integrations/github/status
   ```

2. **Reconnect Integration**
   - Go to integrations page
   - Click "Disconnect"
   - Click "Connect" again
   - Authorize

3. **Check Network**
   ```bash
   # Test provider API
   curl https://api.github.com/user \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

4. **Wait for Rate Limit**
   - Check error message for retry time
   - Wait specified duration
   - Try again

---

### Issue: Sync Hangs or Takes Too Long

**Symptoms:**
- Loading indicator never stops
- Sync takes >30 seconds
- Browser becomes unresponsive

**Causes:**
1. Large dataset (many commits/events)
2. Slow provider API
3. Database connection slow
4. Memory leak

**Solutions:**

1. **Check Sync Logs**
   ```bash
   # View recent sync attempts
   curl http://localhost:3000/api/integrations/github/status | jq '.syncLogs'
   ```

2. **Reduce Date Range**
   ```typescript
   // In sync-service.ts, reduce lookback period
   const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days instead of 30
   ```

3. **Check Database Performance**
   ```bash
   # Test database connection
   curl http://localhost:3000/api/health
   ```

4. **Restart Server**
   ```bash
   npm run dev
   ```

---

### Issue: Sync Completes But No Data Appears

**Symptoms:**
- Sync shows success
- Activity count is 0
- No activities in feed

**Causes:**
1. No new data in date range
2. Data filtered out
3. Database write failed
4. Wrong user ID

**Solutions:**

1. **Check Sync Result**
   ```bash
   # Look at itemsSynced count
   curl -X POST http://localhost:3000/api/integrations/github/sync
   ```

2. **Verify Data Exists**
   ```bash
   # Check GitHub for recent commits
   curl https://api.github.com/users/YOUR_USERNAME/events
   ```

3. **Check Database**
   ```sql
   -- In Supabase SQL editor
   SELECT COUNT(*) FROM activities WHERE user_id = 'YOUR_USER_ID' AND source = 'github';
   ```

4. **Check Date Range**
   ```typescript
   // Sync looks back 30 days by default
   // Make sure you have activity in that range
   ```

---

### Issue: "Reauthorization Required" Message

**Symptoms:**
- Warning banner on integrations page
- Can't sync
- "Token expired" error

**Causes:**
1. OAuth token expired
2. User revoked access
3. Token refresh failed
4. Provider changed API

**Solutions:**

1. **Reconnect Integration**
   - Click "Disconnect"
   - Click "Connect"
   - Complete OAuth flow

2. **Check Token Expiration**
   ```sql
   -- In Supabase
   SELECT 
     github_token_expires_at,
     notion_token_expires_at,
     slack_token_expires_at,
     calendar_token_expires_at
   FROM integrations
   WHERE user_id = 'YOUR_USER_ID';
   ```

3. **Verify Refresh Token**
   ```typescript
   // Check if refresh token exists
   // Should be stored in database
   ```

4. **Check Provider Status**
   - GitHub: https://www.githubstatus.com
   - Google: https://www.google.com/appsstatus
   - Notion: https://status.notion.so
   - Slack: https://status.slack.com

---

## Token and Encryption Issues

### Issue: "Encryption Error" When Storing Token

**Symptoms:**
- Error during OAuth callback
- "Failed to encrypt token" message
- Can't save integration

**Causes:**
1. ENCRYPTION_MASTER_KEY not set
2. Invalid key format
3. Key wrong length
4. Special characters in key

**Solutions:**

1. **Generate New Key**
   ```bash
   openssl rand -base64 32
   ```

2. **Verify Key Format**
   ```bash
   node -e "
   const key = process.env.ENCRYPTION_MASTER_KEY;
   if (!key) {
     console.log('❌ Key not set');
   } else {
     const buffer = Buffer.from(key, 'base64');
     console.log(\`Key length: \${buffer.length} bytes\`);
     if (buffer.length === 32) {
       console.log('✅ Key is valid');
     } else {
       console.log('❌ Key must be 32 bytes');
     }
   }
   "
   ```

3. **Update .env.local**
   ```bash
   ENCRYPTION_MASTER_KEY=your_new_32_byte_key_here
   ```

4. **Restart Server**
   ```bash
   npm run dev
   ```

---

### Issue: "Decryption Failed" When Reading Token

**Symptoms:**
- Can't sync after server restart
- "Invalid token" error
- All integrations show disconnected

**Causes:**
1. ENCRYPTION_MASTER_KEY changed
2. Database corrupted
3. Token format changed
4. Migration issue

**Solutions:**

1. **Verify Key Hasn't Changed**
   ```bash
   # Check if key matches what was used to encrypt
   echo $ENCRYPTION_MASTER_KEY
   ```

2. **Reconnect All Integrations**
   - If key changed, old tokens can't be decrypted
   - Disconnect all integrations
   - Connect again with new key

3. **Check Database**
   ```sql
   -- Verify tokens exist
   SELECT 
     github_token_encrypted IS NOT NULL as has_github,
     notion_token_encrypted IS NOT NULL as has_notion
   FROM integrations
   WHERE user_id = 'YOUR_USER_ID';
   ```

4. **Clear and Reconnect**
   ```sql
   -- Last resort: clear all tokens
   UPDATE integrations
   SET 
     github_token_encrypted = NULL,
     notion_token_encrypted = NULL,
     slack_token_encrypted = NULL,
     calendar_token_encrypted = NULL
   WHERE user_id = 'YOUR_USER_ID';
   ```

---

## Provider-Specific Issues

### GitHub Issues

#### Rate Limit Exceeded

**Symptoms:**
- "API rate limit exceeded" error
- Sync fails with 403 status
- Can't fetch data

**Solutions:**

1. **Check Rate Limit Status**
   ```bash
   curl https://api.github.com/rate_limit \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

2. **Wait for Reset**
   - GitHub: 5,000 requests/hour
   - Resets at top of hour
   - Check `X-RateLimit-Reset` header

3. **Reduce Sync Frequency**
   ```typescript
   // In cron job config
   // Change from 15 minutes to 30 minutes
   ```

4. **Use Conditional Requests**
   ```typescript
   // Add ETag caching
   headers: {
     'If-None-Match': lastETag
   }
   ```

---

### Google Calendar Issues

#### "Access Blocked: Authorization Error"

**Symptoms:**
- Can't complete OAuth
- "This app isn't verified" warning
- Access denied

**Solutions:**

1. **Add Test User**
   - Go to OAuth consent screen
   - Add your email as test user
   - Try again after 5 minutes

2. **Click "Advanced" → "Go to LoopTask (unsafe)"**
   - Only for development
   - For production, submit for verification

3. **Enable Calendar API**
   - Go to APIs & Services → Library
   - Search "Google Calendar API"
   - Click "Enable"

4. **Check Scopes**
   ```typescript
   scopes: [
     'https://www.googleapis.com/auth/calendar.readonly',
     'https://www.googleapis.com/auth/calendar.events.readonly'
   ]
   ```

---

### Notion Issues

#### "No Pages Found" After Connecting

**Symptoms:**
- Connection successful
- Sync returns 0 items
- No pages appear

**Solutions:**

1. **Share Pages with Integration**
   - Open Notion page
   - Click "Share" in top right
   - Search for "LoopTask"
   - Click "Invite"

2. **Check Integration Capabilities**
   - Go to https://www.notion.so/my-integrations
   - Verify "Read content" is enabled

3. **Verify Workspace**
   - Make sure integration is in correct workspace
   - Check workspace selector during OAuth

4. **Wait for Sync**
   - Notion API can be slow
   - Wait 1-2 minutes after sharing
   - Try manual sync

---

### Slack Issues

#### "Missing Scopes" Error

**Symptoms:**
- Can't access channels
- "missing_scope" error
- Limited data

**Solutions:**

1. **Add Required Scopes**
   - Go to https://api.slack.com/apps
   - Select your app
   - OAuth & Permissions → Scopes
   - Add all required user scopes

2. **Reinstall App**
   - After adding scopes
   - Reinstall to workspace
   - Reauthorize

3. **Check Scope List**
   ```
   Required:
   - channels:history
   - channels:read
   - users:read
   - team:read
   - im:history
   - reactions:read
   ```

---

## Performance Issues

### Issue: Slow Dashboard Load

**Symptoms:**
- Dashboard takes >5 seconds to load
- Integrations page is slow
- Browser freezes

**Causes:**
1. Too many activities
2. No database indexes
3. Large AI summaries
4. Memory leak

**Solutions:**

1. **Add Database Indexes**
   ```sql
   CREATE INDEX IF NOT EXISTS idx_activities_user_source 
   ON activities(user_id, source, timestamp DESC);
   
   CREATE INDEX IF NOT EXISTS idx_activities_timestamp 
   ON activities(timestamp DESC);
   ```

2. **Implement Pagination**
   ```typescript
   // Limit activities per page
   const limit = 50;
   const offset = page * limit;
   ```

3. **Cache AI Summaries**
   ```typescript
   // Already implemented - verify cache is working
   const cached = await getCachedSummary(userId, date);
   ```

4. **Optimize Queries**
   ```sql
   -- Use EXPLAIN to check query performance
   EXPLAIN ANALYZE
   SELECT * FROM activities
   WHERE user_id = 'xxx'
   ORDER BY timestamp DESC
   LIMIT 50;
   ```

---

### Issue: High Memory Usage

**Symptoms:**
- Server crashes
- "Out of memory" errors
- Slow performance over time

**Causes:**
1. Memory leak in sync service
2. Large datasets not paginated
3. Too many concurrent syncs
4. Caching too much data

**Solutions:**

1. **Restart Server Regularly**
   ```bash
   # Add to cron
   0 */6 * * * pm2 restart looptask
   ```

2. **Limit Concurrent Syncs**
   ```typescript
   // In sync-service.ts
   const MAX_CONCURRENT = 3;
   ```

3. **Paginate Large Requests**
   ```typescript
   // Fetch in batches
   for (let page = 1; page <= totalPages; page++) {
     const batch = await fetchPage(page);
     await processBatch(batch);
   }
   ```

4. **Clear Old Data**
   ```sql
   -- Delete activities older than 90 days
   DELETE FROM activities
   WHERE timestamp < NOW() - INTERVAL '90 days';
   ```

---

## Security and Privacy

### Issue: Tokens Visible in Logs

**Symptoms:**
- Tokens appear in console
- Tokens in error messages
- Security concern

**Solutions:**

1. **Sanitize Logs**
   ```typescript
   // Never log full tokens
   console.log('Token:', token.substring(0, 10) + '...');
   ```

2. **Use Debug Mode Carefully**
   ```bash
   # Only enable in development
   DEBUG=looptask:* npm run dev
   ```

3. **Check Sentry Config**
   ```typescript
   // Ensure tokens are filtered
   beforeSend(event) {
     if (event.request) {
       delete event.request.headers?.Authorization;
     }
     return event;
   }
   ```

---

### Issue: Concerned About Data Privacy

**Questions:**
- What data is stored?
- Is message content saved?
- Who can access my data?

**Answers:**

1. **Data Stored:**
   - ✅ Activity metadata (counts, timestamps)
   - ✅ Commit messages (from GitHub)
   - ✅ Page titles (from Notion)
   - ✅ Event titles (from Calendar)
   - ❌ Slack message content (only counts)
   - ❌ Calendar event descriptions
   - ❌ Email addresses (except yours)

2. **Encryption:**
   - All OAuth tokens encrypted (AES-256-GCM)
   - Data in transit uses HTTPS/TLS 1.2+
   - Database encrypted at rest (Supabase)

3. **Access Control:**
   - Only you can see your data
   - Row-level security in database
   - No admin access to user data

4. **Data Deletion:**
   ```sql
   -- Delete all your data
   DELETE FROM activities WHERE user_id = 'YOUR_ID';
   DELETE FROM integrations WHERE user_id = 'YOUR_ID';
   DELETE FROM ai_summaries WHERE user_id = 'YOUR_ID';
   ```

---

## Getting Help

### Before Asking for Help

1. **Check This Guide**
   - Search for your error message
   - Try suggested solutions
   - Check provider-specific sections

2. **Gather Information**
   ```bash
   # System info
   node --version
   npm --version
   
   # Error logs
   npm run dev 2>&1 | tee error.log
   
   # Integration status
   curl http://localhost:3000/api/integrations > status.json
   ```

3. **Try Incognito Mode**
   - Rules out browser extensions
   - Fresh cookies/cache
   - Clean state

4. **Check Provider Status**
   - GitHub: https://www.githubstatus.com
   - Google: https://www.google.com/appsstatus
   - Notion: https://status.notion.so
   - Slack: https://status.slack.com

---

### How to Report Issues

**Include:**

1. **Error Message**
   ```
   Full error text from console or UI
   ```

2. **Steps to Reproduce**
   ```
   1. Go to integrations page
   2. Click "Connect" on GitHub
   3. Authorize application
   4. See error: "..."
   ```

3. **Environment**
   ```
   OS: macOS 14.0
   Node: v18.17.0
   Browser: Chrome 119
   ```

4. **Relevant Logs**
   ```
   [Remove sensitive data like tokens]
   ```

5. **What You've Tried**
   ```
   - Restarted server
   - Cleared cookies
   - Regenerated credentials
   ```

---

### Support Channels

1. **Documentation**
   - [Integration Setup Guide](./INTEGRATION_SETUP_GUIDE.md)
   - [API Documentation](./API_DOCUMENTATION.md)
   - [README](./README.md)

2. **Community**
   - Discord: https://discord.gg/looptask
   - GitHub Discussions: https://github.com/yourusername/looptask/discussions

3. **Bug Reports**
   - GitHub Issues: https://github.com/yourusername/looptask/issues
   - Include all information above

4. **Direct Support**
   - Email: support@looptask.com
   - Response time: 24-48 hours

---

## Quick Reference

### Common Commands

```bash
# Check environment
npm run check-env

# Test integration
curl http://localhost:3000/api/integrations

# Trigger sync
curl -X POST http://localhost:3000/api/integrations/github/sync

# View logs
npm run dev | grep -i error

# Clear cache
rm -rf .next

# Restart server
pkill -f "next dev" && npm run dev
```

### Common Fixes

```bash
# Fix 1: Restart everything
pkill -f "next dev"
rm -rf .next
npm run dev

# Fix 2: Clear browser data
# Open DevTools → Application → Clear storage

# Fix 3: Regenerate credentials
# Go to OAuth app → Generate new secret → Update .env.local

# Fix 4: Reconnect integration
# Dashboard → Integrations → Disconnect → Connect
```

---

**Last Updated:** October 30, 2025  
**Version:** 1.0.0
