import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { executeAutomation } from '@/lib/automation/executor';

// POST /api/automations/[id]/execute - Manually trigger automation
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Await params in Next.js 15
    const { id } = await params;

    // Get automation
    const { data: automation, error: fetchError } = await supabaseAdmin
      .from('automations')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !automation) {
      return NextResponse.json({ error: 'Automation not found' }, { status: 404 });
    }

    if (!automation.enabled) {
      return NextResponse.json({ error: 'Automation is disabled' }, { status: 400 });
    }

    // Create automation run record
    const { data: run, error: runError } = await supabaseAdmin
      .from('automation_runs')
      .insert({
        automation_id: automation.id,
        status: 'running',
        trigger_data: { manual: true, user_id: user.id },
      })
      .select()
      .single();

    if (runError || !run) {
      return NextResponse.json({ error: 'Failed to create run' }, { status: 500 });
    }

    // Execute automation asynchronously
    executeAutomation(automation, run.id, user.id).catch(console.error);

    return NextResponse.json({ 
      message: 'Automation triggered successfully',
      run_id: run.id 
    });
  } catch (error) {
    console.error('Error in POST /api/automations/[id]/execute:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
