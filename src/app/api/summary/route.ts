import { NextResponse } from 'next/server';
import { getGitHubActivity } from '@/lib/githubAPI';
import { generateAISummary } from '@/lib/aiSummary';
import { postSummaryToSlack } from '@/lib/slackAPI';
import { updateNotionTasks } from '@/lib/notionAPI';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: Request) {
  try {
    const { username, meetings = [] } = await req.json();

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    // Fetch GitHub activity
    const { commits, prs } = await getGitHubActivity(username);

    // Generate AI summary
    const summaryText = await generateAISummary({ commits, prs, meetings });

    // Post to Slack (non-blocking)
    postSummaryToSlack(summaryText).catch(err =>
      console.error('Slack post failed:', err)
    );

    // Sync to Notion (non-blocking)
    updateNotionTasks(commits).catch(err =>
      console.error('Notion sync failed:', err)
    );

    // Store summary in Supabase
    try {
      await supabase.from('summaries').insert([
        {
          user_id: username,
          text: summaryText,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (dbError) {
      console.error('Supabase insert failed:', dbError);
    }

    return NextResponse.json({
      summary: summaryText,
      stats: {
        commits: commits.length,
        prs: prs.length,
        meetings: meetings.length,
      },
    });
  } catch (error) {
    console.error('Summary generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}
