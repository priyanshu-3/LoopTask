import { supabaseAdmin } from '@/lib/supabaseClient';
import { tokenManager, IntegrationProvider } from './token-manager';
import { GitHubClient, GitHubCommit, GitHubPullRequest, GitHubIssue } from '@/lib/github/client';
import { NotionClient, NotionPage } from './notion-client';
import { SlackClient, SlackActivity } from './slack-client';
import { CalendarClient, CalendarEvent } from './calendar-client';
import { OAuthManager } from './oauth-manager';
import { IntegrationError } from '@/types/errors';
import { notificationService } from './notification-service';

/**
 * Result of a sync operation
 */
export interface SyncResult {
  provider: IntegrationProvider;
  success: boolean;
  itemsSynced: number;
  error?: string;
  duration: number;
}

/**
 * Status of a sync operation
 */
export interface SyncStatus {
  provider: IntegrationProvider;
  lastSync?: Date;
  status: 'idle' | 'syncing' | 'success' | 'error';
  lastError?: string;
  itemsSynced?: number;
}

/**
 * Health status of an integration
 */
export interface IntegrationHealth {
  provider: IntegrationProvider;
  healthy: boolean;
  issues: HealthIssue[];
  lastChecked: Date;
}

/**
 * Health issue detected for an integration
 */
export interface HealthIssue {
  type: 'consecutive_failures' | 'token_expired' | 'reauth_required' | 'token_missing';
  severity: 'warning' | 'error';
  message: string;
  details?: any;
}

/**
 * Activity record to be stored in database
 */
interface ActivityRecord {
  user_id: string;
  type: string;
  title: string;
  description?: string;
  source: IntegrationProvider;
  external_id: string;
  external_url?: string;
  metadata?: any;
  created_at: string;
}

/**
 * SyncService orchestrates data synchronization from all integration providers
 * 
 * Features:
 * - Sync data from GitHub, Notion, Slack, and Google Calendar
 * - Transform provider data into unified activity format
 * - Handle errors with exponential backoff and retry logic
 * - Log all sync operations for monitoring
 * - Automatic token refresh on expiration
 * 
 * Requirements: 2.4, 3.4, 4.4, 5.4, 7.5
 */
export class SyncService {
  private oauthManager: OAuthManager;
  private maxRetries = 3;
  private baseBackoffMs = 1000; // 1 second

  constructor() {
    this.oauthManager = new OAuthManager();
  }

  /**
   * Sync data from a single provider
   * 
   * @param userId - User ID to sync data for
   * @param provider - Integration provider to sync
   * @returns Sync result with success status and items synced
   */
  async syncProvider(userId: string, provider: IntegrationProvider): Promise<SyncResult> {
    const startTime = Date.now();
    let attempt = 0;

    while (attempt < this.maxRetries) {
      try {
        console.log(`🔄 Starting sync for ${provider} (attempt ${attempt + 1}/${this.maxRetries})`);

        // Log sync start
        const syncLogId = await this.logSyncStart(userId, provider);

        // Get valid token (will auto-refresh if expired)
        const token = await this.getValidTokenWithRefresh(userId, provider);

        // Sync based on provider
        let itemsSynced = 0;
        switch (provider) {
          case 'github':
            itemsSynced = await this.syncGitHub(userId, token);
            break;
          case 'notion':
            itemsSynced = await this.syncNotion(userId, token);
            break;
          case 'slack':
            itemsSynced = await this.syncSlack(userId, token);
            break;
          case 'calendar':
            itemsSynced = await this.syncCalendar(userId, token);
            break;
          default:
            throw new Error(`Unknown provider: ${provider}`);
        }

        const duration = Date.now() - startTime;

        // Log sync success
        await this.logSyncComplete(syncLogId, 'success', itemsSynced, duration);

        // Update last sync timestamp
        await this.updateLastSyncTimestamp(userId, provider);

        console.log(`✅ Sync completed for ${provider}: ${itemsSynced} items in ${duration}ms`);

        return {
          provider,
          success: true,
          itemsSynced,
          duration,
        };
      } catch (error) {
        attempt++;
        const duration = Date.now() - startTime;

        // Check if error is retryable
        const isRetryable = this.isRetryableError(error);
        const shouldRetry = isRetryable && attempt < this.maxRetries;

        console.error(
          `❌ Sync failed for ${provider} (attempt ${attempt}/${this.maxRetries}):`,
          error
        );

        if (!shouldRetry) {
          // Log final failure
          await this.logSyncFailure(userId, provider, error, duration);

          return {
            provider,
            success: false,
            itemsSynced: 0,
            error: error instanceof Error ? error.message : 'Unknown error',
            duration,
          };
        }

        // Calculate backoff delay
        const backoffDelay = this.calculateBackoff(attempt, error);
        console.log(`⏳ Retrying in ${backoffDelay}ms...`);
        await this.sleep(backoffDelay);
      }
    }

    // Should never reach here, but TypeScript needs it
    const duration = Date.now() - startTime;
    return {
      provider,
      success: false,
      itemsSynced: 0,
      error: 'Max retries exceeded',
      duration,
    };
  }

