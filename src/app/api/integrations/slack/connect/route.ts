import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { oauthManager } from '@/lib/integrations/oauth-manager';
import { CSRFManager } from '@/lib/integrations/csrf-manager';
import { supabaseAdmin } from '@/lib/supabaseClient';

/**
 * GET /api/integrations/slack/connect
 * Initiates OAuth flow for Slack integration
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user ID from database
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate CSRF state token
    const state = CSRFManager.generateStateToken(user.id, 'slack');
    
    // Generate authorization URL with state parameter
    const authUrl = oauthManager.getAuthorizationUrl('slack', state);
    
    // Redirect to Slack authorization page
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Error initiating Slack OAuth:', error);
    return NextResponse.json(
      { 
        error: 'Failed to initiate Slack connection',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
