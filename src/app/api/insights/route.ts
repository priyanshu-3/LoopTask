import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { supabaseAdmin } from '@/lib/supabaseClient';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-build',
});

// GET /api/insights - Generate AI insights
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
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

    // Get user's recent activities
    const { data: activities } = await supabaseAdmin
      .from('activities')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    // Get user stats
    const { data: stats } = await supabaseAdmin
      .from('user_stats')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('date', { ascending: false });

    // Generate insights using AI
    const insights = await generateInsights(activities || [], stats || []);

    return NextResponse.json({ insights });
  } catch (error) {
    console.error('Error in GET /api/insights:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function generateInsights(activities: any[], stats: any[]) {
  // Calculate productivity metrics
  const totalCommits = stats.reduce((sum, s) => sum + (s.commits || 0), 0);
  const totalPRs = stats.reduce((sum, s) => sum + (s.prs || 0), 0);
  const totalReviews = stats.reduce((sum, s) => sum + (s.reviews || 0), 0);
  const avgScore = stats.length > 0 
    ? Math.round(stats.reduce((sum, s) => sum + (s.productivity_score || 0), 0) / stats.length)
    : 0;

  // Calculate trends
  const recentStats = stats.slice(0, 7);
  const olderStats = stats.slice(7, 14);
  const recentAvg = recentStats.length > 0
    ? recentStats.reduce((sum, s) => sum + (s.productivity_score || 0), 0) / recentStats.length
    : 0;
  const olderAvg = olderStats.length > 0
    ? olderStats.reduce((sum, s) => sum + (s.productivity_score || 0), 0) / olderStats.length
    : 0;
  const trend = recentAvg > olderAvg ? 'up' : recentAvg < olderAvg ? 'down' : 'stable';
  const change = olderAvg > 0 ? Math.round(((recentAvg - olderAvg) / olderAvg) * 100) : 0;

  // Detect patterns
  const patterns = detectPatterns(activities, stats);

  // Generate suggestions
  const suggestions = generateSuggestions(activities, stats, patterns);

  // Calculate burnout risk
  const burnoutRisk = calculateBurnoutRisk(stats);

  // Make predictions
  const predictions = makePredictions(stats);

  // Use AI for enhanced insights (if API key is available)
  let aiEnhancedInsights = null;
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'dummy-key-for-build') {
    try {
      const prompt = `Based on the following developer activity data, provide 3 actionable insights:
      
      - Total commits (last 30 days): ${totalCommits}
      - Total PRs: ${totalPRs}
      - Total reviews: ${totalReviews}
      - Average productivity score: ${avgScore}
      - Trend: ${trend} (${change}%)
      
      Provide insights in JSON format: { "insights": ["insight1", "insight2", "insight3"] }`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 500,
      });

      const content = completion.choices[0]?.message?.content;
      if (content) {
        aiEnhancedInsights = JSON.parse(content);
      }
    } catch (error) {
      console.error('Error generating AI insights:', error);
    }
  }

  return {
    productivity: {
      score: avgScore,
      trend,
      change: Math.abs(change),
      message: `Your productivity is ${Math.abs(change)}% ${trend === 'up' ? 'higher' : trend === 'down' ? 'lower' : 'the same'} than last week!`,
    },
    burnout: burnoutRisk,
    patterns,
    suggestions,
    predictions,
    aiInsights: aiEnhancedInsights?.insights || [],
  };
}

function detectPatterns(activities: any[], stats: any[]) {
  const patterns = [];

  // Peak performance hours
  const hourCounts: Record<number, number> = {};
  activities.forEach(activity => {
    const hour = new Date(activity.created_at).getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });
  const peakHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];
  if (peakHour) {
    patterns.push({
      title: 'Peak Performance Hours',
      description: `You're most productive around ${peakHour[0]}:00`,
      icon: 'Clock',
      color: 'blue',
      action: 'Schedule important tasks during these hours',
    });
  }

  // Review activity
  const recentReviews = stats.slice(0, 7).reduce((sum, s) => sum + (s.reviews || 0), 0);
  const olderReviews = stats.slice(7, 14).reduce((sum, s) => sum + (s.reviews || 0), 0);
  if (recentReviews > olderReviews * 1.2) {
    patterns.push({
      title: 'Code Review Champion',
      description: `You've reviewed ${Math.round(((recentReviews - olderReviews) / olderReviews) * 100)}% more PRs this week`,
      icon: 'TrendingUp',
      color: 'green',
      action: 'Great collaboration! Keep it up',
    });
  }

  // Meeting detection (placeholder)
  const meetingActivities = activities.filter(a => a.type === 'meeting');
  if (meetingActivities.length > activities.length * 0.3) {
    patterns.push({
      title: 'Meeting Overload',
      description: `${Math.round((meetingActivities.length / activities.length) * 100)}% of your time spent in meetings`,
      icon: 'AlertTriangle',
      color: 'yellow',
      action: 'Consider declining non-essential meetings',
    });
  }

  return patterns;
}

