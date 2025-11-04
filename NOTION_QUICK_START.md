# Notion Quick Start - 5 Minutes ⚡

## TL;DR
1. Create Notion integration → Get credentials → Add to `.env.local` → Restart server → Connect in app

## Quick Setup

### 1. Create Integration (2 min)
```
🔗 https://www.notion.so/my-integrations
   ↓
Click "New integration"
   ↓
Name: "LoopTask"
   ↓
Enable: "Read content"
   ↓
Submit
```

### 2. Get Credentials (1 min)
```
Copy OAuth Client ID
Copy OAuth Client Secret
```

### 3. Add to .env.local (1 min)
```bash
# Run the setup script
./setup-notion.sh

# OR manually add:
NOTION_CLIENT_ID=your_client_id_here
NOTION_CLIENT_SECRET=your_client_secret_here
```

### 4. Share Pages (1 min)
```
Open Notion page
   ↓
Click "..." menu
   ↓
"Add connections"
   ↓
Select "LoopTask"
```

### 5. Connect in App (30 sec)
```
Restart server: npm run dev
   ↓
Go to: /dashboard/integrations
   ↓
Click "Connect Notion"
   ↓
Authorize
   ↓
Click "Sync Now"
```

## Done! ✅

Your Notion data is now syncing to LoopTask analytics.

## What You'll See

- 📄 Page creations and edits
- 📊 Documentation activity
- 🤖 AI insights on your work
- 📈 Productivity trends

## Troubleshooting

**"Failed to connect"**
→ Check credentials in `.env.local`
→ Restart server

**"No pages found"**
→ Share pages with integration
→ Try sync again

**Need help?**
→ Read: `NOTION_SETUP_GUIDE.md`
→ Check: `INTEGRATION_TROUBLESHOOTING.md`

## Quick Commands

```bash
# Setup Notion
./setup-notion.sh

# Restart server
npm run dev

# Test connection
curl http://localhost:3000/api/integrations

# Check logs
# Look in terminal for any errors
```

## Redirect URI

Add this to Notion integration settings:
```
http://localhost:3000/api/integrations/notion/callback
```

For production:
```
https://yourdomain.com/api/integrations/notion/callback
```

---

**Full Guide**: See `NOTION_SETUP_GUIDE.md` for detailed instructions