  /**
   * Sync all connected providers for a user
   * 
   * @param userId - User ID to sync data for
   * @returns Array of sync results for each provider
   */
  async syncAllProviders(userId: string): Promise<SyncResult[]> {
    console.log(`🔄 Starting sync for all providers for user ${userId}`);

    // Get connected providers
    const connectedProviders = await this.getConnectedProviders(userId);

    if (connectedProviders.length === 0) {
      console.log('ℹ️  No connected providers found');
      return [];
    }

    // Sync all providers in parallel
    const results = await Promise.all(
      connectedProviders.map((provider) => this.syncProvider(userId, provider))
    );

    const successCount = results.filter((r) => r.success).length;
    console.log(`✅ Sync completed: ${successCount}/${results.length} providers successful`);

    return results;
  }

  /**
   * Get sync status for a provider
   * 
   * @param userId - User ID
   * @param provider - Integration provider
   * @returns Current sync status
   */
  async getSyncStatus(userId: string, provider: IntegrationProvider): Promise<SyncStatus> {
    try {
      // Get last sync timestamp
      const { data: integration } = await supabaseAdmin
        .from('integrations')
        .select(`last_${provider}_sync`)
        .eq('user_id', userId)
        .single();

      const lastSyncField = `last_${provider}_sync`;
      const integrationRecord = integration as any;
      const lastSync = integrationRecord?.[lastSyncField]
        ? new Date(integrationRecord[lastSyncField])
        : undefined;

      // Get last sync log
      const { data: lastLog } = await supabaseAdmin
        .from('integration_sync_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('provider', provider)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      return {
        provider,
        lastSync,
        status: lastLog?.status === 'success' ? 'success' : lastLog?.status === 'failed' ? 'error' : 'idle',
        lastError: lastLog?.error_message,
        itemsSynced: lastLog?.items_synced,
      };
    } catch (error) {
      console.error(`Failed to get sync status for ${provider}:`, error);
      return {
        provider,
        status: 'idle',
      };
    }
  }

  /**
   * Get valid token with automatic refresh
   */
  private async getValidTokenWithRefresh(
    userId: string,
    provider: IntegrationProvider
  ): Promise<string> {
    const refreshCallback = async (refreshToken: string) => {
      return await this.oauthManager.refreshAccessToken(provider, refreshToken);
    };

    return await tokenManager.getValidToken(userId, provider, refreshCallback);
  }

  /**
   * Sync GitHub data
   */
  private async syncGitHub(userId: string, token: string): Promise<number> {
    const client = new GitHubClient(token);

    // Get last sync time
    const lastSync = await this.getLastSyncTime(userId, 'github');
    const since = lastSync || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default 30 days

    // Fetch data
    const [commits, pullRequests, issues] = await Promise.all([
      client.getCommits(since),
      client.getPullRequests(since),
      client.getIssues(since),
    ]);

    // Transform and store
    const activities: ActivityRecord[] = [
      ...this.transformGitHubCommits(userId, commits),
      ...this.transformGitHubPullRequests(userId, pullRequests),
      ...this.transformGitHubIssues(userId, issues),
    ];

    await this.storeActivities(activities);

    return activities.length;
  }

