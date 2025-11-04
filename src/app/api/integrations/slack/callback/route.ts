import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { oauthManager } from '@/lib/integrations/oauth-manager';
import { tokenManager } from '@/lib/integrations/token-manager';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { notificationService } from '@/lib/integrations/notification-service';
import { CSRFManager } from '@/lib/integrations/csrf-manager';

/**
 * GET /api/integrations/slack/callback
 * Handles OAuth callback from Slack
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
      console.error('Slack OAuth error:', error);
      return NextResponse.redirect(
        new URL(
          `/dashboard/integrations?error=slack_auth_failed&details=${error}`,
          request.url
        )
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL(
          '/dashboard/integrations?error=slack_auth_failed&details=no_code',
          request.url
        )
      );
    }

    if (!state) {
      console.error('Missing state parameter in Slack callback');
      return NextResponse.redirect(
        new URL(
          '/dashboard/integrations?error=slack_auth_failed&details=missing_state',
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
    const isValidState = CSRFManager.validateStateToken(state, user.id, 'slack');
    if (!isValidState) {
      console.error('Invalid state parameter in Slack callback');
      return NextResponse.redirect(
        new URL(
          '/dashboard/integrations?error=slack_auth_failed&details=invalid_state',
          request.url
        )
      );
    }

    // Exchange authorization code for tokens
    const tokens = await oauthManager.exchangeCodeForTokens('slack', code);

    // Store encrypted tokens
    await tokenManager.storeToken(user.id, 'slack', {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt,
      scope: tokens.scope,
    });

    // Get team info to store team ID
    // Note: Slack returns team info in the token response, but we can also fetch it
    // For now, we'll update the integration status
    await supabaseAdmin
      .from('integrations')
      .update({
        slack_connected: true,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    // Clear any existing notifications for this provider
    await notificationService.clearProviderNotifications(user.id, 'slack');

    console.log(`✅ Slack connected successfully for user ${user.id}`);

    // Redirect to integrations page with success message
    return NextResponse.redirect(
      new URL('/dashboard/integrations?success=slack_connected', request.url)
    );
  } catch (error) {
    console.error('Error in Slack OAuth callback:', error);
    return NextResponse.redirect(
      new URL(
        `/dashboard/settings?error=slack_auth_failed&details=${
          error instanceof Error ? error.message : 'unknown'
        }`,
        request.url
      )
    );
  }
}
