import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { oauthManager } from '@/lib/integrations/oauth-manager';
import { tokenManager } from '@/lib/integrations/token-manager';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { notificationService } from '@/lib/integrations/notification-service';
import { CSRFManager } from '@/lib/integrations/csrf-manager';

/**
 * GET /api/integrations/calendar/callback
 * Handles OAuth callback from Google Calendar
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.redirect(
        new URL('/login?error=unauthorized', request.url)
      );
    }

    // Get authorization code and state from query params
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Check for OAuth errors
    if (error) {
      console.error('Google Calendar OAuth error:', error);
      return NextResponse.redirect(
        new URL(
          `/dashboard/integrations?error=calendar_auth_failed&details=${error}`,
          request.url
        )
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL(
          '/dashboard/integrations?error=calendar_auth_failed&details=no_code',
          request.url
        )
      );
    }

    if (!state) {
      console.error('Missing state parameter in Calendar callback');
      return NextResponse.redirect(
        new URL(
          '/dashboard/integrations?error=calendar_auth_failed&details=missing_state',
          request.url
        )
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
      return NextResponse.redirect(
        new URL('/dashboard/integrations?error=user_not_found', request.url)
      );
    }

    // Validate CSRF state token
    const isValidState = CSRFManager.validateStateToken(state, user.id, 'calendar');
    if (!isValidState) {
      console.error('Invalid state parameter in Calendar callback');
      return NextResponse.redirect(
        new URL(
          '/dashboard/integrations?error=calendar_auth_failed&details=invalid_state',
          request.url
        )
      );
    }

    // Exchange authorization code for tokens (includes refresh token)
    const tokens = await oauthManager.exchangeCodeForTokens('calendar', code);

    // Store encrypted tokens with refresh token
    await tokenManager.storeToken(user.id, 'calendar', {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt,
      scope: tokens.scope,
    });

    // Update integration status
    await supabaseAdmin
      .from('integrations')
      .update({
        calendar_connected: true,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    // Clear any existing notifications for this provider
    await notificationService.clearProviderNotifications(user.id, 'calendar');

    console.log(`✅ Google Calendar connected successfully for user ${user.id}`);

    // Redirect to integrations page with success message
    return NextResponse.redirect(
      new URL('/dashboard/integrations?success=calendar_connected', request.url)
    );
  } catch (error) {
    console.error('Error in Google Calendar OAuth callback:', error);
    return NextResponse.redirect(
      new URL(
        `/dashboard/settings?error=calendar_auth_failed&details=${
          error instanceof Error ? error.message : 'unknown'
        }`,
        request.url
      )
    );
  }
}
