import { createClient } from '@supabase/supabase-js';
import { IntegrationProvider } from '@/types/integration';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface IntegrationAnalytics {
  provider: IntegrationProvider;
  totalActivities: number;
  last7Days: number;
  last30Days: number;
  allTime: number;
  lastSync?: Date;
  distribution: {
    commits?: number;
    prs?: number;
    reviews?: number;
    meetings?: number;
    pages?: number;
    messages?: number;
  };
}

export interface ActivityDistribution {
  github: number;
  notion: number;
  slack: number;
  calendar: number;
}

export interface TimePeriodStats {
  period: '7d' | '30d' | 'all';
  totalActivities: number;
  byProvider: ActivityDistribution;
}

/**
 * Calculate activity count for a specific integration provider
 */
export async function calculateProviderActivityCount(
  userId: string,
  provider: IntegrationProvider,
  since?: Date
): Promise<number> {
  let query = supabase
    .from('activities')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('source', provider);

  if (since) {
    query = query.gte('created_at', since.toISOString());
  }

  const { count, error } = await query;

  if (error) {
    console.error(`Error calculating activity count for ${provider}:`, error);
    return 0;
  }

  return count || 0;
}

/**
 * Calculate activity counts for multiple time periods
 */
export async function calculateTimePeriodCounts(
  userId: string,
  provider: IntegrationProvider
): Promise<{ last7Days: number; last30Days: number; allTime: number }> {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [last7Days, last30Days, allTime] = await Promise.all([
    calculateProviderActivityCount(userId, provider, sevenDaysAgo),
    calculateProviderActivityCount(userId, provider, thirtyDaysAgo),
    calculateProviderActivityCount(userId, provider),
  ]);

  return { last7Days, last30Days, allTime };
}

/**
 * Get activity distribution breakdown by type for a provider
 */
export async function getActivityDistribution(
  userId: string,
  provider: IntegrationProvider,
  since?: Date
): Promise<Record<string, number>> {
  let query = supabase
    .from('activities')
    .select('type')
    .eq('user_id', userId)
    .eq('source', provider);

  if (since) {
    query = query.gte('created_at', since.toISOString());
  }

  const { data, error } = await query;

  if (error) {
    console.error(`Error getting activity distribution for ${provider}:`, error);
    return {};
  }

  // Count activities by type
  const distribution: Record<string, number> = {};
  data?.forEach((activity) => {
    const type = activity.type || 'other';
    distribution[type] = (distribution[type] || 0) + 1;
  });

  return distribution;
}

/**
 * Get last sync timestamp for a provider
 */
export async function getLastSyncTimestamp(
  userId: string,
  provider: IntegrationProvider
): Promise<Date | null> {
  const columnMap: Record<IntegrationProvider, string> = {
    github: 'last_github_sync',
    notion: 'last_notion_sync',
    slack: 'last_slack_sync',
    calendar: 'last_calendar_sync',
  };

  const column = columnMap[provider];

  const { data, error } = await supabase
    .from('integrations')
    .select(column)
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return null;
  }

  const timestamp = (data as any)[column];
  return timestamp ? new Date(timestamp) : null;
}

/**
 * Get comprehensive analytics for a specific provider
 */
export async function getProviderAnalytics(
  userId: string,
  provider: IntegrationProvider
): Promise<IntegrationAnalytics> {
  const [timePeriods, distribution, lastSync] = await Promise.all([
    calculateTimePeriodCounts(userId, provider),
    getActivityDistribution(userId, provider),
    getLastSyncTimestamp(userId, provider),
  ]);

  return {
    provider,
    totalActivities: timePeriods.allTime,
    last7Days: timePeriods.last7Days,
    last30Days: timePeriods.last30Days,
    allTime: timePeriods.allTime,
    lastSync: lastSync || undefined,
    distribution,
  };
}

/**
 * Get analytics for all providers
 */
export async function getAllProvidersAnalytics(
  userId: string
): Promise<IntegrationAnalytics[]> {
  const providers: IntegrationProvider[] = ['github', 'notion', 'slack', 'calendar'];

  const analytics = await Promise.all(
    providers.map((provider) => getProviderAnalytics(userId, provider))
  );

  return analytics;
}

/**
 * Get activity distribution across all providers for a time period
 */
export async function getActivityDistributionByProvider(
  userId: string,
  period: '7d' | '30d' | 'all'
): Promise<TimePeriodStats> {
  const now = new Date();
  let since: Date | undefined;

  if (period === '7d') {
    since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (period === '30d') {
    since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  const providers: IntegrationProvider[] = ['github', 'notion', 'slack', 'calendar'];

  const counts = await Promise.all(
    providers.map((provider) => calculateProviderActivityCount(userId, provider, since))
  );

  const byProvider: ActivityDistribution = {
    github: counts[0],
    notion: counts[1],
    slack: counts[2],
    calendar: counts[3],
  };

  const totalActivities = counts.reduce((sum, count) => sum + count, 0);

  return {
    period,
    totalActivities,
    byProvider,
  };
}

/**
 * Update analytics after sync completion
 * This function can be called after a successful sync to refresh cached analytics
 */
export async function updateAnalyticsAfterSync(
  userId: string,
  provider: IntegrationProvider,
  itemsSynced: number
): Promise<void> {
  // Update last sync timestamp
  const columnMap: Record<IntegrationProvider, string> = {
    github: 'last_github_sync',
    notion: 'last_notion_sync',
    slack: 'last_slack_sync',
    calendar: 'last_calendar_sync',
  };

  const column = columnMap[provider];

  const { error } = await supabase
    .from('integrations')
    .update({ [column]: new Date().toISOString() })
    .eq('user_id', userId);

  if (error) {
    console.error(`Error updating last sync timestamp for ${provider}:`, error);
  }

  // Note: Activity counts are calculated on-demand from the activities table,
  // so no additional updates are needed. The new activities will automatically
  // be included in future analytics queries.
}

/**
 * Get sync statistics for a provider
 */
export async function getSyncStatistics(
  userId: string,
  provider: IntegrationProvider,
  limit: number = 10
): Promise<{
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  averageDuration: number;
  recentSyncs: Array<{
    status: string;
    itemsSynced: number;
    duration: number;
    timestamp: Date;
  }>;
}> {
  const { data: logs, error } = await supabase
    .from('integration_sync_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('provider', provider)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error || !logs) {
    return {
      totalSyncs: 0,
      successfulSyncs: 0,
      failedSyncs: 0,
      averageDuration: 0,
      recentSyncs: [],
    };
  }

  const totalSyncs = logs.length;
  const successfulSyncs = logs.filter((log) => log.status === 'success').length;
  const failedSyncs = logs.filter((log) => log.status === 'failed').length;

  const durations = logs
    .filter((log) => log.duration_ms)
    .map((log) => log.duration_ms);
  const averageDuration =
    durations.length > 0
      ? durations.reduce((sum, d) => sum + d, 0) / durations.length
      : 0;

  const recentSyncs = logs.slice(0, limit).map((log) => ({
    status: log.status,
    itemsSynced: log.items_synced || 0,
    duration: log.duration_ms || 0,
    timestamp: new Date(log.created_at),
  }));

  return {
    totalSyncs,
    successfulSyncs,
    failedSyncs,
    averageDuration,
    recentSyncs,
  };
}
