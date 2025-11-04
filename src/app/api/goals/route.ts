import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { supabaseAdmin } from '@/lib/supabaseClient';

// GET /api/goals - List goals
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('team_id');

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let query = supabaseAdmin
      .from('goals')
      .select(`
        *,
        key_results (*)
      `)
      .order('created_at', { ascending: false });

    if (teamId) {
      query = query.eq('team_id', teamId);
    }

    const { data: goals, error } = await query;

    if (error) {
      console.error('Error fetching goals:', error);
      return NextResponse.json({ error: 'Failed to fetch goals' }, { status: 500 });
    }

    return NextResponse.json({ goals });
  } catch (error) {
    console.error('Error in GET /api/goals:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/goals - Create goal
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      team_id, 
      title, 
      description, 
      type, 
      target, 
      unit, 
      deadline,
      key_results 
    } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
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

    // Get or create a default team for the user
    let finalTeamId = team_id;
    
    if (!finalTeamId) {
      // Check if user has a team
      const { data: userTeam } = await supabaseAdmin
        .from('team_members')
        .select('team_id')
        .eq('user_id', user.id)
        .limit(1)
        .single();

      if (userTeam) {
        finalTeamId = userTeam.team_id;
      } else {
        // Create a default team for the user
        const { data: newTeam, error: teamError } = await supabaseAdmin
          .from('teams')
          .insert({
            name: `${user.email}'s Team`,
            slug: `team-${user.id.substring(0, 8)}`,
            owner_id: user.id,
            description: 'Personal workspace',
          })
          .select()
          .single();

        if (teamError || !newTeam) {
          console.error('Error creating team:', teamError);
          return NextResponse.json({ error: 'Failed to create team' }, { status: 500 });
        }

        // Add user as team member
        await supabaseAdmin
          .from('team_members')
          .insert({
            team_id: newTeam.id,
            user_id: user.id,
            role: 'owner',
          });

        finalTeamId = newTeam.id;
      }
    }

    // Create goal
    const { data: goal, error: goalError } = await supabaseAdmin
      .from('goals')
      .insert({
        team_id: finalTeamId,
        owner_id: user.id,
        title,
        description,
        type: type || 'quarterly',
        target: target || 100,
        unit: unit || '%',
        deadline,
        status: 'active',
      })
      .select()
      .single();

    if (goalError || !goal) {
      console.error('Error creating goal:', goalError);
      return NextResponse.json({ 
        error: 'Failed to create goal',
        details: goalError?.message || 'Unknown error'
      }, { status: 500 });
    }

    // Create key results if provided
    if (key_results && Array.isArray(key_results)) {
      const keyResultsData = key_results.map((kr: any) => ({
        goal_id: goal.id,
        title: kr.title,
        progress: 0,
        status: 'in-progress',
      }));

      await supabaseAdmin
        .from('key_results')
        .insert(keyResultsData);
    }

    // Fetch goal with key results
    const { data: fullGoal } = await supabaseAdmin
      .from('goals')
      .select(`
        *,
        key_results (*)
      `)
      .eq('id', goal.id)
      .single();

    return NextResponse.json({ goal: fullGoal }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/goals:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
