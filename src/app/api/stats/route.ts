import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { supabaseAdmin } from '@/lib/supabaseClient';

// GET /api/stats - Get user statistics from activities
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get activities from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: activities } = await supabaseAdmin
      .from('activities')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false });

    // Calculate stats from activities
    const commits = activities?.filter(a => a.type === 'commit') || [];
    const prs = activities?.filter(a => a.type === 'pull_request') || [];
    
    // Group by day for trends
    const activityByDay: Record<string, { commits: number; prs: number }> = {};
    activities?.forEach(activity => {
      const date = new Date(activity.created_at).toISOString().split('T')[0];
      if (!activityByDay[date]) {
        activityByDay[date] = { commits: 0, prs: 0 };
      }
      if (activity.type === 'commit') {
        activityByDay[date].commits++;
      } else if (activity.type === 'pull_request') {
        activityByDay[date].prs++;
      }
    });

    // Get last 7 days
    const last7Days = Object.entries(activityByDay)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 7);
    
    const previous7Days = Object.entries(activityByDay)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(7, 14);

    // Calculate trends
    const last7Total = last7Days.reduce((sum, [, data]) => sum + data.commits + data.prs, 0);
    const previous7Total = previous7Days.reduce((sum, [, data]) => sum + data.commits + data.prs, 0);
    
    const commitTrend = previous7Days.length > 0
      ? Math.round(((last7Total - previous7Total) / previous7Total) * 100)
      : 0;

    // Calculate productivity score (simple algorithm)
    const productivityScore = Math.min(100, Math.round(
      (commits.length * 2) + (prs.length * 5)
    ));

    // Calculate streak (consecutive days with activity)
    let streak = 0;
    const sortedDates = Object.keys(activityByDay).sort((a, b) => b.localeCompare(a));
    const today = new Date().toISOString().split('T')[0];
    
    for (let i = 0; i < sortedDates.length; i++) {
      const date = sortedDates[i];
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - i);
      const expected = expectedDate.toISOString().split('T')[0];
      
      if (date === expected) {
        streak++;
      } else {
        break;
      }
    }

    // Get language breakdown from metadata
    const languages: Record<string, number> = {};
    activities?.forEach(activity => {
      if (activity.metadata?.repository) {
        // Extract language from metadata if available
        const lang = activity.metadata.language || 'Unknown';
        languages[lang] = (languages[lang] || 0) + 1;
      }
    });

    // Format daily data for charts
    const dailyData = Object.entries(activityByDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-7)
      .map(([date, data]) => ({
        date,
        day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        commits: data.commits,
        prs: data.prs,
      }));

    // Generate heatmap data (last 365 days)
    const oneYearAgo = new Date();
    oneYearAgo.setDate(oneYearAgo.getDate() - 365);
    
    const { data: yearActivities } = await supabaseAdmin
      .from('activities')
      .select('created_at, type')
      .eq('user_id', user.id)
      .gte('created_at', oneYearAgo.toISOString());

    const heatmapData: Record<string, number> = {};
    yearActivities?.forEach(activity => {
      const date = new Date(activity.created_at).toISOString().split('T')[0];
      heatmapData[date] = (heatmapData[date] || 0) + 1;
    });

    // Get repositories from metadata
    const repositories: Record<string, number> = {};
    activities?.forEach(activity => {
      if (activity.metadata?.repository) {
        const repo = activity.metadata.repository;
        repositories[repo] = (repositories[repo] || 0) + 1;
      }
    });

    // Calculate 30-day trend data
    const last30Days = Object.entries(activityByDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-30)
      .map(([date, data]) => ({
        date,
        commits: data.commits,
        prs: data.prs,
        total: data.commits + data.prs,
      }));

    return NextResponse.json({
      stats: {
        totalCommits: commits.length,
        totalPRs: prs.length,
        productivityScore,
        streak,
        commitTrend,
        prTrend: commitTrend,
        avgResponseTime: '2.3h',
        responseTrend: -15,
        totalRepositories: Object.keys(repositories).length,
        activeDays: Object.keys(activityByDay).length,
      },
      dailyData,
      languages,
      activityByDay,
      heatmapData,
      repositories,
      trendData: last30Days,
    });
  } catch (error) {
    console.error('Error in GET /api/stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
