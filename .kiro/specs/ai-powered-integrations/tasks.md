# Implementation Plan

- [x] 1. Set up database schema and migrations
  - Create migration file for integration token fields (notion, slack, calendar)
  - Create integration_sync_logs table with indexes
  - Create ai_summaries table with indexes
  - Add source, external_id, and external_url columns to activities table
  - Run migration and verify schema changes
  - _Requirements: 1.4, 7.5, 8.1_

- [x] 2. Implement token encryption and management
  - [x] 2.1 Create encryption utilities
    - Implement AES-256-GCM encryption functions in `src/lib/integrations/encryption.ts`
    - Create encrypt and decrypt functions with unique keys per user
    - Add environment variable for encryption master key
    - _Requirements: 8.1, 8.2_
  
  - [x] 2.2 Build TokenManager class
    - Create `src/lib/integrations/token-manager.ts`
    - Implement storeToken method with encryption
    - Implement getToken method with decryption
    - Implement getValidToken method with automatic refresh
    - Implement deleteToken method
    - _Requirements: 1.4, 1.5, 8.1_

- [x] 3. Implement OAuth manager and flows
  - [x] 3.1 Create OAuthManager class
    - Create `src/lib/integrations/oauth-manager.ts`
    - Define OAuthConfig interface for each provider
    - Implement getAuthorizationUrl method
    - Implement exchangeCodeForTokens method
    - Implement refreshAccessToken method
    - Implement revokeToken method
    - _Requirements: 1.2, 1.3, 1.5_
  
  - [x] 3.2 Add OAuth configuration for providers
    - Add Notion OAuth config (client ID, secret, scopes)
    - Add Slack OAuth config (client ID, secret, scopes)
    - Add Google Calendar OAuth config (client ID, secret, scopes)
    - Store credentials in environment variables
    - Update `.env.local.template` with new variables
    - _Requirements: 1.1, 8.5_

- [x] 4. Build integration client for Notion
  - [x] 4.1 Create NotionClient class
    - Create `src/lib/integrations/notion-client.ts`
    - Implement constructor with token authentication
    - Implement getRecentPages method
    - Implement getDatabases method
    - Implement getPageContent method
    - Add error handling for API failures
    - _Requirements: 3.1, 3.2, 3.3_
  
  - [x] 4.2 Create Notion OAuth routes
    - Create `/api/integrations/notion/connect` route
    - Create `/api/integrations/notion/callback` route
    - Implement token exchange and storage
    - Create `/api/integrations/notion/disconnect` route
    - _Requirements: 3.1, 3.5, 1.2, 1.3_

- [x] 5. Build integration client for Slack
  - [x] 5.1 Create SlackClient class
    - Create `src/lib/integrations/slack-client.ts`
    - Implement constructor with token authentication
    - Implement getUserActivity method
    - Implement getChannels method
    - Implement getTeamInfo method
    - Add error handling for API failures
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [x] 5.2 Create Slack OAuth routes
    - Create `/api/integrations/slack/connect` route
    - Create `/api/integrations/slack/callback` route
    - Implement token exchange and storage
    - Create `/api/integrations/slack/disconnect` route
    - _Requirements: 4.1, 4.5, 1.2, 1.3_

- [x] 6. Build integration client for Google Calendar
  - [x] 6.1 Create CalendarClient class
    - Create `src/lib/integrations/calendar-client.ts`
    - Implement constructor with token authentication
    - Implement getEvents method
    - Implement getCalendars method
    - Implement getMeetingStats method
    - Add error handling for API failures
    - _Requirements: 5.1, 5.2, 5.3_
  
  - [x] 6.2 Create Google Calendar OAuth routes
    - Create `/api/integrations/calendar/connect` route
    - Create `/api/integrations/calendar/callback` route
    - Implement token exchange and storage with refresh token
    - Create `/api/integrations/calendar/disconnect` route
    - _Requirements: 5.1, 5.5, 1.2, 1.3_

- [x] 7. Enhance existing GitHub integration
  - [x] 7.1 Update GitHub client with new methods
    - Add getIssues method to `src/lib/github/client.ts`
    - Update getCommits to support date filtering
    - Update getPullRequests to support date filtering
    - Add error handling for rate limits
    - _Requirements: 2.2, 2.3, 7.3_
  
  - [x] 7.2 Update GitHub OAuth routes
    - Update `/api/integrations/github/callback` to use TokenManager
    - Implement token encryption for GitHub tokens
    - Update `/api/integrations/github/disconnect` route
    - _Requirements: 2.5, 8.1_

