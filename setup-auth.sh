#!/bin/bash

# LoopTask Authentication Setup Script
# This script helps you set up authentication step by step

echo "🚀 LoopTask Authentication Setup"
echo "=================================="
echo ""

# Check if .env.local exists
if [ -f ".env.local" ]; then
    echo "⚠️  .env.local already exists!"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Setup cancelled"
        exit 1
    fi
fi

# Generate NextAuth secret
echo "🔐 Generating NextAuth secret..."
NEXTAUTH_SECRET=$(openssl rand -base64 32)
echo "✅ Secret generated: $NEXTAUTH_SECRET"
echo ""

# Create .env.local
echo "📝 Creating .env.local file..."
cat > .env.local << EOF
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=$NEXTAUTH_SECRET

# GitHub OAuth
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Supabase (optional)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# OpenAI (optional)
OPENAI_API_KEY=
EOF

echo "✅ .env.local file created!"
echo ""

echo "📋 Next Steps:"
echo ""
echo "1️⃣  Set up GitHub OAuth:"
echo "   → Go to: https://github.com/settings/developers"
echo "   → Create new OAuth App"
echo "   → Callback URL: http://localhost:3000/api/auth/callback/github"
echo "   → Copy Client ID and Secret to .env.local"
echo ""
echo "2️⃣  Set up Google OAuth:"
echo "   → Go to: https://console.cloud.google.com"
echo "   → Create OAuth credentials"
echo "   → Callback URL: http://localhost:3000/api/auth/callback/google"
echo "   → Copy Client ID and Secret to .env.local"
echo ""
echo "3️⃣  Restart your dev server:"
echo "   → npm run dev"
echo ""
echo "📖 For detailed instructions, see: AUTHENTICATION_SETUP_GUIDE.md"
echo ""
echo "✨ Happy coding!"
