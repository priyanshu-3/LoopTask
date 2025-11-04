import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { oauthManager } from '@/lib/integrations/oauth-manager';
import { tokenManager } from '@/lib/integrations/token-manager';
import { supabaseAdmin } from '@/lib/supabaseClient';

/**
 * POST /api/integrations/calendar/disconnect
 * Disconnects Google Calendar integration and revokes tokens
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
    const tokens = await tokenManager.getToken(user.id, 'calendar');

    // Revoke token with Google (if token exists)
    if (tokens?.accessToken) {
      try {
        await oauthManager.revokeToken('calendar', tokens.accessToken);
      } catch (revokeError) {
        // Log but don't fail - we still want to delete local tokens
        console.warn('Failed to revoke Google Calendar token:', revokeError);
      }
    }

    // Delete stored tokens
    await tokenManager.deleteToken(user.id, 'calendar');

    // Update integration status
    await supabaseAdmin
      .from('integrations')
      .update({
        calendar_connected: false,
        last_calendar_sync: null,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    console.log(`✅ Google Calendar disconnected successfully for user ${user.id}`);

    return NextResponse.json({
      success: true,
      message: 'Google Calendar integration disconnected successfully',
    });
  } catch (error) {
    console.error('Error disconnecting Google Calendar:', error);
    return NextResponse.json(
      {
        error: 'Failed to disconnect Google Calendar integration',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
