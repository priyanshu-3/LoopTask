# Authentication Setup Guide 🔐

Complete step-by-step guide to enable GitHub and Google OAuth authentication.

---

## 📋 Prerequisites

- GitHub account
- Google account
- LoopTask running locally (`npm run dev`)

---

## 🚀 Step 1: Create .env.local File

Create a `.env.local` file in your project root:

```bash
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=CRNmsfORo8v9jaHXZijhvewLW+eeXIe/6OlU27Wrr7I=

# GitHub OAuth (we'll fill these in next)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Google OAuth (we'll fill these in next)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Supabase (optional for now)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI (optional for now)
OPENAI_API_KEY=sk-your-openai-key
```

---

## 🐙 Step 2: Set Up GitHub OAuth

### 2.1 Go to GitHub Developer Settings

1. Open: https://github.com/settings/developers
2. Click **"OAuth Apps"** in the left sidebar
3. Click **"New OAuth App"** button

### 2.2 Fill in Application Details

```
Application name: LoopTask Local
Homepage URL: http://localhost:3000
Application description: Developer productivity platform
Authorization callback URL: http://localhost:3000/api/auth/callback/github
```

### 2.3 Register Application

1. Click **"Register application"**
2. You'll see your **Client ID** - copy it
3. Click **"Generate a new client secret"**
4. Copy the **Client Secret** (you won't see it again!)

### 2.4 Update .env.local

```bash
GITHUB_CLIENT_ID=your_copied_client_id
GITHUB_CLIENT_SECRET=your_copied_client_secret
```

---

## 🔵 Step 3: Set Up Google OAuth

### 3.1 Go to Google Cloud Console

1. Open: https://console.cloud.google.com
2. Create a new project or select existing one
3. Project name: **LoopTask**

### 3.2 Enable Google+ API

1. Go to **"APIs & Services"** → **"Library"**
2. Search for **"Google+ API"**
3. Click **"Enable"**

### 3.3 Configure OAuth Consent Screen

1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Choose **"External"** (for testing)
3. Fill in:
   - App name: **LoopTask**
   - User support email: **your-email@gmail.com**
   - Developer contact: **your-email@gmail.com**
4. Click **"Save and Continue"**
5. Skip **"Scopes"** (click "Save and Continue")
6. Add test users: **your-email@gmail.com**
7. Click **"Save and Continue"**

### 3.4 Create OAuth Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. Application type: **"Web application"**
4. Name: **LoopTask Local**
5. Authorized JavaScript origins:
   ```
   http://localhost:3000
   ```
6. Authorized redirect URIs:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
7. Click **"Create"**

### 3.5 Copy Credentials

1. Copy **Client ID**
2. Copy **Client Secret**

### 3.6 Update .env.local

```bash
GOOGLE_CLIENT_ID=your_copied_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_copied_client_secret
```

---

## 🔄 Step 4: Restart Development Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

---

## ✅ Step 5: Test Authentication

### 5.1 Open Your App

Navigate to: http://localhost:3000

### 5.2 Click "Sign In"

You should see the login page with:
- **Sign in with GitHub** button
- **Sign in with Google** button

### 5.3 Test GitHub Login

1. Click **"Sign in with GitHub"**
2. Authorize the application
3. You should be redirected to the dashboard

### 5.4 Test Google Login

1. Sign out (if signed in)
2. Click **"Sign in with Google"**
3. Choose your Google account
4. You should be redirected to the dashboard

---

## 🐛 Troubleshooting

### Issue: "Redirect URI mismatch"

**Solution**: Make sure your callback URLs are exactly:
- GitHub: `http://localhost:3000/api/auth/callback/github`
- Google: `http://localhost:3000/api/auth/callback/google`

### Issue: "Client ID not found"

**Solution**: 
1. Check `.env.local` file exists in project root
2. Restart the dev server
3. Verify no typos in environment variable names

### Issue: "Invalid client secret"

**Solution**:
1. Regenerate the client secret
2. Update `.env.local`
3. Restart server

### Issue: "Access denied"

**Solution** (Google):
1. Make sure you added yourself as a test user
2. OAuth consent screen must be configured
3. Google+ API must be enabled

---

## 📁 Your .env.local Should Look Like This

```bash
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=CRNmsfORo8v9jaHXZijhvewLW+eeXIe/6OlU27Wrr7I=

# GitHub OAuth
GITHUB_CLIENT_ID=Iv1.a1b2c3d4e5f6g7h8
GITHUB_CLIENT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0

# Google OAuth
GOOGLE_CLIENT_ID=123456789-abc123def456.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123def456ghi789

# Optional (for later)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
```

---

## 🎯 Quick Checklist

Before testing, make sure:

- [ ] `.env.local` file created in project root
- [ ] `NEXTAUTH_SECRET` is set
- [ ] GitHub OAuth app created
- [ ] `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` set
- [ ] Google OAuth credentials created
- [ ] `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` set
- [ ] Callback URLs are correct
- [ ] Development server restarted
- [ ] No typos in environment variables

---

## 🚀 Next Steps After Authentication Works

### 1. Set Up Supabase (Database)

1. Go to: https://supabase.com
2. Create a new project
3. Get your project URL and keys
4. Update `.env.local`

### 2. Set Up OpenAI (AI Features)

1. Go to: https://platform.openai.com
2. Create API key
3. Update `.env.local` with `OPENAI_API_KEY`

### 3. Run Database Migrations

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

---

## 📚 Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org)
- [GitHub OAuth Apps](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Documentation](https://supabase.com/docs)

---

## 🎉 Success!

Once authentication is working, you'll be able to:
- ✅ Sign in with GitHub or Google
- ✅ Access protected dashboard pages
- ✅ Store user data in database
- ✅ Use all LoopTask features

---

*Last Updated: October 28, 2025*
*Version: 1.0*
