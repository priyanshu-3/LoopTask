import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { supabaseAdmin } from '@/lib/supabaseClient';

// GET /api/automations - List all automations for user
export async function GET(request: NextRequest) {
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

    // Get automations
    const { data: automations, error } = await supabaseAdmin
      .from('automations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching automations:', error);
      return NextResponse.json({ error: 'Failed to fetch automations' }, { status: 500 });
    }

    return NextResponse.json({ automations });
  } catch (error) {
    console.error('Error in GET /api/automations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/automations - Create new automation
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, trigger_type, trigger_config, actions, team_id } = body;

    // Validate required fields
    if (!name || !trigger_type || !trigger_config || !actions) {
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

    // Create automation
    const { data: automation, error } = await supabaseAdmin
      .from('automations')
      .insert({
        user_id: user.id,
        team_id: team_id || null,
        name,
        description,
        trigger_type,
        trigger_config,
        actions,
        enabled: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating automation:', error);
      return NextResponse.json({ error: 'Failed to create automation' }, { status: 500 });
    }

    return NextResponse.json({ automation }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/automations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
