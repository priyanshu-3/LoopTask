import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { oauthManager } from '@/lib/integrations/oauth-manager';
import { tokenManager } from '@/lib/integrations/token-manager';
import { supabaseAdmin } from '@/lib/supabaseClient';

/**
 * POST /api/integrations/slack/disconnect
 * Disconnects Slack integration and revokes tokens
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get current token for revocation
    const tokens = await tokenManager.getToken(user.id, 'slack');

    // Revoke token with Slack (if token exists)
    if (tokens?.accessToken) {
      try {
        await oauthManager.revokeToken('slack', tokens.accessToken);
      } catch (revokeError) {
        // Log but don't fail - we still want to delete local tokens
        console.warn('Failed to revoke Slack token:', revokeError);
      }
    }

    // Delete stored tokens
    await tokenManager.deleteToken(user.id, 'slack');

    // Update integration status
    await supabaseAdmin
      .from('integrations')
      .update({
        slack_connected: false,
        slack_team_id: null,
        last_slack_sync: null,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    console.log(`✅ Slack disconnected successfully for user ${user.id}`);

    return NextResponse.json({
      success: true,
      message: 'Slack integration disconnected successfully',
    });
  } catch (error) {
    console.error('Error disconnecting Slack:', error);
    return NextResponse.json(
      {
        error: 'Failed to disconnect Slack integration',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
