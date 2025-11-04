# Notion Public Integration - Form Guide

## Required Information for Public Integration

When making your Notion integration public, you need to provide the following information:

### 1. **Website** (Required)
**What to enter:** Your application's main website URL

**Examples:**
- Development: `http://localhost:3000`
- Production: `https://looptask.com` or `https://your-app.vercel.app`

**For your case:**
```
https://your-vercel-app-url.vercel.app
```
Or if you have a custom domain:
```
https://looptask.com
```

---

### 2. **Tagline** (Required)
**What to enter:** A short description of your app (1-2 sentences)

**Examples:**
```
Track your productivity across GitHub, Notion, Slack, and more
```

Or:
```
AI-powered developer productivity analytics and insights
```

Or:
```
Connect your tools, track your work, boost your productivity
```

**Recommended:**
```
Developer productivity platform that tracks activity across GitHub, Notion, Slack, and Calendar with AI-powered insights
```

---

### 3. **Privacy Policy URL** (Required)
**What to enter:** Link to your privacy policy page

**Options:**

**Option A: Create a simple privacy policy page**
1. Create a file: `src/app/privacy/page.tsx`
2. Add basic privacy policy content
3. Use URL: `https://your-domain.com/privacy`

**Option B: Use a privacy policy generator**
- https://www.privacypolicygenerator.info/
- https://www.termsfeed.com/privacy-policy-generator/

**Option C: For development/testing**
```
https://your-domain.com/privacy
```
(We'll create this page for you)

---

### 4. **Terms of Use URL** (Required)
**What to enter:** Link to your terms of service page

**Options:**

**Option A: Create a terms page**
1. Create a file: `src/app/terms/page.tsx`
2. Add basic terms content
3. Use URL: `https://your-domain.com/terms`

**Option B: Use a terms generator**
- https://www.termsfeed.com/terms-conditions-generator/
- https://www.termsandconditionsgenerator.com/

**Option C: For development/testing**
```
https://your-domain.com/terms
```
(We'll create this page for you)

---

### 5. **Email** (Required)
**What to enter:** Support/developer email address

**Examples:**
```
support@looptask.com
```

Or your personal email:
```
your-email@gmail.com
```

**Recommended format:**
```
support@your-domain.com
```
or
```
hello@your-domain.com
```

---

### 6. **Logo** (Optional but recommended)
**What to upload:** Your app logo/icon

**Requirements:**
- Format: PNG, JPG, or SVG
- Size: At least 256x256 pixels
- Square aspect ratio recommended

**If you don't have a logo:**
- Use a simple icon
- Create one at: https://www.canva.com/
- Or skip for now (you can add later)

---

## Quick Fill Guide

Here's what you should enter right now:

### For Development/Testing:

```
Website: http://localhost:3000
Tagline: Developer productivity platform with AI-powered insights
Privacy Policy URL: http://localhost:3000/privacy
Terms of Use URL: http://localhost:3000/terms
Email: your-email@gmail.com
```

### For Production (Vercel):

```
Website: https://your-app.vercel.app
Tagline: Developer productivity platform with AI-powered insights
Privacy Policy URL: https://your-app.vercel.app/privacy
Terms of Use URL: https://your-app.vercel.app/terms
Email: your-email@gmail.com
```

---

## What I'll Create for You

I'll create the following pages so you can complete the form:

1. ✅ Privacy Policy page (`/privacy`)
2. ✅ Terms of Service page (`/terms`)
3. ✅ Simple legal documents suitable for a productivity app

---

## After Filling the Form

Once you submit:

1. **Copy your OAuth credentials:**
   - Client ID
   - Client Secret

2. **Add to `.env.local`:**
   ```bash
   NOTION_CLIENT_ID=your_client_id
   NOTION_CLIENT_SECRET=your_client_secret
   ```

3. **Add Redirect URI:**
   In Notion integration settings, add:
   ```
   http://localhost:3000/api/integrations/notion/callback
   ```
   
   For production:
   ```
   https://your-domain.com/api/integrations/notion/callback
   ```

4. **Restart your server:**
   ```bash
   npm run dev
   ```

5. **Test the connection:**
   Go to `/dashboard/integrations` and click "Connect Notion"

---

## Important Notes

### For Development:
- You can use `localhost` URLs
- Use your personal email
- Privacy/Terms pages can be simple

### For Production:
- Use your actual domain
- Use a professional email (support@domain.com)
- Have proper Privacy Policy and Terms
- Upload a logo

### Distribution Type:
- **Public**: Anyone can install (requires approval from Notion)
- **Internal**: Only your workspace (no approval needed)

**Recommendation:** Start with **Internal** for testing, then switch to **Public** when ready for production.

---

## Need Help?

If you're stuck on any field, just tell me:
1. What environment you're in (development/production)
2. Your domain/URL
3. Your email

I'll give you the exact values to enter!
