# Notion Integration Setup Guide

## Overview
Connect Notion to LoopTask to track your documentation, notes, and page edits in your productivity analytics.

## Prerequisites
- A Notion account
- Admin access to your Notion workspace
- Your LoopTask application running

## Step 1: Create a Notion Integration

1. **Go to Notion Integrations Page**
   - Visit: https://www.notion.so/my-integrations
   - Click "New integration" or "+ Create new integration"

2. **Configure Your Integration**
   - **Name**: `LoopTask` (or your preferred name)
   - **Associated workspace**: Select your workspace
   - **Logo**: (Optional) Upload your app logo
   - **Type**: Internal integration

3. **Set Capabilities**
   Enable the following capabilities:
   - ✅ Read content
   - ✅ Read user information (including email addresses)
   - ✅ No user information (if you don't need user emails)

4. **Submit and Get Credentials**
   - Click "Submit"
   - Copy the **Internal Integration Token** (starts with `secret_`)
   - Keep this token secure!

## Step 2: Share Pages with Your Integration

Notion integrations need explicit access to pages:

1. **Open a Notion Page**
   - Go to any page you want to track

2. **Share with Integration**
   - Click the "..." menu (top right)
   - Click "Add connections"
   - Search for your integration name (e.g., "LoopTask")
   - Click to add it

3. **Repeat for All Pages**
   - Do this for each page/database you want to track
   - Or share a parent page to give access to all child pages

## Step 3: Get Your Notion OAuth Credentials

For production OAuth flow (optional, for multi-user):

1. **Go to Integration Settings**
   - Visit: https://www.notion.so/my-integrations
   - Click on your integration

2. **Configure OAuth**
   - Scroll to "OAuth Domain & URIs"
   - **Redirect URIs**: Add your callback URL
     ```
     http://localhost:3000/api/integrations/notion/callback
     https://yourdomain.com/api/integrations/notion/callback
     ```

3. **Get OAuth Credentials**
   - **OAuth client ID**: Copy this
   - **OAuth client secret**: Copy this
   - Keep these secure!

## Step 4: Configure Environment Variables

Add these to your `.env.local` file:

```bash
# Notion Integration (Required)
NOTION_CLIENT_ID=your_oauth_client_id_here
NOTION_CLIENT_SECRET=your_oauth_client_secret_here

# For development/testing with Internal Integration Token
NOTION_INTERNAL_TOKEN=secret_your_internal_token_here
```

### Getting Your Credentials

**Option A: OAuth (Recommended for Production)**
- Client ID: From Notion integration settings
- Client Secret: From Notion integration settings

**Option B: Internal Token (For Development)**
- Internal Token: From Notion integration settings (Secrets tab)

## Step 5: Update Your .env.local

```bash
# Copy your existing .env.local
cp .env.local .env.local.backup

# Add Notion credentials
cat >> .env.local << 'EOF'

# Notion Integration
NOTION_CLIENT_ID=your_client_id_here
NOTION_CLIENT_SECRET=your_client_secret_here
EOF
```

## Step 6: Restart Your Development Server

```bash
# Stop the current server (Ctrl+C)
# Start it again
npm run dev
```

## Step 7: Connect Notion in LoopTask

1. **Go to Integrations Page**
   - Navigate to: http://localhost:3000/dashboard/integrations

2. **Click "Connect Notion"**
   - You'll be redirected to Notion
   - Click "Select pages"
   - Choose which pages to share
   - Click "Allow access"

3. **Verify Connection**
   - You should be redirected back to LoopTask
   - Notion card should show "Connected"
   - Green indicator should appear

## Step 8: Sync Your Notion Data

1. **Manual Sync**
   - Click "Sync Now" on the Notion card
   - Wait for sync to complete

2. **Automatic Sync**
   - Syncs automatically every hour
   - Or when you visit the dashboard

## What Data is Tracked?

LoopTask tracks the following Notion activities:

### Page Activities
- ✅ Page creations
- ✅ Page edits
- ✅ Page deletions
- ✅ Last edited time
- ✅ Page titles

### Database Activities
- ✅ Database creations
- ✅ Database updates
- ✅ New entries added

### Metadata
- ✅ Workspace information
- ✅ User information
- ✅ Timestamps

## Troubleshooting

### "Failed to connect Notion"

**Check:**
1. Credentials are correct in `.env.local`
2. Redirect URI matches exactly (including http/https)
3. Integration has required capabilities enabled
4. Server was restarted after adding credentials

### "No pages found"

**Solution:**
1. Share pages with your integration
2. Go to Notion page → "..." → "Add connections"
3. Select your integration
4. Try syncing again

### "Token expired" or "Unauthorized"

**Solution:**
1. Disconnect Notion in LoopTask
2. Reconnect to get a fresh token
3. Make sure integration is still active in Notion

### "Rate limit exceeded"

**Solution:**
1. Wait a few minutes
2. Notion has rate limits (3 requests per second)
3. Sync will automatically retry

## Notion API Limits

- **Rate Limit**: 3 requests per second
- **Page Limit**: 100 pages per request
- **Token Expiry**: Tokens don't expire (unless revoked)

## Security Best Practices

1. **Never commit credentials**
   - Keep `.env.local` in `.gitignore`
   - Use environment variables in production

2. **Use OAuth in production**
   - Don't use internal tokens for production
   - OAuth provides better security

3. **Limit page access**
   - Only share necessary pages
   - Review shared pages regularly

4. **Rotate tokens**
   - Regenerate tokens if compromised
   - Update in LoopTask settings

## Testing Your Integration

```bash
# Test Notion connection
curl http://localhost:3000/api/integrations/notion/connect

# Test Notion sync
curl -X POST http://localhost:3000/api/integrations/notion/sync \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"

# Check integration status
curl http://localhost:3000/api/integrations \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

## Example .env.local

```bash
# Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Auth
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000

# GitHub
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Notion (Add these)
NOTION_CLIENT_ID=your-notion-client-id
NOTION_CLIENT_SECRET=your-notion-client-secret

# OpenAI (for AI summaries)
OPENAI_API_KEY=your-openai-api-key

# Encryption
ENCRYPTION_MASTER_KEY=your-32-character-encryption-key
```

## Next Steps

After connecting Notion:

1. ✅ **Sync your data** - Click "Sync Now"
2. ✅ **View analytics** - Check dashboard for Notion activity
3. ✅ **Generate AI summary** - Get insights on your documentation work
4. ✅ **Set up automations** - Create workflows based on Notion activity

## Support

If you encounter issues:

1. Check the [Integration Troubleshooting Guide](./INTEGRATION_TROUBLESHOOTING.md)
2. Review Notion API documentation: https://developers.notion.com
3. Check browser console for errors
4. Review server logs for API errors

## Useful Links

- **Notion Integrations**: https://www.notion.so/my-integrations
- **Notion API Docs**: https://developers.notion.com
- **Notion API Reference**: https://developers.notion.com/reference
- **LoopTask Integration Docs**: [INTEGRATION_SETUP_GUIDE.md](./INTEGRATION_SETUP_GUIDE.md)