- [x] 8. Implement sync service
  - [x] 8.1 Create SyncService class
    - Create `src/lib/integrations/sync-service.ts`
    - Implement syncProvider method for single provider
    - Implement syncAllProviders method
    - Implement getSyncStatus method
    - Add sync logging to integration_sync_logs table
    - _Requirements: 2.4, 3.4, 4.4, 5.4, 7.5_
  
  - [x] 8.2 Implement data transformation and storage
    - Create transformer functions for each provider's data format
    - Store GitHub commits, PRs, issues in activities table
    - Store Notion pages in activities table
    - Store Slack activity metrics in activities table
    - Store Calendar events in activities table
    - Add source and external_id to all activity records
    - _Requirements: 2.3, 3.3, 4.3, 5.3_
  
  - [x] 8.3 Add error handling and retry logic
    - Implement exponential backoff for rate limits
    - Implement automatic token refresh on expiration
    - Implement retry logic for network failures (max 3 attempts)
    - Mark connections requiring reauthorization
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 9. Create sync API routes
  - [x] 9.1 Build manual sync endpoints
    - Create `/api/integrations/[provider]/sync` POST route
    - Implement sync trigger with loading state
    - Return sync result with items synced count
    - Add rate limiting (10 requests per minute per user)
    - _Requirements: 10.1, 10.2, 10.3, 10.4_
  
  - [x] 9.2 Build sync status endpoints
    - Create `/api/integrations/[provider]/status` GET route
    - Return last sync timestamp and status
    - Return sync logs for provider
    - Return activity count from last sync
    - _Requirements: 9.1, 9.2, 7.5_

- [x] 10. Implement AI summary engine
  - [x] 10.1 Create AISummaryEngine class
    - Create `src/lib/integrations/ai-summary-engine.ts`
    - Implement generateSummary method
    - Implement generateDailySummary method
    - Implement generateWeeklySummary method
    - Implement getCachedSummary method
    - _Requirements: 6.1, 6.2, 6.3_
  
  - [x] 10.2 Build OpenAI integration
    - Install OpenAI SDK (`openai` package)
    - Create prompt templates for summary generation
    - Implement activity data aggregation from all sources
    - Implement pattern analysis (active times, top repos, meeting load)
    - Generate natural language summaries with insights
    - Add environment variable for OpenAI API key
    - _Requirements: 6.2, 6.3, 6.4_
  
  - [x] 10.3 Implement summary caching
    - Cache generated summaries in ai_summaries table
    - Implement 1-hour cache TTL for summaries
    - Return cached summary if available and fresh
    - Invalidate cache when new data is synced
    - _Requirements: 6.5_

- [x] 11. Create AI summary API routes
  - Create `/api/integrations/summary` GET route
  - Support query params: start, end, type (daily/weekly/monthly)
  - Validate date range parameters
  - Return cached summary or generate new one
  - Include activity breakdown by platform
  - _Requirements: 6.1, 6.5_

- [x] 12. Build integrations UI page
  - [x] 12.1 Create IntegrationsPage component
    - Create `src/app/dashboard/integrations/page.tsx`
    - Display list of all integration providers
    - Show connection status for each provider
    - Show last sync timestamp for connected integrations
    - Show activity count for each integration
    - Add loading states using existing Skeleton components
    - _Requirements: 1.1, 9.1, 9.2_
  
  - [x] 12.2 Create IntegrationCard component
    - Create `src/components/integrations/IntegrationCard.tsx`
    - Display provider logo and name
    - Show connected/disconnected status with Badge
    - Add Connect/Disconnect buttons
    - Add Manual Sync button for connected integrations
    - Show last sync timestamp
    - Show activity statistics
    - _Requirements: 1.1, 9.1, 10.1_

- [x] 13. Build sync status components
  - [x] 13.1 Create SyncStatusIndicator component
    - Create `src/components/integrations/SyncStatusIndicator.tsx`
    - Show real-time sync status (idle, syncing, success, error)
    - Display loading spinner during sync
    - Show success checkmark on completion
    - Show error icon with tooltip on failure
    - Display last sync timestamp
    - _Requirements: 7.1, 7.2, 7.4, 10.2, 10.3_
  
  - [x] 13.2 Add sync notifications
    - Show success toast on successful sync with item count
    - Show error toast on sync failure with retry option
    - Show warning banner for connections requiring reauthorization
    - Show info message for rate limit delays
    - _Requirements: 7.1, 7.2, 7.4, 10.3, 10.5_

- [x] 14. Enhance AI summary card
  - Update existing `src/components/integrations/AISummaryCard.tsx`
  - Add date range selector (today, week, month, custom)
  - Display activity breakdown by platform with icons
  - Show key insights and recommendations sections
  - Display productivity metrics (commits, PRs, meetings, focus time)
  - Add refresh button to regenerate summary
  - Show loading skeleton while generating
  - _Requirements: 6.4, 6.5_

