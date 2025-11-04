import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { getActivityDistributionByProvider } from '@/lib/integrations/analytics';

// Cache analytics data for 60 seconds
const analyticsCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 60000; // 60 seconds

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get period from query params
    const searchParams = request.nextUrl.searchParams;
    const period = (searchParams.get('period') || '30d') as '7d' | '30d' | 'all';

    // Validate period
    if (!['7d', '30d', 'all'].includes(period)) {
      return NextResponse.json({ error: 'Invalid period' }, { status: 400 });
    }

    // Get user ID from session
    const userId = (session.user as any).id;

    // Check cache
    const cacheKey = `${userId}:${period}`;
    const cached = analyticsCache.get(cacheKey);
    const now = Date.now();

    if (cached && (now - cached.timestamp) < CACHE_TTL) {
      return NextResponse.json(cached.data, {
        headers: {
          'Cache-Control': 'public, max-age=60',
          'X-Cache': 'HIT',
        },
      });
    }

    // Get analytics data
    const analytics = await getActivityDistributionByProvider(userId, period);

    // Update cache
    analyticsCache.set(cacheKey, { data: analytics, timestamp: now });

    // Clean old cache entries (keep last 100)
    if (analyticsCache.size > 100) {
      const entries = Array.from(analyticsCache.entries());
      entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
      analyticsCache.clear();
      entries.slice(0, 100).forEach(([key, value]) => {
        analyticsCache.set(key, value);
      });
    }

    return NextResponse.json(analytics, {
      headers: {
        'Cache-Control': 'public, max-age=60',
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    console.error('Error fetching integration analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
