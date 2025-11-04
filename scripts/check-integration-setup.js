#!/usr/bin/env node

/**
 * Integration Setup Verification Script
 * 
 * This script checks if all required environment variables are set
 * and validates their format for LoopTask integrations.
 */

const crypto = require('crypto');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkRequired() {
  log('\n📋 Checking Required Variables:', 'cyan');
  
  const required = [
    { key: 'NEXTAUTH_URL', example: 'http://localhost:3000' },
    { key: 'NEXTAUTH_SECRET', validator: (val) => val && val.length >= 32 },
    { key: 'GITHUB_CLIENT_ID', validator: (val) => val && val.length > 10 },
    { key: 'GITHUB_CLIENT_SECRET', validator: (val) => val && val.length > 20 },
    { key: 'ENCRYPTION_MASTER_KEY', validator: validateEncryptionKey },
  ];

  let allValid = true;

  required.forEach(({ key, example, validator }) => {
    const value = process.env[key];
    
    if (!value) {
      log(`  ❌ ${key}: NOT SET`, 'red');
      if (example) {
        log(`     Example: ${example}`, 'yellow');
      }
      allValid = false;
    } else if (validator && !validator(value)) {
      log(`  ⚠️  ${key}: INVALID FORMAT`, 'yellow');
      allValid = false;
    } else {
      log(`  ✅ ${key}: SET`, 'green');
    }
  });

  return allValid;
}

function checkOptional() {
  log('\n📋 Checking Optional Variables:', 'cyan');
  
  const optional = [
    { key: 'GOOGLE_CLIENT_ID', feature: 'Google Calendar integration' },
    { key: 'GOOGLE_CLIENT_SECRET', feature: 'Google Calendar integration' },
    { key: 'NOTION_CLIENT_ID', feature: 'Notion integration' },
    { key: 'NOTION_CLIENT_SECRET', feature: 'Notion integration' },
    { key: 'SLACK_CLIENT_ID', feature: 'Slack integration' },
    { key: 'SLACK_CLIENT_SECRET', feature: 'Slack integration' },
    { key: 'OPENAI_API_KEY', feature: 'AI summaries' },
    { key: 'NEXT_PUBLIC_SUPABASE_URL', feature: 'Database' },
    { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', feature: 'Database' },
    { key: 'SUPABASE_SERVICE_ROLE_KEY', feature: 'Database admin' },
  ];

  optional.forEach(({ key, feature }) => {
    const value = process.env[key];
    
    if (!value) {
      log(`  ⚪ ${key}: Not set (${feature})`, 'reset');
    } else {
      log(`  ✅ ${key}: SET (${feature})`, 'green');
    }
  });
}

function validateEncryptionKey(key) {
  try {
    const buffer = Buffer.from(key, 'base64');
    return buffer.length === 32;
  } catch (e) {
    return false;
  }
}

function checkEncryptionKey() {
  log('\n🔐 Validating Encryption Key:', 'cyan');
  
  const key = process.env.ENCRYPTION_MASTER_KEY;
  
  if (!key) {
    log('  ❌ ENCRYPTION_MASTER_KEY not set', 'red');
    log('  Generate one with: openssl rand -base64 32', 'yellow');
    return false;
  }

  try {
    const buffer = Buffer.from(key, 'base64');
    const length = buffer.length;
    
    if (length === 32) {
      log(`  ✅ Key is valid (${length} bytes)`, 'green');
      return true;
    } else {
      log(`  ❌ Key is ${length} bytes, should be 32 bytes`, 'red');
      log('  Generate a new one with: openssl rand -base64 32', 'yellow');
      return false;
    }
  } catch (e) {
    log('  ❌ Key is not valid base64', 'red');
    log('  Generate a new one with: openssl rand -base64 32', 'yellow');
    return false;
  }
}

function checkIntegrations() {
  log('\n🔗 Integration Status:', 'cyan');
  
  const integrations = [
    {
      name: 'GitHub',
      required: true,
      vars: ['GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET'],
    },
    {
      name: 'Google Calendar',
      required: false,
      vars: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
    },
    {
      name: 'Notion',
      required: false,
      vars: ['NOTION_CLIENT_ID', 'NOTION_CLIENT_SECRET'],
    },
    {
      name: 'Slack',
      required: false,
      vars: ['SLACK_CLIENT_ID', 'SLACK_CLIENT_SECRET'],
    },
    {
      name: 'OpenAI (AI Summaries)',
      required: false,
      vars: ['OPENAI_API_KEY'],
    },
  ];

  integrations.forEach(({ name, required, vars }) => {
    const allSet = vars.every(v => process.env[v]);
    
    if (allSet) {
      log(`  ✅ ${name}: Ready`, 'green');
    } else if (required) {
      log(`  ❌ ${name}: Missing credentials (REQUIRED)`, 'red');
    } else {
      log(`  ⚪ ${name}: Not configured (optional)`, 'reset');
    }
  });
}

function printSummary(requiredValid) {
  log('\n' + '='.repeat(50), 'blue');
  
  if (requiredValid) {
    log('✅ All required variables are set!', 'green');
    log('\nNext steps:', 'cyan');
    log('  1. Start the development server: npm run dev', 'reset');
    log('  2. Visit http://localhost:3000/dashboard/integrations', 'reset');
    log('  3. Connect your integrations', 'reset');
    log('\nDocumentation:', 'cyan');
    log('  - Setup Guide: ./INTEGRATION_SETUP_GUIDE.md', 'reset');
    log('  - Troubleshooting: ./INTEGRATION_TROUBLESHOOTING.md', 'reset');
    log('  - Quick Reference: ./INTEGRATION_QUICK_REFERENCE.md', 'reset');
  } else {
    log('❌ Some required variables are missing or invalid', 'red');
    log('\nPlease fix the issues above and run this script again.', 'yellow');
    log('\nQuick fixes:', 'cyan');
    log('  1. Copy template: cp .env.local.template .env.local', 'reset');
    log('  2. Generate secrets:', 'reset');
    log('     NEXTAUTH_SECRET: openssl rand -base64 32', 'reset');
    log('     ENCRYPTION_MASTER_KEY: openssl rand -base64 32', 'reset');
    log('  3. Set up OAuth apps (see INTEGRATION_SETUP_GUIDE.md)', 'reset');
  }
  
  log('='.repeat(50) + '\n', 'blue');
}

function main() {
  log('\n' + '='.repeat(50), 'blue');
  log('🚀 LoopTask Integration Setup Checker', 'cyan');
  log('='.repeat(50), 'blue');

  const requiredValid = checkRequired();
  checkOptional();
  checkEncryptionKey();
  checkIntegrations();
  printSummary(requiredValid);

  process.exit(requiredValid ? 0 : 1);
}

main();
