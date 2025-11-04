#!/bin/bash

# LoopTask Database Setup Script
# This script helps you set up Supabase for LoopTask

echo "🗄️  LoopTask Database Setup"
echo "=========================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local file not found!"
    echo "Please copy .env.local.template to .env.local first"
    exit 1
fi

# Check if Supabase credentials are configured
if grep -q "your-project.supabase.co" .env.local; then
    echo "⚠️  Supabase credentials not configured yet!"
    echo ""
    echo "Please follow these steps:"
    echo ""
    echo "1. Go to https://supabase.com"
    echo "2. Create a new project"
    echo "3. Get your API keys from Settings → API"
    echo "4. Update .env.local with your credentials:"
    echo "   - NEXT_PUBLIC_SUPABASE_URL"
    echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "   - SUPABASE_SERVICE_ROLE_KEY"
    echo ""
    echo "5. Run this script again"
    echo ""
    echo "📖 See SUPABASE_SETUP_GUIDE.md for detailed instructions"
    exit 1
fi

echo "✅ Supabase credentials found in .env.local"
echo ""

# Check if migration file exists
if [ ! -f supabase/migrations/001_initial_schema.sql ]; then
    echo "❌ Error: Migration file not found!"
    echo "Expected: supabase/migrations/001_initial_schema.sql"
    exit 1
fi

echo "✅ Migration file found"
echo ""

echo "📋 Next steps:"
echo ""
echo "1. Go to your Supabase project dashboard"
echo "2. Click 'SQL Editor' in the left sidebar"
echo "3. Click 'New Query'"
echo "4. Copy the contents of: supabase/migrations/001_initial_schema.sql"
echo "5. Paste into the SQL editor"
echo "6. Click 'Run' (or press Cmd/Ctrl + Enter)"
echo ""
echo "OR use Supabase CLI:"
echo ""
echo "  npm install -g supabase"
echo "  supabase login"
echo "  supabase link --project-ref YOUR_PROJECT_REF"
echo "  supabase db push"
echo ""
echo "After running the migration:"
echo ""
echo "  npm run dev"
echo "  # Go to http://localhost:3001"
echo "  # Sign in with GitHub or Google"
echo "  # Your user will be created automatically!"
echo ""
echo "📖 See SUPABASE_SETUP_GUIDE.md for detailed instructions"
echo ""
echo "✨ Happy coding!"
