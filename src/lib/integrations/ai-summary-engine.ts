import OpenAI from 'openai';
import { supabaseAdmin } from '@/lib/supabaseClient';

// Types for activity data from different sources
export interface GitHubCommit {
  sha: string;
  message: string;
  author: string;
  date: string;
  url: string;
  repository?: string;
  additions?: number;
  deletions?: number;
}

export interface GitHubPullRequest {
  number: number;
  title: string;
  state: string;
  merged: boolean;
  created_at: string;
  merged_at?: string;
  url: string;
  repository?: string;
  additions?: number;
  deletions?: number;
}

export interface GitHubIssue {
  number: number;
  title: string;
  state: string;
  created_at: string;
  closed_at?: string;
  url: string;
  repository?: string;
}

export interface NotionPage {
  id: string;
  title: string;
  lastEditedTime: string;
  url: string;
  parentDatabase?: string;
}

export interface SlackActivity {
  messageCount: number;
  channelParticipation: Array<{
    channelId: string;
    channelName: string;
    messageCount: number;
  }>;
  dmCount: number;
  reactionsGiven: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  duration: number; // minutes
  attendeeCount: number;
  isOrganizer: boolean;
}

export interface ActivityContext {
  commits: GitHubCommit[];
  pullRequests: GitHubPullRequest[];
  issues: GitHubIssue[];
  notionPages: NotionPage[];
  slackActivity: SlackActivity | null;
  calendarEvents: CalendarEvent[];
  dateRange: { start: Date; end: Date };
}

export interface AISummary {
  summary: string;
  highlights: string[];
  insights: string[];
  recommendations: string[];
  stats: {
    totalCommits: number;
    totalPRs: number;
    totalIssues: number;
    totalMeetings: number;
    meetingHours: number;
    focusTime: number;
    collaborationScore: number;
    notionPages: number;
    slackMessages: number;
  };
  breakdown?: {
    github: number;
    notion: number;
    slack: number;
    calendar: number;
  };
}

export interface AISummaryRecord {
  id: string;
  user_id: string;
  date: string;
  type: 'daily' | 'weekly' | 'monthly';
  summary: string;
  highlights: string[];
  insights: string[];
  recommendations: string[];
  stats: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export class AISummaryEngine {
  private openai: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    this.openai = new OpenAI({ apiKey });
  }

  /**
   * Generate AI summary for a specific date range
   */
  async generateSummary(userId: string, dateRange: DateRange): Promise<AISummary> {
    // Fetch activity data from all sources
    const activityContext = await this.aggregateActivityData(userId, dateRange);

    // Check if there's any activity data
    const hasActivity = 
      activityContext.commits.length > 0 ||
      activityContext.pullRequests.length > 0 ||
      activityContext.issues.length > 0 ||
      activityContext.notionPages.length > 0 ||
      activityContext.calendarEvents.length > 0 ||
      (activityContext.slackActivity && activityContext.slackActivity.messageCount > 0);

    if (!hasActivity) {
      throw new Error('No activity data found for the specified date range');
    }

    // Analyze patterns
    const patterns = this.analyzePatterns(activityContext);

    // Generate natural language summary using OpenAI
    const aiSummary = await this.generateNaturalLanguageSummary(activityContext, patterns);

    // Add activity breakdown by platform
    aiSummary.breakdown = {
      github: activityContext.commits.length + activityContext.pullRequests.length + activityContext.issues.length,
      notion: activityContext.notionPages.length,
      slack: activityContext.slackActivity?.messageCount || 0,
      calendar: activityContext.calendarEvents.length
    };

    // Cache the summary
    const days = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
    const type = days === 1 ? 'daily' : days <= 7 ? 'weekly' : 'monthly';
    await this.cacheSummary(userId, dateRange.start, type, aiSummary);

    return aiSummary;
  }

  /**
   * Generate daily summary for today
   */
  async generateDailySummary(userId: string): Promise<AISummary> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dateRange: DateRange = {
      start: today,
      end: tomorrow
    };

