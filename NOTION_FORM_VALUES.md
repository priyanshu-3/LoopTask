# Notion Integration Form - Exact Values to Enter

## 📋 Copy and Paste These Values

### For Local Development:

```
Website:
http://localhost:3000

Tagline:
Developer productivity platform with AI-powered insights across GitHub, Notion, Slack, and Calendar

Privacy Policy URL:
http://localhost:3000/privacy

Terms of Use URL:
http://localhost:3000/terms

Email:
[YOUR_EMAIL_HERE]
```

### For Production (Vercel/Custom Domain):

```
Website:
https://your-app-name.vercel.app
(or your custom domain)

Tagline:
Developer productivity platform with AI-powered insights across GitHub, Notion, Slack, and Calendar

Privacy Policy URL:
https://your-app-name.vercel.app/privacy

Terms of Use URL:
https://your-app-name.vercel.app/terms

Email:
support@your-domain.com
(or your email)
```

---

## ✅ What I've Created for You

1. **Privacy Policy Page** → `/privacy`
   - Accessible at: `http://localhost:3000/privacy`
   - Professional privacy policy covering all integrations

2. **Terms of Service Page** → `/terms`
   - Accessible at: `http://localhost:3000/terms`
   - Complete terms covering service usage

---

## 🚀 Next Steps

### 1. Fill Out the Notion Form

Use the values above and click "Submit"

### 2. Get Your Credentials

After submitting, copy:
- **OAuth Client ID**
- **OAuth Client Secret**

### 3. Add to .env.local

```bash
# Add these lines to your .env.local file
NOTION_CLIENT_ID=your_client_id_here
NOTION_CLIENT_SECRET=your_client_secret_here
```

### 4. Add Redirect URI

In Notion integration settings, add:

**For Development:**
```
http://localhost:3000/api/integrations/notion/callback
```

**For Production:**
```
https://your-domain.com/api/integrations/notion/callback
```

### 5. Restart Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

### 6. Test Connection

1. Go to: `http://localhost:3000/dashboard/integrations`
2. Click "Connect Notion"
3. Authorize in Notion
4. Click "Sync Now"

---

## 📝 Alternative Taglines (Choose One)

If you want a different tagline:

```
Option 1:
Track your productivity across GitHub, Notion, Slack, and Calendar with AI insights

Option 2:
All-in-one developer productivity analytics platform

Option 3:
Connect your tools, track your work, boost your productivity

Option 4:
AI-powered productivity tracking for developers and teams

Option 5:
Unified productivity analytics across all your favorite tools
```

---

## 🎨 Logo (Optional)

If you want to add a logo:

1. Create a simple icon (256x256px minimum)
2. Use tools like:
   - Canva: https://www.canva.com/
   - Figma: https://www.figma.com/
   - Or use an emoji: 🔄 📊 📈 ⚡

3. Upload in the "Logo" section

**You can skip this for now and add it later!**

---

## ⚠️ Important Notes

### Distribution Type

When asked about distribution:

- **Internal Integration** (Recommended for now)
  - ✅ Only your workspace can use it
  - ✅ No approval needed
  - ✅ Perfect for testing
  - ✅ Can switch to Public later

- **Public Integration**
  - ❌ Requires Notion approval
  - ❌ Takes time to review
  - ✅ Anyone can install
  - ✅ Better for production

**Start with Internal, switch to Public when ready!**

---

## 🔍 Verification

After setup, verify everything works:

```bash
# 1. Check privacy page
curl http://localhost:3000/privacy

# 2. Check terms page
curl http://localhost:3000/terms

# 3. Check integration status
curl http://localhost:3000/api/integrations
```

---

## 📞 Need Help?

If you're stuck, tell me:
1. What error you're seeing
2. Which field is causing issues
3. Your environment (dev/production)

I'll help you fix it!

---

## ✨ Quick Summary

1. ✅ Fill form with values above
2. ✅ Copy OAuth credentials
3. ✅ Add to `.env.local`
4. ✅ Add redirect URI
5. ✅ Restart server
6. ✅ Connect in app
7. ✅ Start tracking!

**You're almost there! 🎉**
