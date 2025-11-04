import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { supabaseAdmin } from '@/lib/supabaseClient';
import crypto from 'crypto';

// GET /api/webhooks - List webhooks
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { data: webhooks, error } = await supabaseAdmin
      .from('webhooks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching webhooks:', error);
      return NextResponse.json({ error: 'Failed to fetch webhooks' }, { status: 500 });
    }

    return NextResponse.json({ webhooks });
  } catch (error) {
    console.error('Error in GET /api/webhooks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/webhooks - Create webhook
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, url, events, team_id } = body;

    if (!name || !url || !events || !Array.isArray(events)) {
      return NextResponse.json(
        { error: 'Name, URL, and events array are required' },
        { status: 400 }
      );
    }

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate webhook secret
    const secret = crypto.randomBytes(32).toString('hex');

    const { data: webhook, error } = await supabaseAdmin
      .from('webhooks')
      .insert({
        user_id: user.id,
        team_id: team_id || null,
        name,
        url,
        secret,
        events,
        enabled: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating webhook:', error);
      return NextResponse.json({ error: 'Failed to create webhook' }, { status: 500 });
    }

    return NextResponse.json({ webhook }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/webhooks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