    return this.generateSummary(userId, dateRange);
  }

  /**
   * Generate weekly summary for the past 7 days
   */
  async generateWeeklySummary(userId: string): Promise<AISummary> {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);

    const dateRange: DateRange = { start, end };

    return this.generateSummary(userId, dateRange);
  }

  /**
   * Get cached summary if available and fresh (within 1 hour)
   */
  async getCachedSummary(
    userId: string,
    date: Date,
    type: 'daily' | 'weekly' | 'monthly'
  ): Promise<(AISummary & { createdAt: string; breakdown?: any }) | null> {
    const dateStr = date.toISOString().split('T')[0];

    const { data, error } = await supabaseAdmin
      .from('ai_summaries')
      .select('*')
      .eq('user_id', userId)
      .eq('date', dateStr)
      .eq('type', type)
      .single();

    if (error || !data) {
      return null;
    }

    // Check if cache is fresh (within 1 hour)
    const createdAt = new Date(data.created_at);
    const now = new Date();
    const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

    if (hoursSinceCreation > 1) {
      return null; // Cache expired
    }

    return {
      summary: data.summary,
      highlights: data.highlights || [],
      insights: data.insights || [],
      recommendations: data.recommendations || [],
      stats: data.stats || {},
      breakdown: data.breakdown || null,
      createdAt: data.created_at
    };
  }

  /**
   * Cache generated summary in database
   */
  async cacheSummary(
    userId: string,
    date: Date,
    type: 'daily' | 'weekly' | 'monthly',
    summary: AISummary
  ): Promise<void> {
    const dateStr = date.toISOString().split('T')[0];

    const { error } = await supabaseAdmin
      .from('ai_summaries')
      .upsert({
        user_id: userId,
        date: dateStr,
        type,
        summary: summary.summary,
        highlights: summary.highlights,
        insights: summary.insights,
        recommendations: summary.recommendations,
        stats: summary.stats,
        breakdown: summary.breakdown || null,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,date,type'
      });

    if (error) {
      console.error('Error caching summary:', error);
      throw error;
    }
  }

  /**
   * Invalidate cache when new data is synced
   */
  async invalidateCache(userId: string): Promise<void> {
    // Delete summaries from today and this week
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().split('T')[0];

    const { error } = await supabaseAdmin
      .from('ai_summaries')
      .delete()
      .eq('user_id', userId)
      .gte('date', weekAgoStr);

    if (error) {
      console.error('Error invalidating cache:', error);
    }
  }

  /**
   * Aggregate activity data from all sources
   */
  private async aggregateActivityData(
    userId: string,
    dateRange: DateRange
  ): Promise<ActivityContext> {
    const { start, end } = dateRange;

    // Fetch activities from database
    const { data: activities, error } = await supabaseAdmin
      .from('activities')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', start.toISOString())
      .lt('created_at', end.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching activities:', error);
      throw error;
    }

    // Separate activities by source
    const commits: GitHubCommit[] = [];
    const pullRequests: GitHubPullRequest[] = [];
    const issues: GitHubIssue[] = [];
    const notionPages: NotionPage[] = [];
    const calendarEvents: CalendarEvent[] = [];
    let slackActivity: SlackActivity | null = null;

    for (const activity of activities || []) {
      const metadata = activity.metadata || {};

      if (activity.source === 'github') {
        if (activity.type === 'commit') {
          commits.push({
            sha: activity.external_id || '',
            message: activity.title,
            author: metadata.author || '',
            date: activity.created_at,
            url: activity.external_url || activity.url || '',
            repository: activity.repository || '',
            additions: metadata.additions,
            deletions: metadata.deletions
          });
        } else if (activity.type === 'pr') {
          pullRequests.push({
            number: metadata.number || 0,
            title: activity.title,
            state: metadata.state || activity.status,
            merged: metadata.merged || false,
            created_at: activity.created_at,
            merged_at: metadata.merged_at,
            url: activity.external_url || activity.url || '',
            repository: activity.repository || '',
            additions: metadata.additions,
            deletions: metadata.deletions
          });
        } else if (metadata.type === 'issue') {
          issues.push({
            number: metadata.number || 0,
            title: activity.title,
            state: metadata.state || activity.status,
            created_at: activity.created_at,
            closed_at: metadata.closed_at,
            url: activity.external_url || activity.url || '',
            repository: activity.repository || ''
          });
        }
      } else if (activity.source === 'notion') {
        notionPages.push({
          id: activity.external_id || '',
          title: activity.title,
          lastEditedTime: activity.created_at,
          url: activity.external_url || activity.url || '',
          parentDatabase: metadata.parentDatabase
        });
      } else if (activity.source === 'calendar' && activity.type === 'meeting') {
        calendarEvents.push({
          id: activity.external_id || '',
          title: activity.title,
          start: metadata.start || activity.created_at,
          end: metadata.end || activity.created_at,
          duration: metadata.duration || 0,
          attendeeCount: metadata.attendeeCount || 0,
          isOrganizer: metadata.isOrganizer || false
        });
      } else if (activity.source === 'slack' && !slackActivity) {
        // Slack activities are aggregated, so we only need one
        slackActivity = {
          messageCount: metadata.messageCount || 0,
          channelParticipation: metadata.channelParticipation || [],
          dmCount: metadata.dmCount || 0,
          reactionsGiven: metadata.reactionsGiven || 0
        };
      }
    }

    return {
      commits,
      pullRequests,
      issues,
      notionPages,
      slackActivity,
      calendarEvents,
      dateRange
    };
  }

  /**
   * Analyze patterns in activity data
   */
  private analyzePatterns(context: ActivityContext) {
    const { commits, pullRequests, calendarEvents, slackActivity } = context;

    // Calculate meeting hours
    const meetingHours = calendarEvents.reduce((sum, event) => sum + event.duration, 0) / 60;

    // Calculate focus time (assuming 8-hour workday minus meetings)
    const workingDays = Math.ceil(
      (context.dateRange.end.getTime() - context.dateRange.start.getTime()) / (1000 * 60 * 60 * 24)
    );
    const totalWorkHours = workingDays * 8;
    const focusTime = Math.max(0, totalWorkHours - meetingHours);

    // Find most active repositories
    const repoCommits = new Map<string, number>();
    commits.forEach(commit => {
      if (commit.repository) {
        repoCommits.set(commit.repository, (repoCommits.get(commit.repository) || 0) + 1);
      }
    });
    const topRepos = Array.from(repoCommits.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([repo]) => repo);

    // Calculate collaboration score (0-100)
    const prCount = pullRequests.length;
    const reviewCount = pullRequests.filter(pr => pr.state === 'closed' || pr.merged).length;
    const slackMessages = slackActivity?.messageCount || 0;
    const meetings = calendarEvents.length;
    
    const collaborationScore = Math.min(100, Math.round(
      (prCount * 10) + (reviewCount * 15) + (slackMessages * 0.5) + (meetings * 5)
    ));

    // Find most active times (simplified - would need more detailed timestamp analysis)
    const activeTimes = this.findActiveTimes(commits, pullRequests);

    return {
      meetingHours,
      focusTime,
      topRepos,
      collaborationScore,
      activeTimes
    };
  }

  /**
   * Find most active times of day
   */
  private findActiveTimes(commits: GitHubCommit[], pullRequests: GitHubPullRequest[]): string[] {
    const hourCounts = new Map<number, number>();

    commits.forEach(commit => {
      const date = new Date(commit.date);
      const hour = date.getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    });

    pullRequests.forEach(pr => {
      const date = new Date(pr.created_at);
      const hour = date.getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    });

    const sortedHours = Array.from(hourCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour]) => {
        if (hour < 12) return `${hour}am`;
        if (hour === 12) return '12pm';
        return `${hour - 12}pm`;
      });

    return sortedHours;
  }

  /**
   * Generate natural language summary using OpenAI
   */
  private async generateNaturalLanguageSummary(
    context: ActivityContext,
    patterns: any
  ): Promise<AISummary> {
    const prompt = this.buildPrompt(context, patterns);

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an AI assistant that analyzes developer productivity data and generates insightful summaries. Provide concise, actionable insights that help developers understand their work patterns and improve their productivity.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      const response = completion.choices[0]?.message?.content || '';
      
      // Parse the structured response
      return this.parseAIResponse(response, context, patterns);
    } catch (error) {
      console.error('Error generating AI summary:', error);
      
      // Fallback to basic summary if OpenAI fails
      return this.generateFallbackSummary(context, patterns);
    }
  }

  /**
   * Build prompt for OpenAI
   */
  private buildPrompt(context: ActivityContext, patterns: any): string {
    const { commits, pullRequests, issues, notionPages, slackActivity, calendarEvents, dateRange } = context;

    const days = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
    const period = days === 1 ? 'today' : days === 7 ? 'this week' : `the past ${days} days`;

    return `Analyze the following developer activity data for ${period} and provide a structured summary:

GITHUB ACTIVITY:
- Commits: ${commits.length}
- Pull Requests: ${pullRequests.length} (${pullRequests.filter(pr => pr.merged).length} merged)
- Issues: ${issues.length}
- Top Repositories: ${patterns.topRepos.join(', ') || 'None'}
- Code Changes: +${commits.reduce((sum, c) => sum + (c.additions || 0), 0)} / -${commits.reduce((sum, c) => sum + (c.deletions || 0), 0)} lines

NOTION ACTIVITY:
- Pages Edited: ${notionPages.length}

SLACK ACTIVITY:
- Messages Sent: ${slackActivity?.messageCount || 0}
- Channels Active: ${slackActivity?.channelParticipation?.length || 0}
- DMs: ${slackActivity?.dmCount || 0}

CALENDAR ACTIVITY:
- Meetings: ${calendarEvents.length}
- Meeting Hours: ${patterns.meetingHours.toFixed(1)}
- Focus Time: ${patterns.focusTime.toFixed(1)} hours

PATTERNS:
- Most Active Times: ${patterns.activeTimes.join(', ') || 'N/A'}
- Collaboration Score: ${patterns.collaborationScore}/100

Please provide a response in the following JSON format:
{
  "summary": "A 2-3 sentence overview of the developer's activity and productivity",
  "highlights": ["3-5 key achievements or notable activities"],
  "insights": ["2-3 data-driven insights about work patterns"],
  "recommendations": ["2-3 actionable suggestions for improvement"]
}`;
  }

  /**
   * Parse AI response into structured format
   */
  private parseAIResponse(response: string, context: ActivityContext, patterns: any): AISummary {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        return {
          summary: parsed.summary || '',
          highlights: Array.isArray(parsed.highlights) ? parsed.highlights : [],
          insights: Array.isArray(parsed.insights) ? parsed.insights : [],
          recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
          stats: this.calculateStats(context, patterns)
        };
      }
    } catch (error) {
      console.error('Error parsing AI response:', error);
    }

    // Fallback if parsing fails
    return this.generateFallbackSummary(context, patterns);
  }

  /**
   * Generate fallback summary if AI fails
   */
  private generateFallbackSummary(context: ActivityContext, patterns: any): AISummary {
    const { commits, pullRequests, issues, notionPages, slackActivity, calendarEvents } = context;

    const summary = `You had ${commits.length} commits, ${pullRequests.length} pull requests, and ${calendarEvents.length} meetings. Your collaboration score is ${patterns.collaborationScore}/100.`;

    const highlights: string[] = [];
    if (commits.length > 0) highlights.push(`Made ${commits.length} commits across your repositories`);
    if (pullRequests.filter(pr => pr.merged).length > 0) {
      highlights.push(`Merged ${pullRequests.filter(pr => pr.merged).length} pull requests`);
    }
    if (notionPages.length > 0) highlights.push(`Updated ${notionPages.length} Notion pages`);
    if (calendarEvents.length > 0) highlights.push(`Attended ${calendarEvents.length} meetings`);

    const insights: string[] = [];
    if (patterns.meetingHours > 4) {
      insights.push(`High meeting load (${patterns.meetingHours.toFixed(1)} hours) may be impacting focus time`);
    }
    if (patterns.topRepos.length > 0) {
      insights.push(`Most active in: ${patterns.topRepos.join(', ')}`);
    }

    const recommendations: string[] = [];
    if (patterns.focusTime < 20) {
      recommendations.push('Consider blocking more time for focused work');
    }
    if (commits.length > 0 && pullRequests.length === 0) {
      recommendations.push('Consider creating pull requests for code review');
    }

    return {
      summary,
      highlights,
      insights,
      recommendations,
      stats: this.calculateStats(context, patterns)
    };
  }

  /**
   * Calculate statistics from activity data
   */
  private calculateStats(context: ActivityContext, patterns: any) {
    const { commits, pullRequests, issues, notionPages, slackActivity, calendarEvents } = context;

    return {
      totalCommits: commits.length,
      totalPRs: pullRequests.length,
      totalIssues: issues.length,
      totalMeetings: calendarEvents.length,
      meetingHours: patterns.meetingHours,
      focusTime: patterns.focusTime,
      collaborationScore: patterns.collaborationScore,
      notionPages: notionPages.length,
      slackMessages: slackActivity?.messageCount || 0
    };
  }
}
