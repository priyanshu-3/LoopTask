import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { syncService } from '@/lib/integrations/sync-service';
import { IntegrationProvider } from '@/lib/integrations/token-manager';

/**
 * Cron job for scheduled background sync of integrations
 * 
 * This endpoint is called by Vercel Cron Jobs to automatically sync
 * integration data for all users with active connections.
 * 
 * Sync intervals:
 * - GitHub: Every 15 minutes
 * - Notion, Slack, Calendar: Every 30 minutes
 * 
 * Requirements: 2.4, 3.4, 4.4, 5.4
 */

interface CronJobExecution {
  id: string;
  job_name: string;
  started_at: string;
  completed_at?: string;
  status: 'running' | 'success' | 'failed';
  users_processed: number;
  providers_synced: number;
  success_count: number;
  failure_count: number;
  error_message?: string;
  duration_ms?: number;
}

/**
 * POST /api/cron/sync-integrations
 * 
 * Triggered by Vercel Cron Jobs to sync all users' integrations
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.error('❌ Unauthorized cron job access attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🔄 Starting scheduled integration sync...');

    // Determine which providers to sync based on interval
    const providers = getProvidersToSync(request);
    
    if (providers.length === 0) {
      console.log('ℹ️  No providers to sync for this interval');
      return NextResponse.json({
        message: 'No providers to sync',
        providers: [],
      });
    }

    console.log(`📋 Syncing providers: ${providers.join(', ')}`);

    // Log job execution start
    const jobExecutionId = await logJobStart('sync-integrations', providers);

    // Get all users with active integrations for the specified providers
    const users = await getUsersWithActiveIntegrations(providers);
    
    console.log(`👥 Found ${users.length} users with active integrations`);

    if (users.length === 0) {
      await logJobComplete(jobExecutionId, 'success', 0, 0, 0, 0, Date.now() - startTime);
      return NextResponse.json({
        message: 'No users with active integrations',
        usersProcessed: 0,
        providersSync: 0,
      });
    }

    // Sync integrations for all users
    let totalSyncs = 0;
    let successCount = 0;
    let failureCount = 0;

    for (const user of users) {
      try {
        console.log(`🔄 Syncing integrations for user ${user.user_id}...`);
        
        // Sync only the specified providers for this user
        const userProviders = providers.filter(provider => 
          user[`${provider}_connected`] === true
        );

        for (const provider of userProviders) {
          const result = await syncService.syncProvider(user.user_id, provider);
          totalSyncs++;
          
          if (result.success) {
            successCount++;
            console.log(`✅ Synced ${provider} for user ${user.user_id}: ${result.itemsSynced} items`);
          } else {
            failureCount++;
            console.error(`❌ Failed to sync ${provider} for user ${user.user_id}: ${result.error}`);
          }
        }
      } catch (error) {
        failureCount++;
        console.error(`❌ Error syncing user ${user.user_id}:`, error);
      }
    }

    const duration = Date.now() - startTime;
    
    // Log job completion
    await logJobComplete(
      jobExecutionId,
      'success',
      users.length,
      totalSyncs,
      successCount,
      failureCount,
      duration
    );

    console.log(`✅ Scheduled sync completed: ${successCount}/${totalSyncs} successful in ${duration}ms`);

    return NextResponse.json({
      message: 'Sync completed',
      usersProcessed: users.length,
      providersSync: totalSyncs,
      successCount,
      failureCount,
      durationMs: duration,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('❌ Cron job failed:', error);
    
    // Log job failure
    await logJobFailure('sync-integrations', error, duration);

    return NextResponse.json(
      {
        error: 'Sync failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Determine which providers to sync based on the request
 * 
 * GitHub syncs every 15 minutes
 * Notion, Slack, Calendar sync every 30 minutes
 */
function getProvidersToSync(request: NextRequest): IntegrationProvider[] {
  const url = new URL(request.url);
  const interval = url.searchParams.get('interval');

  // If interval is specified in query params, use it
  if (interval === '15min') {
    return ['github'];
  } else if (interval === '30min') {
    return ['notion', 'slack', 'calendar'];
  }

  // Default: sync all providers (for manual triggers)
  return ['github', 'notion', 'slack', 'calendar'];
}

/**
 * Get all users with active integrations for specified providers
 */
async function getUsersWithActiveIntegrations(
  providers: IntegrationProvider[]
): Promise<any[]> {
  try {
    // Build the query to find users with any of the specified providers connected
    let query = supabaseAdmin
      .from('integrations')
      .select('user_id, github_connected, notion_connected, slack_connected, calendar_connected');

    // Add OR conditions for each provider
    const orConditions = providers.map(provider => `${provider}_connected.eq.true`).join(',');
    query = query.or(orConditions);

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch users with active integrations:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

/**
 * Log cron job execution start
 */
async function logJobStart(
  jobName: string,
  providers: IntegrationProvider[]
): Promise<string> {
  try {
    const { data, error } = await supabaseAdmin
      .from('cron_job_executions')
      .insert({
        job_name: jobName,
        started_at: new Date().toISOString(),
        status: 'running',
        users_processed: 0,
        providers_synced: 0,
        success_count: 0,
        failure_count: 0,
        metadata: { providers },
      })
      .select('id')
      .single();

    if (error || !data) {
      console.error('Failed to log job start:', error);
      return '';
    }

    return data.id;
  } catch (error) {
    console.error('Error logging job start:', error);
    return '';
  }
}

/**
 * Log cron job completion
 */
async function logJobComplete(
  jobExecutionId: string,
  status: 'success' | 'failed',
  usersProcessed: number,
  providersSync: number,
  successCount: number,
  failureCount: number,
  durationMs: number
): Promise<void> {
  if (!jobExecutionId) return;

  try {
    await supabaseAdmin
      .from('cron_job_executions')
      .update({
        status,
        users_processed: usersProcessed,
        providers_synced: providersSync,
        success_count: successCount,
        failure_count: failureCount,
        duration_ms: durationMs,
        completed_at: new Date().toISOString(),
      })
      .eq('id', jobExecutionId);
  } catch (error) {
    console.error('Error logging job completion:', error);
  }
}

/**
 * Log cron job failure
 */
async function logJobFailure(
  jobName: string,
  error: unknown,
  durationMs: number
): Promise<void> {
  try {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    await supabaseAdmin
      .from('cron_job_executions')
      .insert({
        job_name: jobName,
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        status: 'failed',
        users_processed: 0,
        providers_synced: 0,
        success_count: 0,
        failure_count: 0,
        error_message: errorMessage,
        duration_ms: durationMs,
      });
  } catch (err) {
    console.error('Error logging job failure:', err);
  }
}
