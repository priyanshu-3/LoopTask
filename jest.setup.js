import '@testing-library/jest-dom'
import 'openai/shims/node'

// Mock environment variables for tests
process.env.NEXTAUTH_SECRET = 'test-secret-key-for-testing-only'
process.env.NEXTAUTH_URL = 'https://localhost:3000'
process.env.ENCRYPTION_MASTER_KEY = 'test-encryption-master-key-32b!'
process.env.OPENAI_API_KEY = 'test-openai-key'
process.env.GITHUB_CLIENT_ID = 'test-github-client-id'
process.env.GITHUB_CLIENT_SECRET = 'test-github-client-secret'
process.env.NOTION_CLIENT_ID = 'test-notion-client-id'
process.env.NOTION_CLIENT_SECRET = 'test-notion-client-secret'
process.env.SLACK_CLIENT_ID = 'test-slack-client-id'
process.env.SLACK_CLIENT_SECRET = 'test-slack-client-secret'
process.env.GOOGLE_CLIENT_ID = 'test-google-client-id'
process.env.GOOGLE_CLIENT_SECRET = 'test-google-client-secret'
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'

// Mock fetch globally
global.fetch = jest.fn()
