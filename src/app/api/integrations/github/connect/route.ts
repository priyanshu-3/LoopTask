import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { oauthManager } from '@/lib/integrations/oauth-manager';
import { CSRFManager } from '@/lib/integrations/csrf-manager';
import { supabaseAdmin } from '@/lib/supabaseClient';

/**
 * GET /api/integrations/github/connect
 * Initiates OAuth flow for GitHub integration
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate CSRF state token
    const state = CSRFManager.generateStateToken(user.id, 'github');
    
    // Generate authorization URL with state parameter
    const authUrl = oauthManager.getAuthorizationUrl('github', state);
    
    // Redirect to GitHub authorization page
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Error initiating GitHub OAuth:', error);
    return NextResponse.json(
      { 
        error: 'Failed to initiate GitHub connection',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