  /**
   * Sync Notion data
   */
  private async syncNotion(userId: string, token: string): Promise<number> {
    const client = new NotionClient(token);

    // Get last sync time
    const lastSync = await this.getLastSyncTime(userId, 'notion');
    const since = lastSync || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Fetch recent pages
    const pages = await client.getRecentPages(since);

    // Transform and store
    const activities = this.transformNotionPages(userId, pages);
    await this.storeActivities(activities);

    return activities.length;
  }

  /**
   * Sync Slack data
   */
  private async syncSlack(userId: string, token: string): Promise<number> {
    const client = new SlackClient(token);

    // Get last sync time
    const lastSync = await this.getLastSyncTime(userId, 'slack');
    const since = lastSync || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Fetch user activity
    const activity = await client.getUserActivity(since);

    // Transform and store
    const activities = this.transformSlackActivity(userId, activity);
    await this.storeActivities(activities);

    return activities.length;
  }

  /**
   * Sync Google Calendar data
   */
  private async syncCalendar(userId: string, token: string): Promise<number> {
    const client = new CalendarClient(token);

    // Get last sync time
    const lastSync = await this.getLastSyncTime(userId, 'calendar');
    const since = lastSync || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Fetch events
    const events = await client.getEvents(since);

    // Transform and store
    const activities = this.transformCalendarEvents(userId, events);
    await this.storeActivities(activities);

    return activities.length;
  }

  /**
   * Transform GitHub commits to activity records
   */
  private transformGitHubCommits(userId: string, commits: GitHubCommit[]): ActivityRecord[] {
    return commits.map((commit) => ({
      user_id: userId,
      type: 'commit',
      title: commit.message.split('\n')[0], // First line only
      description: commit.message,
      source: 'github' as IntegrationProvider,
      external_id: commit.sha,
      external_url: commit.url,
      metadata: {
        repository: commit.repository,
        author: commit.author,
      },
      created_at: commit.author.date,
    }));
  }

  /**
   * Transform GitHub pull requests to activity records
   */
  private transformGitHubPullRequests(
    userId: string,
    pullRequests: GitHubPullRequest[]
  ): ActivityRecord[] {
    return pullRequests.map((pr) => ({
      user_id: userId,
      type: 'pull_request',
      title: pr.title,
      description: `PR #${pr.number} - ${pr.state}`,
      source: 'github' as IntegrationProvider,
      external_id: `pr-${pr.number}`,
      external_url: pr.url,
      metadata: {
        repository: pr.repository,
        number: pr.number,
        state: pr.state,
        additions: pr.additions,
        deletions: pr.deletions,
        merged_at: pr.merged_at,
      },
      created_at: pr.created_at,
    }));
  }

  /**
   * Transform GitHub issues to activity records
   */
  private transformGitHubIssues(userId: string, issues: GitHubIssue[]): ActivityRecord[] {
    return issues.map((issue) => ({
      user_id: userId,
      type: 'issue',
      title: issue.title,
      description: `Issue #${issue.number} - ${issue.state}`,
      source: 'github' as IntegrationProvider,
      external_id: `issue-${issue.number}`,
      external_url: issue.url,
      metadata: {
        repository: issue.repository,
        number: issue.number,
        state: issue.state,
        labels: issue.labels,
        assignees: issue.assignees,
        closed_at: issue.closed_at,
      },
      created_at: issue.created_at,
    }));
  }

  /**
   * Transform Notion pages to activity records
   */
  private transformNotionPages(userId: string, pages: NotionPage[]): ActivityRecord[] {
    return pages.map((page) => ({
      user_id: userId,
      type: 'notion_page',
      title: page.title,
      description: `Notion page edited`,
      source: 'notion' as IntegrationProvider,
      external_id: page.id,
      external_url: page.url,
      metadata: {
        parentDatabase: page.parentDatabase,
      },
      created_at: page.lastEditedTime.toISOString(),
    }));
  }