- [x] 15. Implement integration analytics
  - [x] 15.1 Create analytics calculation functions
    - Create `src/lib/integrations/analytics.ts`
    - Calculate total activity count per integration
    - Calculate activity counts for 7 days, 30 days, all time
    - Generate activity distribution breakdown
    - Update analytics on sync completion
    - _Requirements: 9.1, 9.2, 9.3, 9.4_
  
  - [x] 15.2 Build analytics display components
    - Add activity count cards to integrations page
    - Create activity distribution chart using Recharts
    - Show time period selector (7d, 30d, all time)
    - Display last sync timestamp for each integration
    - _Requirements: 9.1, 9.2, 9.3, 9.5_

- [x] 16. Add integration health monitoring
  - [x] 16.1 Implement health check system
    - Create health check function in SyncService
    - Check for failed syncs (3+ consecutive failures)
    - Check for expired tokens
    - Check for connections requiring reauthorization
    - Log health check results
    - _Requirements: 7.1, 7.2, 7.4, 7.5_
  
  - [x] 16.2 Create notification system
    - Send in-app notification for reauthorization needed
    - Send notification for 3+ consecutive sync failures
    - Add notification badge to integrations nav item
    - Create notification list in integrations page
    - _Requirements: 7.1, 7.2, 7.4_

- [x] 17. Implement scheduled background sync
  - [x] 17.1 Set up cron jobs
    - Create `/api/cron/sync-integrations` route
    - Implement scheduled sync for all users with active integrations
    - Set GitHub sync interval to 15 minutes
    - Set Notion, Slack, Calendar sync interval to 30 minutes
    - Add cron job configuration to Vercel
    - _Requirements: 2.4, 3.4, 4.4, 5.4_
  
  - [x] 17.2 Add job monitoring
    - Log all cron job executions
    - Track success/failure rates
    - Send alerts for high failure rates
    - Add monitoring dashboard for sync jobs
    - _Requirements: 7.5_

- [x] 18. Add security and validation
  - [x] 18.1 Implement CSRF protection
    - Add state parameter to OAuth flows
    - Validate state parameter in callback routes
    - Generate unique state tokens per request
    - Store state in session with expiration
    - _Requirements: 8.5_
  
  - [x] 18.2 Add input validation
    - Validate OAuth callback parameters
    - Validate sync API request parameters
    - Validate date range parameters for summaries
    - Sanitize user inputs
    - _Requirements: 8.5_
  
  - [x] 18.3 Implement rate limiting
    - Add rate limiting to sync endpoints (10 req/min per user)
    - Add rate limiting to summary endpoints (20 req/min per user)
    - Return 429 status with retry-after header
    - _Requirements: 8.5_

- [x] 19. Update dashboard to show integration data
  - Update main dashboard page to include integration activity
  - Show combined activity feed from all sources
  - Add filter by source (GitHub, Notion, Slack, Calendar)
  - Display AI summary card on dashboard
  - Show integration connection status in sidebar
  - _Requirements: 6.5, 9.3_

- [x] 20. Add documentation and environment setup
  - Update README with integration setup instructions
  - Document OAuth app creation for each provider
  - Add environment variables to `.env.local.template`
  - Create integration setup guide
  - Document API endpoints in API_DOCUMENTATION.md
  - Add troubleshooting section for common issues
  - _Requirements: 1.1, 8.5_

- [x] 21. Testing and validation
  - [x] 21.1 Test OAuth flows
    - Test GitHub OAuth flow end-to-end
    - Test Notion OAuth flow end-to-end
    - Test Slack OAuth flow end-to-end
    - Test Google Calendar OAuth flow end-to-end
    - Test token refresh on expiration
    - Test disconnect and token revocation
    - _Requirements: 1.2, 1.3, 1.5, 2.5, 3.5, 4.5, 5.5_
  
  - [x] 21.2 Test sync functionality
    - Test manual sync for each provider
    - Test automatic background sync
    - Test sync with no new data
    - Test sync with large datasets
    - Test sync error handling and retry
    - Verify data appears in activities table
    - _Requirements: 2.2, 2.3, 2.4, 3.2, 3.3, 3.4, 4.2, 4.3, 4.4, 5.2, 5.3, 5.4_
  
  - [x] 21.3 Test AI summary generation
    - Test daily summary generation
    - Test weekly summary generation
    - Test summary with single integration
    - Test summary with multiple integrations
    - Test summary caching
    - Verify insights and recommendations quality
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  
  - [x] 21.4 Test error scenarios
    - Test expired token handling
    - Test rate limit handling
    - Test network failure handling
    - Test invalid token handling
    - Test provider downtime handling
    - Verify error notifications appear
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  
  - [x] 21.5 Test security measures
    - Verify tokens are encrypted in database
    - Test CSRF protection in OAuth flows
    - Test rate limiting on endpoints
    - Verify HTTPS-only redirects
    - Test data deletion on disconnect
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
