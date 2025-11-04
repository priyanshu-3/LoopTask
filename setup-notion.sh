#!/bin/bash

# Notion Integration Setup Script for LoopTask
# This script helps you configure Notion integration

set -e

echo "🔗 LoopTask - Notion Integration Setup"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${RED}❌ Error: .env.local file not found${NC}"
    echo "Please create .env.local first by copying .env.local.template"
    exit 1
fi

echo -e "${BLUE}📋 Step 1: Create Notion Integration${NC}"
echo "----------------------------------------"
echo "1. Go to: https://www.notion.so/my-integrations"
echo "2. Click 'New integration'"
echo "3. Name it 'LoopTask' (or your preferred name)"
echo "4. Select your workspace"
echo "5. Enable 'Read content' capability"
echo "6. Click 'Submit'"
echo ""
read -p "Press Enter when you've created the integration..."

echo ""
echo -e "${BLUE}📋 Step 2: Get OAuth Credentials${NC}"
echo "----------------------------------------"
echo "1. In your integration settings, scroll to 'OAuth Domain & URIs'"
echo "2. Add redirect URI: http://localhost:3000/api/integrations/notion/callback"
echo "3. Copy your OAuth client ID and client secret"
echo ""

# Prompt for Notion Client ID
echo -e "${YELLOW}Enter your Notion OAuth Client ID:${NC}"
read -r NOTION_CLIENT_ID

if [ -z "$NOTION_CLIENT_ID" ]; then
    echo -e "${RED}❌ Client ID cannot be empty${NC}"
    exit 1
fi

# Prompt for Notion Client Secret
echo -e "${YELLOW}Enter your Notion OAuth Client Secret:${NC}"
read -r NOTION_CLIENT_SECRET

if [ -z "$NOTION_CLIENT_SECRET" ]; then
    echo -e "${RED}❌ Client Secret cannot be empty${NC}"
    exit 1
fi

# Check if Notion credentials already exist in .env.local
if grep -q "NOTION_CLIENT_ID" .env.local; then
    echo ""
    echo -e "${YELLOW}⚠️  Notion credentials already exist in .env.local${NC}"
    read -p "Do you want to update them? (y/n): " -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Update existing credentials
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s|NOTION_CLIENT_ID=.*|NOTION_CLIENT_ID=$NOTION_CLIENT_ID|g" .env.local
            sed -i '' "s|NOTION_CLIENT_SECRET=.*|NOTION_CLIENT_SECRET=$NOTION_CLIENT_SECRET|g" .env.local
        else
            # Linux
            sed -i "s|NOTION_CLIENT_ID=.*|NOTION_CLIENT_ID=$NOTION_CLIENT_ID|g" .env.local
            sed -i "s|NOTION_CLIENT_SECRET=.*|NOTION_CLIENT_SECRET=$NOTION_CLIENT_SECRET|g" .env.local
        fi
        echo -e "${GREEN}✅ Updated Notion credentials in .env.local${NC}"
    else
        echo "Skipping update..."
    fi
else
    # Add new credentials
    echo "" >> .env.local
    echo "# Notion Integration" >> .env.local
    echo "NOTION_CLIENT_ID=$NOTION_CLIENT_ID" >> .env.local
    echo "NOTION_CLIENT_SECRET=$NOTION_CLIENT_SECRET" >> .env.local
    echo -e "${GREEN}✅ Added Notion credentials to .env.local${NC}"
fi

echo ""
echo -e "${BLUE}📋 Step 3: Share Pages with Integration${NC}"
echo "----------------------------------------"
echo "To track Notion pages, you need to share them with your integration:"
echo ""
echo "1. Open any Notion page you want to track"
echo "2. Click the '...' menu (top right)"
echo "3. Click 'Add connections'"
echo "4. Search for your integration name"
echo "5. Click to add it"
echo ""
echo "Repeat for all pages you want to track, or share a parent page."
echo ""
read -p "Press Enter when you've shared your pages..."

echo ""
echo -e "${GREEN}✅ Notion Integration Setup Complete!${NC}"
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo "1. Restart your development server:"
echo "   ${YELLOW}npm run dev${NC}"
echo ""
echo "2. Go to: ${YELLOW}http://localhost:3000/dashboard/integrations${NC}"
echo ""
echo "3. Click '${YELLOW}Connect Notion${NC}'"
echo ""
echo "4. Authorize the connection in Notion"
echo ""
echo "5. Click '${YELLOW}Sync Now${NC}' to import your data"
echo ""
echo -e "${BLUE}📚 Documentation:${NC}"
echo "- Full guide: ${YELLOW}NOTION_SETUP_GUIDE.md${NC}"
echo "- Troubleshooting: ${YELLOW}INTEGRATION_TROUBLESHOOTING.md${NC}"
echo ""
echo "Happy tracking! 🚀"