  /**
   * Transform Slack activity to activity records
   */
  private transformSlackActivity(userId: string, activity: SlackActivity): ActivityRecord[] {
    const activities: ActivityRecord[] = [];

    // Create activity record for overall Slack activity
    if (activity.messageCount > 0 || activity.dmCount > 0) {
      activities.push({
        user_id: userId,
        type: 'slack_activity',
        title: `Slack Activity: ${activity.messageCount} messages`,
        description: `Sent ${activity.messageCount} messages in channels and ${activity.dmCount} DMs`,
        source: 'slack' as IntegrationProvider,
        external_id: `slack-${Date.now()}`,
        metadata: {
          messageCount: activity.messageCount,
          dmCount: activity.dmCount,
          reactionsGiven: activity.reactionsGiven,
          channelParticipation: activity.channelParticipation,
        },
        created_at: new Date().toISOString(),
      });
    }

    return activities;
  }

  /**
   * Transform Calendar events to activity records
   */
  private transformCalendarEvents(userId: string, events: CalendarEvent[]): ActivityRecord[] {
    return events.map((event) => ({
      user_id: userId,
      type: 'calendar_event',
      title: event.title,
      description: `Meeting (${event.duration} min, ${event.attendeeCount} attendees)`,
      source: 'calendar' as IntegrationProvider,
      external_id: event.id,
      external_url: event.url,
      metadata: {
        start: event.start.toISOString(),
        end: event.end.toISOString(),
        duration: event.duration,
        attendeeCount: event.attendeeCount,
        isOrganizer: event.isOrganizer,
        location: event.location,
      },
      created_at: event.start.toISOString(),
    }));
  }

  /**
   * Store activity records in database
   */
  private async storeActivities(activities: ActivityRecord[]): Promise<void> {
    if (activities.length === 0) {
      return;
    }

    // Use upsert to avoid duplicates based on external_id
    const { error } = await supabaseAdmin
      .from('activities')
      .upsert(activities, {
        onConflict: 'user_id,external_id',
        ignoreDuplicates: true,
      });

    if (error) {
      console.error('Failed to store activities:', error);
      throw new Error(`Failed to store activities: ${error.message}`);
    }
  }

