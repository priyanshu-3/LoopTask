import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { syncService } from '@/lib/integrations/sync-service';
import { IntegrationProvider } from '@/lib/integrations/token-manager';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { validateProvider, validateUserId } from '@/lib/integrations/validation';

// Cache status data for 30 seconds
const statusCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 30000; // 30 seconds

/**
 * GET /api/integrations/[provider]/status
 * 
 * Get sync status and history for a specific integration provider
 * 
 * Requirements: 9.1, 9.2, 7.5
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ provider: string }> }
) {
  try {
    // Await params
    const params = await context.params;

    // Authenticate user
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (userError || !user) {
      console.error('User not found:', userError);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userId = user.id;

    // Validate user ID
    const userIdValidation = validateUserId(userId);
    if (!userIdValidation.valid) {
      return NextResponse.json(
        { error: userIdValidation.error },
        { status: 400 }
      );
    }

    // Validate provider
    const providerValidation = validateProvider(params.provider);
    if (!providerValidation.valid) {
      return NextResponse.json(
        { error: providerValidation.error },
        { status: 400 }
      );
    }

    const provider = providerValidation.provider!;

    // Check cache
    const cacheKey = `${userId}:${provider}`;
    const cached = statusCache.get(cacheKey);
    const now = Date.now();

    if (cached && (now - cached.timestamp) < CACHE_TTL) {
      return NextResponse.json(cached.data, {
        headers: {
          'Cache-Control': 'public, max-age=30',
          'X-Cache': 'HIT',
        },
      });
    }

    // Get sync status
    const status = await syncService.getSyncStatus(userId, provider);

    // Get recent sync logs (last 10)
    const { data: syncLogs, error: logsError } = await supabaseAdmin
      .from('integration_sync_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('provider', provider)
      .order('created_at', { ascending: false })
      .limit(10);

    if (logsError) {
      console.error('Failed to fetch sync logs:', logsError);
    }

    // Get activity count from last sync
    let activityCount = 0;
    if (status.lastSync) {
      const { count, error: countError } = await supabaseAdmin
        .from('activities')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('source', provider)
        .gte('created_at', status.lastSync.toISOString());

      if (!countError && count !== null) {
        activityCount = count;
      }
    }

    // Get total activity count for this provider
    const { count: totalCount, error: totalCountError } = await supabaseAdmin
      .from('activities')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('source', provider);

    const totalActivityCount = totalCountError ? 0 : (totalCount || 0);

    // Format response
    const responseData = {
      provider,
      status: status.status,
      lastSync: status.lastSync?.toISOString() || null,
      lastError: status.lastError || null,
      itemsSynced: status.itemsSynced || 0,
      activityCount,
      totalActivityCount,
      syncLogs: syncLogs?.map(log => ({
        id: log.id,
        status: log.status,
        itemsSynced: log.items_synced || 0,
        errorMessage: log.error_message || null,
        duration: log.duration_ms || 0,
        startedAt: log.started_at,
        completedAt: log.completed_at,
        createdAt: log.created_at,
      })) || [],
    };

    // Update cache
    statusCache.set(cacheKey, { data: responseData, timestamp: now });

    // Clean old cache entries (keep last 100)
    if (statusCache.size > 100) {
      const entries = Array.from(statusCache.entries());
      entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
      statusCache.clear();
      entries.slice(0, 100).forEach(([key, value]) => {
        statusCache.set(key, value);
      });
    }

    return NextResponse.json(responseData, {
      headers: {
        'Cache-Control': 'public, max-age=30',
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    console.error('Status endpoint error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to fetch sync status',
      },
      { status: 500 }
    );
  }
}
