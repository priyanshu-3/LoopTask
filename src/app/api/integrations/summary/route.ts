import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { AISummaryEngine } from '@/lib/integrations/ai-summary-engine';
import {
  validateDateRange,
  validateSummaryType,
  validateUserId,
} from '@/lib/integrations/validation';
import {
  summaryRateLimiter,
  createRateLimitHeaders,
  createRateLimitError,
} from '@/lib/integrations/rate-limiter';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database
    const { supabaseAdmin } = await import('@/lib/supabaseClient');
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (userError || !user) {
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

    // Check rate limit (20 requests per minute per user)
    const rateLimitKey = `summary:${userId}`;
    const rateLimit = summaryRateLimiter.check(rateLimitKey);

    if (!rateLimit.allowed) {
      return NextResponse.json(createRateLimitError(rateLimit), {
        status: 429,
        headers: createRateLimitHeaders(rateLimit),
      });
    }

    const searchParams = request.nextUrl.searchParams;

    // Extract query parameters
    const startParam = searchParams.get('start');
    const endParam = searchParams.get('end');
    const typeParam = searchParams.get('type');

    // Validate type parameter
    const typeValidation = validateSummaryType(typeParam || undefined);
    if (!typeValidation.valid) {
      return NextResponse.json(
        { error: typeValidation.error },
        { status: 400 }
      );
    }
    const type = typeValidation.type!;

    // Validate date range
    const dateValidation = validateDateRange({
      start: startParam,
      end: endParam,
    });

    if (!dateValidation.valid) {
      return NextResponse.json(
        { error: dateValidation.error },
        { status: 400 }
      );
    }

    // Determine date range
    let start: Date;
    let end: Date;

    if (dateValidation.start && dateValidation.end) {
      // Use validated custom date range
      start = dateValidation.start;
      end = dateValidation.end;

      // Limit date range to 90 days
      const daysDiff = Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysDiff > 90) {
        return NextResponse.json(
          { error: 'Date range cannot exceed 90 days' },
          { status: 400 }
        );
      }
    } else {
      // Use type to determine date range
      const now = new Date();
      end = now;

      switch (type) {
        case 'daily':
          start = new Date(now);
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);
          break;
        case 'weekly':
          start = new Date(now);
          start.setDate(now.getDate() - 7);
          break;
        case 'monthly':
          start = new Date(now);
          start.setDate(now.getDate() - 30);
          break;
        default:
          // Default to daily
          start = new Date(now);
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);
      }
    }

    // Initialize AI Summary Engine
    const summaryEngine = new AISummaryEngine();

    // Check for cached summary first
    const cachedSummary = await summaryEngine.getCachedSummary(
      userId,
      start,
      type || 'daily'
    );

    if (cachedSummary) {
      return NextResponse.json(
        {
          summary: cachedSummary.summary,
          highlights: cachedSummary.highlights,
          insights: cachedSummary.insights,
          recommendations: cachedSummary.recommendations,
          stats: cachedSummary.stats,
          breakdown: cachedSummary.breakdown,
          dateRange: {
            start: start.toISOString(),
            end: end.toISOString(),
          },
          type: type || 'daily',
          cached: true,
          generatedAt: cachedSummary.createdAt,
        },
        {
          headers: createRateLimitHeaders(rateLimit),
        }
      );
    }

    // Generate new summary
    const summary = await summaryEngine.generateSummary(userId, {
      start,
      end,
    });

    return NextResponse.json(
      {
        summary: summary.summary,
        highlights: summary.highlights,
        insights: summary.insights,
        recommendations: summary.recommendations,
        stats: summary.stats,
        breakdown: summary.breakdown,
        dateRange: {
          start: start.toISOString(),
          end: end.toISOString(),
        },
        type: type || 'custom',
        cached: false,
        generatedAt: new Date().toISOString(),
      },
      {
        headers: createRateLimitHeaders(rateLimit),
      }
    );
  } catch (error) {
    console.error('Error generating AI summary:', error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('No activity data found')) {
        return NextResponse.json(
          {
            error: 'No activity data found for the specified date range',
            message: 'Connect integrations and sync data to generate summaries',
          },
          { status: 404 }
        );
      }

      if (error.message.includes('OpenAI API')) {
        return NextResponse.json(
          {
            error: 'AI service temporarily unavailable',
            message: 'Please try again later',
          },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      {
        error: 'Failed to generate summary',
        message: 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