  /**
   * Get last sync time for a provider
   */
  private async getLastSyncTime(
    userId: string,
    provider: IntegrationProvider
  ): Promise<Date | null> {
    try {
      const { data } = await supabaseAdmin
        .from('integrations')
        .select(`last_${provider}_sync`)
        .eq('user_id', userId)
        .single();

      const lastSyncField = `last_${provider}_sync`;
      const record = data as any;
      const lastSync = record?.[lastSyncField];

      return lastSync ? new Date(lastSync) : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Update last sync timestamp
   */
  private async updateLastSyncTimestamp(
    userId: string,
    provider: IntegrationProvider
  ): Promise<void> {
    const updateData = {
      [`last_${provider}_sync`]: new Date().toISOString(),
    };

    await supabaseAdmin
      .from('integrations')
      .update(updateData)
      .eq('user_id', userId);
  }

  /**
   * Get list of connected providers for a user
   */
  private async getConnectedProviders(userId: string): Promise<IntegrationProvider[]> {
    const { data } = await supabaseAdmin
      .from('integrations')
      .select('github_connected, notion_connected, slack_connected, calendar_connected')
      .eq('user_id', userId)
      .single();

    if (!data) {
      return [];
    }

    const providers: IntegrationProvider[] = [];
    if (data.github_connected) providers.push('github');
    if (data.notion_connected) providers.push('notion');
    if (data.slack_connected) providers.push('slack');
    if (data.calendar_connected) providers.push('calendar');

    return providers;
  }

  /**
   * Log sync start
   */
  private async logSyncStart(userId: string, provider: IntegrationProvider): Promise<string> {
    const { data, error } = await supabaseAdmin
      .from('integration_sync_logs')
      .insert({
        user_id: userId,
        provider,
        status: 'syncing',
        started_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error || !data) {
      console.error('Failed to log sync start:', error);
      return '';
    }

    return data.id;
  }

  /**
   * Log sync completion
   */
  private async logSyncComplete(
    syncLogId: string,
    status: 'success' | 'failed' | 'partial',
    itemsSynced: number,
    durationMs: number
  ): Promise<void> {
    if (!syncLogId) return;

    await supabaseAdmin
      .from('integration_sync_logs')
      .update({
        status,
        items_synced: itemsSynced,
        duration_ms: durationMs,
        completed_at: new Date().toISOString(),
      })
      .eq('id', syncLogId);
  }

  /**
   * Log sync failure
   */
  private async logSyncFailure(
    userId: string,
    provider: IntegrationProvider,
    error: unknown,
    durationMs: number
  ): Promise<void> {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    await supabaseAdmin
      .from('integration_sync_logs')
      .insert({
        user_id: userId,
        provider,
        status: 'failed',
        error_message: errorMessage,
        duration_ms: durationMs,
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      });
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: unknown): boolean {
    if (error instanceof IntegrationError) {
      return error.retryable;
    }

    // Network errors are generally retryable
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      return (
        message.includes('network') ||
        message.includes('timeout') ||
        message.includes('rate limit') ||
        message.includes('econnreset') ||
        message.includes('enotfound')
      );
    }

    return false;
  }

  /**
   * Calculate backoff delay with exponential backoff
   */
  private calculateBackoff(attempt: number, error: unknown): number {
    // Check if it's a rate limit error
    if (error instanceof IntegrationError && error.code === 'RATE_LIMIT') {
      // For rate limits, use longer backoff
      const delays = [60000, 300000, 3600000]; // 1min, 5min, 1hr
      return delays[Math.min(attempt - 1, delays.length - 1)];
    }

    // Standard exponential backoff: 1s, 2s, 4s
    return this.baseBackoffMs * Math.pow(2, attempt - 1);
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Check health of a specific integration
   * 
   * Requirements: 7.1, 7.2, 7.4, 7.5
   * 
   * @param userId - User ID
   * @param provider - Integration provider to check
   * @returns Health status with any detected issues
   */
  async checkIntegrationHealth(
    userId: string,
    provider: IntegrationProvider
  ): Promise<IntegrationHealth> {
    const issues: HealthIssue[] = [];
    const lastChecked = new Date();

    try {
      // Check for consecutive failures (3+)
      const consecutiveFailures = await this.checkConsecutiveFailures(userId, provider);
      if (consecutiveFailures >= 3) {
        issues.push({
          type: 'consecutive_failures',
          severity: 'error',
          message: `${consecutiveFailures} consecutive sync failures detected`,
          details: { count: consecutiveFailures },
        });
        
        // Create notification for consecutive failures
        await notificationService.notifySyncFailures(userId, provider, consecutiveFailures);
      }

      // Check for expired tokens
      const tokenExpired = await this.checkTokenExpiration(userId, provider);
      if (tokenExpired) {
        issues.push({
          type: 'token_expired',
          severity: 'error',
          message: 'Access token has expired',
        });
        
        // Create notification for token expiration
        await notificationService.notifyTokenExpired(userId, provider);
      }

      // Check if connection requires reauthorization
      const needsReauth = await this.checkReauthorizationRequired(userId, provider);
      if (needsReauth) {
        issues.push({
          type: 'reauth_required',
          severity: 'warning',
          message: 'Connection requires reauthorization',
        });
        
        // Create notification for reauthorization
        await notificationService.notifyReauthorizationRequired(userId, provider);
      }

      // Log health check result
      await this.logHealthCheck(userId, provider, issues);

      return {
        provider,
        healthy: issues.length === 0,
        issues,
        lastChecked,
      };
    } catch (error) {
      console.error(`Failed to check health for ${provider}:`, error);
      return {
        provider,
        healthy: false,
        issues: [
          {
            type: 'reauth_required',
            severity: 'error',
            message: 'Failed to check integration health',
            details: { error: error instanceof Error ? error.message : 'Unknown error' },
          },
        ],
        lastChecked,
      };
    }
  }

  /**
   * Check health of all connected integrations
   * 
   * Requirements: 7.1, 7.2, 7.4, 7.5
   * 
   * @param userId - User ID
   * @returns Array of health statuses for all connected integrations
   */
  async checkAllIntegrationsHealth(userId: string): Promise<IntegrationHealth[]> {
    const connectedProviders = await this.getConnectedProviders(userId);

    if (connectedProviders.length === 0) {
      return [];
    }

    const healthChecks = await Promise.all(
      connectedProviders.map((provider) => this.checkIntegrationHealth(userId, provider))
    );

    return healthChecks;
  }

  /**
   * Check for consecutive sync failures
   * 
   * @param userId - User ID
   * @param provider - Integration provider
   * @returns Number of consecutive failures
   */
  private async checkConsecutiveFailures(
    userId: string,
    provider: IntegrationProvider
  ): Promise<number> {
    try {
      // Get recent sync logs ordered by most recent first
      const { data: logs } = await supabaseAdmin
        .from('integration_sync_logs')
        .select('status')
        .eq('user_id', userId)
        .eq('provider', provider)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!logs || logs.length === 0) {
        return 0;
      }

      // Count consecutive failures from the most recent
      let consecutiveFailures = 0;
      for (const log of logs) {
        if (log.status === 'failed') {
          consecutiveFailures++;
        } else if (log.status === 'success') {
          // Stop counting when we hit a success
          break;
        }
      }

      return consecutiveFailures;
    } catch (error) {
      console.error('Failed to check consecutive failures:', error);
      return 0;
    }
  }

  /**
   * Check if token is expired
   * 
   * @param userId - User ID
   * @param provider - Integration provider
   * @returns True if token is expired
   */
  private async checkTokenExpiration(
    userId: string,
    provider: IntegrationProvider
  ): Promise<boolean> {
    try {
      const { data: integration } = await supabaseAdmin
        .from('integrations')
        .select(`${provider}_token_expires_at`)
        .eq('user_id', userId)
        .single();

      if (!integration) {
        return false;
      }

      const expiresAtField = `${provider}_token_expires_at`;
      const integrationRecord = integration as any;
      const expiresAt = integrationRecord?.[expiresAtField];

      if (!expiresAt) {
        // No expiration time means token doesn't expire or not set
        return false;
      }

      const expirationDate = new Date(expiresAt);
      const now = new Date();

      // Consider expired if within 5 minutes of expiration
      return expirationDate.getTime() - now.getTime() < 5 * 60 * 1000;
    } catch (error) {
      console.error('Failed to check token expiration:', error);
      return false;
    }
  }

  /**
   * Check if connection requires reauthorization
   * 
   * @param userId - User ID
   * @param provider - Integration provider
   * @returns True if reauthorization is required
   */
  private async checkReauthorizationRequired(
    userId: string,
    provider: IntegrationProvider
  ): Promise<boolean> {
    try {
      // Check if token exists
      const token = await tokenManager.getToken(userId, provider);
      if (!token) {
        return true;
      }

      // Check recent sync logs for auth errors
      const { data: recentLogs } = await supabaseAdmin
        .from('integration_sync_logs')
        .select('error_message')
        .eq('user_id', userId)
        .eq('provider', provider)
        .eq('status', 'failed')
        .order('created_at', { ascending: false })
        .limit(3);

      if (!recentLogs || recentLogs.length === 0) {
        return false;
      }

      // Check if any recent errors indicate auth issues
      const authErrorKeywords = [
        'unauthorized',
        'authentication',
        'invalid token',
        'token expired',
        'access denied',
        '401',
        '403',
      ];

      return recentLogs.some((log) => {
        const errorMessage = log.error_message?.toLowerCase() || '';
        return authErrorKeywords.some((keyword) => errorMessage.includes(keyword));
      });
    } catch (error) {
      console.error('Failed to check reauthorization requirement:', error);
      return false;
    }
  }

  /**
   * Log health check result
   * 
   * @param userId - User ID
   * @param provider - Integration provider
   * @param issues - Detected health issues
   */
  private async logHealthCheck(
    userId: string,
    provider: IntegrationProvider,
    issues: HealthIssue[]
  ): Promise<void> {
    try {
      // Only log if there are issues
      if (issues.length === 0) {
        return;
      }

      console.log(`🏥 Health check for ${provider}:`, {
        userId,
        healthy: issues.length === 0,
        issues: issues.map((i) => i.message),
      });

      // Could store health check results in a separate table if needed
      // For now, just console logging
    } catch (error) {
      console.error('Failed to log health check:', error);
    }
  }
}

// Export singleton instance
export const syncService = new SyncService();
