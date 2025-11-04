# Notion OAuth Redirect URIs - What to Enter

## 🎯 Redirect URIs (Required)

This is where Notion will send users after they authorize your app.

### For Local Development:

```
http://localhost:3000/api/integrations/notion/callback
```

### For Production (Vercel):

If your app is deployed on Vercel, add:

```
https://your-app-name.vercel.app/api/integrations/notion/callback
```

Replace `your-app-name` with your actual Vercel app name.

### For Custom Domain:

If you have a custom domain:

```
https://yourdomain.com/api/integrations/notion/callback
```

---

## 📝 What to Enter Right Now

### Option 1: Development Only
If you're just testing locally:

```
http://localhost:3000/api/integrations/notion/callback
```

### Option 2: Development + Production
If you want both local and production to work:

```
http://localhost:3000/api/integrations/notion/callback
https://your-app-name.vercel.app/api/integrations/notion/callback
```

**Note:** You can add multiple redirect URIs (one per line)

---

## 🎨 Logo (Optional)

The logo field is **optional**. You can:

1. **Skip it for now** - Just leave it empty and click "Save"
2. **Add it later** - You can always come back and upload a logo
3. **Upload a simple icon** - If you have one ready (512x512px recommended)

**Recommendation:** Skip the logo for now and add it later when you're ready to make the integration public.

---

## ✅ Complete Form Summary

Here's what you should have entered:

```
Email: aayushkumar83903@gmail.com ✅

Logo: [Skip for now] ⏭️

Redirect URIs:
http://localhost:3000/api/integrations/notion/callback
```

If deploying to production, also add:
```
https://your-vercel-app.vercel.app/api/integrations/notion/callback
```

---

## 🚀 After Clicking "Save"

1. **Copy your OAuth credentials:**
   - OAuth Client ID
   - OAuth Client Secret

2. **Add to your `.env.local` file:**

```bash
# Open .env.local and add these lines:
NOTION_CLIENT_ID=paste_your_client_id_here
NOTION_CLIENT_SECRET=paste_your_client_secret_here
```

3. **Restart your development server:**

```bash
# Stop the server (Ctrl+C)
npm run dev
```

4. **Test the connection:**
   - Go to: `http://localhost:3000/dashboard/integrations`
   - Click "Connect Notion"
   - You should be redirected to Notion
   - Authorize the app
   - You'll be redirected back to your app

---

## 🔍 Verify Your Redirect URI

The redirect URI must match **exactly**:

✅ Correct:
```
http://localhost:3000/api/integrations/notion/callback
```

❌ Wrong:
```
http://localhost:3000/api/integrations/notion/callback/
(extra slash at the end)

http://localhost:3001/api/integrations/notion/callback
(wrong port)

https://localhost:3000/api/integrations/notion/callback
(https instead of http for localhost)
```

---

## 📋 Quick Checklist

Before clicking "Save":

- [ ] Email is correct: `aayushkumar83903@gmail.com`
- [ ] Redirect URI is added: `http://localhost:3000/api/integrations/notion/callback`
- [ ] Logo is skipped (or uploaded if you have one)
- [ ] Ready to copy OAuth credentials after saving

---

## 🆘 Troubleshooting

### "Redirect URI mismatch" error later?

**Solution:**
1. Go back to Notion integration settings
2. Check the redirect URI matches exactly
3. Make sure there's no extra slash or typo
4. Restart your server after any changes

### Can't find OAuth credentials after saving?

**Solution:**
1. Go to: https://www.notion.so/my-integrations
2. Click on your integration
3. Scroll to "OAuth Domain & URIs" section
4. Your Client ID and Secret will be there

---

## 🎉 You're Almost Done!

After clicking "Save":
1. Copy OAuth Client ID
2. Copy OAuth Client Secret  
3. Add both to `.env.local`
4. Restart server
5. Connect Notion in your app
6. Start tracking! 🚀

---

## 📞 Need Help?

If you get stuck after clicking "Save", just let me know and I'll help you with the next steps!