function generateSuggestions(activities: any[], stats: any[], patterns: any[]) {
  const suggestions = [];

  // Automation suggestion
  if (activities.length > 20) {
    suggestions.push({
      title: 'Optimize Your Workflow',
      description: 'Automate your daily standup summary to save 15 minutes per day',
      priority: 'high',
      impact: 'time-saving',
    });
  }

  // Focus time suggestion
  const avgCommitsPerDay = stats.length > 0
    ? stats.reduce((sum, s) => sum + (s.commits || 0), 0) / stats.length
    : 0;
  if (avgCommitsPerDay < 5) {
    suggestions.push({
      title: 'Focus Time Blocks',
      description: 'Block 2-hour focus sessions for deep work on complex features',
      priority: 'medium',
      impact: 'productivity',
    });
  }

  // Documentation suggestion
  suggestions.push({
    title: 'Knowledge Sharing',
    description: 'Document your recent architecture decisions in Notion',
    priority: 'low',
    impact: 'team-growth',
  });

  return suggestions;
}

function calculateBurnoutRisk(stats: any[]) {
  // Simple burnout calculation based on consistency and workload
  const recentStats = stats.slice(0, 7);
  const avgDailyCommits = recentStats.length > 0
    ? recentStats.reduce((sum, s) => sum + (s.commits || 0), 0) / recentStats.length
    : 0;
  
  const avgDailyHours = avgDailyCommits * 0.5; // Rough estimate
  const workingDays = recentStats.filter(s => s.commits > 0).length;
  
  let risk = 'low';
  let score = 25;
  let message = "You're maintaining a healthy work-life balance.";
  const recommendations = [
    'Continue taking regular breaks',
    'Maintain your current pace',
    'Keep up the good work!',
  ];

  if (avgDailyHours > 10 || workingDays === 7) {
    risk = 'high';
    score = 75;
    message = "You're working too much. Take a break!";
    recommendations.splice(0, recommendations.length,
      'Take a day off this week',
      'Set boundaries for work hours',
      'Delegate tasks when possible'
    );
  } else if (avgDailyHours > 8 || workingDays > 5) {
    risk = 'medium';
    score = 50;
    message = "Watch out for signs of burnout.";
    recommendations.splice(0, recommendations.length,
      'Schedule regular breaks',
      'Avoid weekend work',
      'Practice stress management'
    );
  }

  return { risk, score, message, recommendations };
}

function makePredictions(stats: any[]) {
  const recentStats = stats.slice(0, 7);
  const avgCommits = recentStats.length > 0
    ? Math.round(recentStats.reduce((sum, s) => sum + (s.commits || 0), 0) / recentStats.length)
    : 0;
  const avgPRs = recentStats.length > 0
    ? Math.round(recentStats.reduce((sum, s) => sum + (s.prs || 0), 0) / recentStats.length)
    : 0;
  const avgReviews = recentStats.length > 0
    ? Math.round(recentStats.reduce((sum, s) => sum + (s.reviews || 0), 0) / recentStats.length)
    : 0;

  return {
    thisWeek: {
      commits: avgCommits * 7,
      prs: avgPRs * 7,
      reviews: avgReviews * 7,
      confidence: 85,
    },
    nextSprint: {
      velocity: avgCommits > 5 ? 'high' : avgCommits > 3 ? 'medium' : 'low',
      blockers: Math.floor(Math.random() * 3),
      completion: Math.min(95, 70 + avgCommits * 3),
    },
  };
}
