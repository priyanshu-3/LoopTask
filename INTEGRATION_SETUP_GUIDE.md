# Integration Setup Guide 🔗

Complete guide for setting up all LoopTask integrations with step-by-step instructions, screenshots, and troubleshooting tips.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [GitHub Integration](#github-integration)
- [Google Calendar Integration](#google-calendar-integration)
- [Notion Integration](#notion-integration)
- [Slack Integration](#slack-integration)
- [OpenAI Setup](#openai-setup)
- [Security Configuration](#security-configuration)
- [Testing Your Setup](#testing-your-setup)
- [Troubleshooting](#troubleshooting)

---

## Overview

LoopTask integrates with multiple platforms to provide a unified view of your productivity:

| Integration | Purpose | Required | Setup Time |
|------------|---------|----------|------------|
| GitHub | Code commits, PRs, issues | ✅ Yes | 5 min |
| Google Calendar | Meeting tracking | ⚪ Optional | 10 min |
| Notion | Page activity | ⚪ Optional | 10 min |
| Slack | Team communication | ⚪ Optional | 10 min |
| OpenAI | AI summaries | ⚪ Optional | 2 min |

**Total Setup Time:** 15-40 minutes depending on integrations

---

## Prerequisites

Before starting, ensure you have:

- [ ] Node.js 18+ installed
- [ ] A Supabase account and project
- [ ] Access to create OAuth apps on each platform
- [ ] Admin access to your Slack workspace (for Slack integration)
- [ ] `.env.local` file created from `.env.local.template`

```bash
cp .env.local.template .env.local
```

---

## GitHub Integration

### Step 1: Create GitHub OAuth App

1. **Navigate to GitHub Settings**
   - Go to https://github.com/settings/developers
   - Click "OAuth Apps" in the left sidebar
   - Click "New OAuth App"

2. **Fill in Application Details**
   ```
   Application name: LoopTask
   Homepage URL: http://localhost:3000
   Application description: Developer productivity tracking platform
   Authorization callback URL: http://localhost:3000/api/auth/callback/github
   ```

3. **Register and Get Credentials**
   - Click "Register application"
   - Copy the **Client ID**
   - Click "Generate a new client secret"
   - Copy the **Client Secret** (you won't see it again!)

### Step 2: Configure Environment Variables

Add to `.env.local`:

```bash
GITHUB_CLIENT_ID=Iv1.a1b2c3d4e5f6g7h8
GITHUB_CLIENT_SECRET=1234567890abcdef1234567890abcdef12345678
```

### Step 3: Add Integration Callback URL

For the integration to work (separate from authentication), you need to add a second callback URL:

1. Go back to your GitHub OAuth App settings
2. Under "Authorization callback URL", you can only have one URL
3. For development, use: `http://localhost:3000/api/auth/callback/github`
4. For production, you'll need to create a separate OAuth app with: `https://yourdomain.com/api/integrations/github/callback`

**Note:** GitHub OAuth apps only support one callback URL. For production, create two separate OAuth apps:
- One for authentication (`/api/auth/callback/github`)
- One for integration (`/api/integrations/github/callback`)

### Step 4: Test GitHub Connection

1. Start your development server: `npm run dev`
2. Navigate to http://localhost:3000/dashboard/integrations
3. Click "Connect" on the GitHub card
4. Authorize the application
5. You should see "Connected" status

**Required Scopes:**
- `repo` - Access to repositories
- `read:user` - Read user profile
- `read:org` - Read organization membership

---

## Google Calendar Integration

### Step 1: Create Google Cloud Project

1. **Go to Google Cloud Console**
   - Navigate to https://console.cloud.google.com
   - Click "Select a project" → "New Project"
   - Enter project name: "LoopTask"
   - Click "Create"

2. **Enable Google Calendar API**
   - Go to "APIs & Services" → "Library"
   - Search for "Google Calendar API"
   - Click on it and click "Enable"

### Step 2: Create OAuth Credentials

1. **Configure OAuth Consent Screen**
   - Go to "APIs & Services" → "OAuth consent screen"
   - Select "External" (unless you have Google Workspace)
   - Click "Create"
   - Fill in required fields:
     ```
     App name: LoopTask
     User support email: your-email@example.com
     Developer contact: your-email@example.com
     ```
   - Click "Save and Continue"
   - Add scopes:
     - `https://www.googleapis.com/auth/calendar.readonly`
     - `https://www.googleapis.com/auth/calendar.events.readonly`
   - Click "Save and Continue"
   - Add test users (your email) if in testing mode
   - Click "Save and Continue"

2. **Create OAuth Client ID**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Name: "LoopTask Web Client"
   - Authorized redirect URIs:
     ```
     http://localhost:3000/api/auth/callback/google
     http://localhost:3000/api/integrations/calendar/callback
     ```
   - Click "Create"
   - Copy the **Client ID** and **Client Secret**

### Step 3: Configure Environment Variables

Add to `.env.local`:

```bash
GOOGLE_CLIENT_ID=123456789-abc123def456.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwx
```

### Step 4: Test Calendar Connection

1. Navigate to http://localhost:3000/dashboard/integrations
2. Click "Connect" on the Google Calendar card
3. Sign in with Google
4. Grant calendar permissions
5. You should see "Connected" status with last sync time

**Troubleshooting:**
- If you see "Access blocked", make sure you added your email as a test user
- If scopes are missing, verify you enabled the Calendar API
- Check that both redirect URIs are added

---

## Notion Integration

### Step 1: Create Notion Integration

1. **Go to Notion Integrations**
   - Navigate to https://www.notion.so/my-integrations
   - Click "New integration"

2. **Configure Integration**
   ```
   Name: LoopTask
   Associated workspace: [Select your workspace]
   Type: Public integration
   ```

3. **Set Capabilities**
   - Under "Capabilities", enable:
     - ✅ Read content
     - ✅ Read user information without email addresses
   - Leave other capabilities disabled for security

4. **Configure OAuth**
   - Under "OAuth Domain & URIs"
   - Redirect URIs: `http://localhost:3000/api/integrations/notion/callback`
   - Click "Submit"

5. **Get Credentials**
   - Copy the **OAuth client ID**
   - Copy the **OAuth client secret**

### Step 2: Configure Environment Variables

Add to `.env.local`:

```bash
NOTION_CLIENT_ID=a1b2c3d4-e5f6-7890-abcd-ef1234567890
NOTION_CLIENT_SECRET=secret_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

### Step 3: Test Notion Connection

1. Navigate to http://localhost:3000/dashboard/integrations
2. Click "Connect" on the Notion card
3. Select pages to share with LoopTask
4. Click "Allow access"
5. You should see "Connected" status

**Important Notes:**
- Users must manually share pages with your integration
- The integration can only access pages explicitly shared with it
- For production, update the redirect URI to your domain

---

## Slack Integration

### Step 1: Create Slack App

1. **Go to Slack API**
   - Navigate to https://api.slack.com/apps
   - Click "Create New App"
   - Select "From scratch"
   - Enter app name: "LoopTask"
   - Select your workspace
   - Click "Create App"

2. **Configure OAuth & Permissions**
   - Go to "OAuth & Permissions" in the left sidebar
   - Under "Redirect URLs", click "Add New Redirect URL"
   - Add: `http://localhost:3000/api/integrations/slack/callback`
   - Click "Save URLs"

3. **Add OAuth Scopes**
   - Scroll down to "Scopes" section
   - Under "User Token Scopes", add:
     - `channels:history` - View messages in public channels
     - `channels:read` - View basic channel info
     - `users:read` - View people in workspace
     - `team:read` - View workspace info
     - `im:history` - View messages in DMs
     - `reactions:read` - View emoji reactions

4. **Get Credentials**
   - Go to "Basic Information"
   - Under "App Credentials", copy:
     - **Client ID**
     - **Client Secret**

### Step 2: Configure Environment Variables

Add to `.env.local`:

```bash
SLACK_CLIENT_ID=123456789012.3456789012345
SLACK_CLIENT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

### Step 3: Test Slack Connection

1. Navigate to http://localhost:3000/dashboard/integrations
2. Click "Connect" on the Slack card
3. Select your workspace
4. Click "Allow"
5. You should see "Connected" status

**Workspace Requirements:**
- You need admin access to install apps
- For production, submit app for workspace approval
- Consider creating a separate app for production

---

## OpenAI Setup

### Step 1: Get API Key

1. **Go to OpenAI Platform**
   - Navigate to https://platform.openai.com/api-keys
   - Sign in or create an account

2. **Create API Key**
   - Click "Create new secret key"
   - Name: "LoopTask Development"
   - Click "Create secret key"
   - Copy the key (starts with `sk-`)
   - **Important:** Save it now, you won't see it again!

3. **Add Credits**
   - Go to "Billing" → "Payment methods"
   - Add a payment method
   - Set usage limits to control costs

### Step 2: Configure Environment Variables

Add to `.env.local`:

```bash
OPENAI_API_KEY=sk-proj-abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

### Step 3: Test AI Summaries

1. Navigate to http://localhost:3000/dashboard
2. You should see the AI Summary card
3. Click "Generate Summary"
4. Wait for AI to analyze your activity
5. Summary should appear within 5-10 seconds

**Cost Considerations:**
- Each summary costs approximately $0.01-0.05
- Set usage limits in OpenAI dashboard
- Consider caching summaries (already implemented)
- Monitor usage in OpenAI dashboard

---

## Security Configuration

### Token Encryption

All OAuth tokens are encrypted before storage. Generate a secure encryption key:

```bash
# Generate 32-byte encryption key
openssl rand -base64 32
```

Add to `.env.local`:

```bash
ENCRYPTION_MASTER_KEY=your_generated_32_byte_key_here
```

**Security Best Practices:**

1. **Never commit `.env.local` to version control**
   ```bash
   # Already in .gitignore
   .env.local
   ```

2. **Use different keys for each environment**
   - Development: One key
   - Staging: Different key
   - Production: Different key

3. **Rotate keys periodically**
   - Generate new key
   - Re-encrypt all tokens
   - Update environment variable

4. **Store production keys securely**
   - Use Vercel environment variables
   - Use AWS Secrets Manager
   - Use HashiCorp Vault

### CSRF Protection

CSRF protection is automatically enabled for all OAuth flows using state parameters.

### Rate Limiting

Rate limits are enforced on all integration endpoints:
- Sync endpoints: 10 requests/minute per user
- Summary endpoints: 20 requests/minute per user

---

## Testing Your Setup

### 1. Check Environment Variables

```bash
# Run this script to verify all variables are set
node -e "
const required = [
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'GITHUB_CLIENT_ID',
  'GITHUB_CLIENT_SECRET',
  'ENCRYPTION_MASTER_KEY'
];

const optional = [
  'GOOGLE_CLIENT_ID',
  'NOTION_CLIENT_ID',
  'SLACK_CLIENT_ID',
  'OPENAI_API_KEY'
];

console.log('Required Variables:');
required.forEach(key => {
  console.log(\`  \${key}: \${process.env[key] ? '✅' : '❌'}\`);
});

console.log('\\nOptional Variables:');
optional.forEach(key => {
  console.log(\`  \${key}: \${process.env[key] ? '✅' : '⚪'}\`);
});
"
```

### 2. Test Each Integration

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Test GitHub**
   - Go to http://localhost:3000/dashboard/integrations
   - Click "Connect" on GitHub
   - Verify redirect to GitHub
   - Authorize and verify redirect back
   - Check "Connected" status

3. **Test Google Calendar**
   - Click "Connect" on Google Calendar
   - Sign in with Google
   - Grant permissions
   - Verify "Connected" status

4. **Test Notion**
   - Click "Connect" on Notion
   - Select pages to share
   - Verify "Connected" status

5. **Test Slack**
   - Click "Connect" on Slack
   - Select workspace
   - Verify "Connected" status

### 3. Test Sync Functionality

1. **Manual Sync**
   - Click "Sync Now" on any connected integration
   - Verify loading indicator appears
   - Check for success message
   - Verify activity count increases

2. **Check Activity Feed**
   - Go to http://localhost:3000/dashboard/activity
   - Verify activities from all sources appear
   - Check source labels (GitHub, Notion, Slack, Calendar)

3. **Test AI Summary**
   - Go to http://localhost:3000/dashboard
   - Click "Generate Summary" on AI card
   - Verify summary includes data from all integrations
   - Check insights and recommendations

### 4. Test Error Handling

1. **Invalid Token**
   - Manually expire a token in database
   - Try to sync
   - Verify "Reauthorization Required" message

2. **Rate Limiting**
   - Click sync button rapidly (>10 times)
   - Verify rate limit error message
   - Check retry-after time

3. **Network Error**
   - Disconnect internet
   - Try to sync
   - Verify error message and retry option

---

## Troubleshooting

### Common Issues

#### 1. "Redirect URI Mismatch" Error

**Problem:** OAuth provider rejects redirect

**Solutions:**
- Verify redirect URI exactly matches in OAuth app settings
- Check for trailing slashes (should not have one)
- Ensure protocol matches (http vs https)
- For localhost, use `http://localhost:3000` not `http://127.0.0.1:3000`

**Example Fix:**
```bash
# Wrong
http://localhost:3000/api/auth/callback/github/

# Correct
http://localhost:3000/api/auth/callback/github
```

#### 2. "Invalid Client" Error

**Problem:** Client ID or Secret is incorrect

**Solutions:**
- Double-check credentials in `.env.local`
- Ensure no extra spaces or quotes
- Regenerate client secret if needed
- Verify you're using the correct OAuth app

**Check:**
```bash
# Print first 10 characters of each credential
node -e "
console.log('GITHUB_CLIENT_ID:', process.env.GITHUB_CLIENT_ID?.substring(0, 10));
console.log('GITHUB_CLIENT_SECRET:', process.env.GITHUB_CLIENT_SECRET?.substring(0, 10));
"
```

#### 3. "Encryption Error" When Storing Tokens

**Problem:** ENCRYPTION_MASTER_KEY not set or invalid

**Solutions:**
- Generate new key: `openssl rand -base64 32`
- Ensure key is exactly 32 bytes when base64 decoded
- Check for special characters that need escaping

**Test Encryption:**
```bash
node -e "
const crypto = require('crypto');
const key = process.env.ENCRYPTION_MASTER_KEY;
if (!key) {
  console.log('❌ ENCRYPTION_MASTER_KEY not set');
} else {
  try {
    const buffer = Buffer.from(key, 'base64');
    console.log(\`✅ Key length: \${buffer.length} bytes\`);
    if (buffer.length !== 32) {
      console.log('⚠️  Key should be 32 bytes');
    }
  } catch (e) {
    console.log('❌ Invalid base64 encoding');
  }
}
"
```

#### 4. "Access Denied" from Google

**Problem:** App not verified or user not added as test user

**Solutions:**
- Add your email as test user in OAuth consent screen
- Wait 5 minutes for changes to propagate
- Use the same Google account for testing
- For production, submit app for verification

#### 5. Notion Pages Not Syncing

**Problem:** Integration can't access pages

**Solutions:**
- Manually share pages with integration
- Check integration has "Read content" capability
- Verify workspace is correct
- Re-authorize if needed

**Share Pages:**
1. Open Notion page
2. Click "Share" in top right
3. Search for "LoopTask"
4. Click "Invite"

#### 6. Slack "Missing Scopes" Error

**Problem:** Required scopes not added

**Solutions:**
- Go to Slack app settings
- OAuth & Permissions → Scopes
- Add all required user scopes
- Reinstall app to workspace

**Required Scopes:**
```
channels:history
channels:read
users:read
team:read
im:history
reactions:read
```

#### 7. OpenAI Rate Limit or Quota Exceeded

**Problem:** Too many requests or insufficient credits

**Solutions:**
- Check OpenAI dashboard for usage
- Add payment method and credits
- Increase rate limits
- Implement request queuing (already done)

#### 8. Database Connection Errors

**Problem:** Can't connect to Supabase

**Solutions:**
- Verify Supabase URL and keys in `.env.local`
- Check Supabase project is active
- Run database migrations
- Check network connectivity

**Test Connection:**
```bash
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
supabase.from('users').select('count').then(
  () => console.log('✅ Database connected'),
  (e) => console.log('❌ Database error:', e.message)
);
"
```

### Debug Mode

Enable debug logging for integrations:

```bash
# Add to .env.local
DEBUG=looptask:integrations:*
NODE_ENV=development
```

Check logs in terminal for detailed error messages.

### Getting Help

If you're still stuck:

1. **Check Logs**
   - Browser console (F12)
   - Terminal output
   - Supabase logs
   - Vercel logs (production)

2. **Search Issues**
   - GitHub Issues: https://github.com/yourusername/looptask/issues
   - Stack Overflow: Tag `looptask`

3. **Ask for Help**
   - Discord: https://discord.gg/looptask
   - Email: support@looptask.com
   - GitHub Discussions

4. **Provide Information**
   - Error message (full text)
   - Steps to reproduce
   - Environment (OS, Node version, browser)
   - Relevant logs (remove sensitive data)

---

## Production Deployment

### Update Redirect URIs

For each OAuth app, add production URLs:

**GitHub:**
```
https://yourdomain.com/api/auth/callback/github
https://yourdomain.com/api/integrations/github/callback
```

**Google:**
```
https://yourdomain.com/api/auth/callback/google
https://yourdomain.com/api/integrations/calendar/callback
```

**Notion:**
```
https://yourdomain.com/api/integrations/notion/callback
```

**Slack:**
```
https://yourdomain.com/api/integrations/slack/callback
```

### Environment Variables

Set all environment variables in your hosting platform:

**Vercel:**
1. Go to Project Settings → Environment Variables
2. Add all variables from `.env.local`
3. Set for Production, Preview, and Development
4. Redeploy

**Other Platforms:**
- Netlify: Site settings → Environment variables
- Railway: Project → Variables
- AWS: Systems Manager → Parameter Store

### Security Checklist

- [ ] Generate new ENCRYPTION_MASTER_KEY for production
- [ ] Use different OAuth apps for production
- [ ] Enable HTTPS only
- [ ] Set up CORS properly
- [ ] Enable rate limiting
- [ ] Set up monitoring (Sentry)
- [ ] Configure backup strategy
- [ ] Set up log aggregation
- [ ] Enable audit logging
- [ ] Review and minimize OAuth scopes

---

## Next Steps

After completing setup:

1. ✅ Test all integrations
2. ✅ Generate your first AI summary
3. ✅ Set up automated sync (cron jobs)
4. ✅ Invite team members
5. ✅ Customize dashboard
6. ✅ Set up notifications
7. ✅ Configure webhooks
8. ✅ Deploy to production

**Congratulations!** 🎉 Your integrations are now set up and ready to use.

---

**Last Updated:** October 30, 2025  
**Version:** 1.0.0
