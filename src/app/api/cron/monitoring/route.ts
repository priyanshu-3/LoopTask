import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { cronMonitoring } from '@/lib/integrations/cron-monitoring';

/**
 * GET /api/cron/monitoring
 * 
 * Get monitoring dashboard data for cron jobs
 * Includes statistics, alerts, and recent executions
 * 
 * Query params:
 * - timeRange: Time range in hours (default: 24)
 * 
 * Requirements: 7.5
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get time range from query params
    const url = new URL(request.url);
    const timeRange = parseInt(url.searchParams.get('timeRange') || '24', 10);

    // Validate time range
    if (isNaN(timeRange) || timeRange < 1 || timeRange > 168) {
      return NextResponse.json(
        { error: 'Invalid time range. Must be between 1 and 168 hours.' },
        { status: 400 }
      );
    }

    // Get dashboard data
    const dashboardData = await cronMonitoring.getDashboardData(timeRange);

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Failed to get monitoring data:', error);
    return NextResponse.json(
      {
        error: 'Failed to get monitoring data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cron/monitoring/cleanup
 * 
 * Clean up old cron job execution logs
 * 
 * Body:
 * - retentionDays: Number of days to retain logs (default: 30)
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get retention days from body
    const body = await request.json();
    const retentionDays = body.retentionDays || 30;

    // Validate retention days
    if (isNaN(retentionDays) || retentionDays < 1 || retentionDays > 365) {
      return NextResponse.json(
        { error: 'Invalid retention days. Must be between 1 and 365.' },
        { status: 400 }
      );
    }

    // Clean up old logs
    const deletedCount = await cronMonitoring.cleanupOldLogs(retentionDays);

    return NextResponse.json({
      message: 'Cleanup completed',
      deletedCount,
      retentionDays,
    });
  } catch (error) {
    console.error('Failed to cleanup logs:', error);
    return NextResponse.json(
      {
        error: 'Failed to cleanup logs',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
