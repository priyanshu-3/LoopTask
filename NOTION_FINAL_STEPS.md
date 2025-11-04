# Notion Integration - Final Steps ✅

## ✅ What You've Done So Far

1. ✅ Created Notion integration
2. ✅ Filled out the public integration form
3. ✅ Added OAuth credentials to `.env.local`

## 🚀 Next Steps

### Step 1: Restart Your Development Server

Your server needs to reload the new environment variables.

```bash
# Stop your current server (press Ctrl+C in the terminal)
# Then start it again:
npm run dev
```

**Important:** The server MUST be restarted for the new credentials to work!

---

### Step 2: Share Notion Pages with Your Integration

Before you can sync data, you need to give your integration access to Notion pages.

#### How to Share Pages:

1. **Open any Notion page** you want to track
2. **Click the "..." menu** (three dots in the top right)
3. **Click "Add connections"**
4. **Search for your integration name** (e.g., "LoopTask")
5. **Click to add it**

**Tip:** Share a parent page to automatically give access to all child pages!

#### What Pages to Share:

Share pages where you:
- ✅ Take notes
- ✅ Write documentation
- ✅ Track projects
- ✅ Manage tasks
- ✅ Keep meeting notes

---

### Step 3: Connect Notion in Your App

1. **Go to the integrations page:**
   ```
   http://localhost:3000/dashboard/integrations
   ```

2. **Find the Notion card**

3. **Click "Connect Notion"**

4. **You'll be redirected to Notion** - Click "Select pages"

5. **Choose which pages to share** (or select all)

6. **Click "Allow access"**

7. **You'll be redirected back** to your app

8. **Notion should now show as "Connected"** ✅

---

### Step 4: Sync Your Data

1. **Click "Sync Now"** on the Notion card

2. **Wait for the sync to complete** (should take a few seconds)

3. **Check your dashboard** - you should see Notion activity!

---

### Step 5: Verify Everything Works

#### Check Integration Status:
```bash
curl http://localhost:3000/api/integrations
```

You should see:
```json
{
  "notion_connected": true,
  "last_notion_sync": "2024-..."
}
```

#### Check Notion Activity:
Go to: `http://localhost:3000/dashboard/activity`

You should see your Notion page edits and creations!

---

## 🎉 Success Checklist

- [ ] Server restarted with new credentials
- [ ] Notion pages shared with integration
- [ ] Connected Notion in app
- [ ] Clicked "Sync Now"
- [ ] Seeing Notion activity in dashboard

---

## 🔍 Troubleshooting

### "Failed to connect Notion"

**Check:**
1. Credentials are correct in `.env.local`
2. Server was restarted after adding credentials
3. Redirect URI in Notion matches exactly:
   ```
   http://localhost:3000/api/integrations/notion/callback
   ```

**Fix:**
```bash
# Verify credentials are loaded
echo $NOTION_CLIENT_ID  # Should show your client ID
echo $NOTION_CLIENT_SECRET  # Should show your secret

# Restart server
npm run dev
```

---

### "No pages found" after connecting

**Solution:**
1. Go to Notion
2. Open a page
3. Click "..." → "Add connections"
4. Select your integration
5. Try syncing again in LoopTask

---

### "Unauthorized" or "Invalid token"

**Solution:**
1. Disconnect Notion in LoopTask
2. Reconnect to get a fresh token
3. Make sure integration is active in Notion settings

---

### Connection works but no data syncing

**Check:**
1. Pages are shared with integration
2. Click "Sync Now" manually
3. Check browser console for errors
4. Check server logs for API errors

---

## 📊 What Data Will You See?

After syncing, you'll see:

### In Dashboard:
- 📄 Total Notion pages edited
- 📈 Notion activity over time
- 🤖 AI insights about your documentation work

### In Activity Feed:
- Page creations
- Page edits
- Last edited timestamps
- Page titles and links

### In Analytics:
- Notion activity trends
- Most active days
- Documentation patterns

### In AI Summary:
- Documentation insights
- Work patterns
- Productivity recommendations

---

## 🎯 Quick Commands

```bash
# Restart server
npm run dev

# Check if Notion is connected
curl http://localhost:3000/api/integrations

# Manually trigger sync
curl -X POST http://localhost:3000/api/integrations/notion/sync \
  -H "Cookie: next-auth.session-token=YOUR_SESSION"

# Check Notion status
curl http://localhost:3000/api/integrations/notion/status
```

---

## 🔄 Automatic Syncing

After initial setup, Notion will automatically sync:
- ⏰ Every hour (background job)
- 🔄 When you visit the dashboard
- 🖱️ When you click "Sync Now"

---

## 📱 What's Next?

Now that Notion is connected:

1. ✅ **View your analytics** - Check dashboard for insights
2. ✅ **Generate AI summary** - Get AI-powered insights
3. ✅ **Set up automations** - Create workflows based on Notion activity
4. ✅ **Connect more integrations** - Add Slack, Calendar, etc.

---

## 🎊 You're All Set!

Notion is now tracking your documentation and notes!

**Need help?** Check:
- `NOTION_SETUP_GUIDE.md` - Full setup guide
- `INTEGRATION_TROUBLESHOOTING.md` - Common issues
- `INTEGRATION_QUICK_REFERENCE.md` - Quick reference

---

## 📞 Still Stuck?

If something isn't working, tell me:
1. What error you're seeing
2. What step you're on
3. Any error messages from console/logs

I'll help you fix it! 🚀
