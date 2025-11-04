import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { supabaseAdmin } from '@/lib/supabaseClient';

// GET /api/integrations - Get user's integration status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
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

    // Get integrations
    const { data: integration, error } = await supabaseAdmin
      .from('integrations')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching integrations:', error);
      return NextResponse.json(
        { error: 'Failed to fetch integrations' },
        { status: 500 }
      );
    }

    // Return integration status (hide tokens)
    const integrationStatus = integration ? {
      github_connected: integration.github_connected || false,
      slack_connected: integration.slack_connected || false,
      notion_connected: integration.notion_connected || false,
      calendar_connected: integration.calendar_connected || false,
      last_synced_at: integration.last_synced_at || null,
    } : {
      github_connected: false,
      slack_connected: false,
      notion_connected: false,
      calendar_connected: false,
      last_synced_at: null,
    };

    return NextResponse.json(integrationStatus);
  } catch (error) {
    console.error('Error in GET /api/integrations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/integrations - Update integration settings
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { integration_type, action } = body;

    if (!integration_type || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
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

    // Update integration based on action
    if (action === 'disconnect') {
      const updateData: any = {};
      updateData[`${integration_type}_connected`] = false;
      updateData[`${integration_type}_token`] = null;

      const { error } = await supabaseAdmin
        .from('integrations')
        .update(updateData)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error disconnecting integration:', error);
        return NextResponse.json(
          { error: 'Failed to disconnect integration' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: `${integration_type} disconnected successfully`,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in POST /api/integrations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
