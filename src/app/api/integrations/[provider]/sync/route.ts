import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { syncService } from '@/lib/integrations/sync-service';
import { IntegrationProvider } from '@/lib/integrations/token-manager';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { validateProvider, validateUserId } from '@/lib/integrations/validation';
import {
  syncRateLimiter,
  createRateLimitHeaders,
  createRateLimitError,
} from '@/lib/integrations/rate-limiter';

/**
 * POST /api/integrations/[provider]/sync
 * 
 * Manually trigger sync for a specific integration provider
 * 
 * Requirements: 10.1, 10.2, 10.3, 10.4
 */
export async function POST(
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

    // Check rate limit (10 requests per minute per user)
    const rateLimitKey = `sync:${userId}`;
    const rateLimit = syncRateLimiter.check(rateLimitKey);

    if (!rateLimit.allowed) {
      return NextResponse.json(createRateLimitError(rateLimit), {
        status: 429,
        headers: createRateLimitHeaders(rateLimit),
      });
    }

    console.log(`🔄 Manual sync triggered for ${provider} by user ${userId}`);

    // Trigger sync
    const result = await syncService.syncProvider(userId, provider);

    if (result.success) {
      return NextResponse.json(
        {
          success: true,
          provider: result.provider,
          itemsSynced: result.itemsSynced,
          duration: result.duration,
          message: `Successfully synced ${result.itemsSynced} items from ${provider}`,
        },
        {
          headers: createRateLimitHeaders(rateLimit),
        }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          provider: result.provider,
          error: result.error,
          message: `Failed to sync ${provider}: ${result.error}`,
        },
        {
          status: 500,
          headers: createRateLimitHeaders(rateLimit),
        }
      );
    }
  } catch (error) {
    console.error('Sync endpoint error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'An unexpected error occurred during sync',
      },
      { status: 500 }
    );
  }
}
