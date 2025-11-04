import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { GitHubClient } from '@/lib/github/client';
import { tokenManager } from '@/lib/integrations/token-manager';

export async function POST(request: NextRequest) {
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

    // Get GitHub token using TokenManager (with automatic decryption)
    const tokens = await tokenManager.getToken(user.id, 'github');

    if (!tokens?.accessToken) {
      return NextResponse.json(
        { error: 'GitHub not connected' },
        { status: 400 }
      );
    }

    // Initialize GitHub client
    const github = new GitHubClient(tokens.accessToken);

    // Get data from last 30 days
    const since = new Date();
    since.setDate(since.getDate() - 30);

    // Fetch GitHub data including issues
    const [commits, prs, issues, stats] = await Promise.all([
      github.getCommits(since),
      github.getPullRequests(since),
      github.getIssues(since),
      github.getStats(since),
    ]);

    // Store commits as activities
    const commitActivities = commits.map(commit => ({
      user_id: user.id,
      type: 'commit',
      title: commit.message.split('\n')[0],
      description: commit.message,
      source: 'github',
      external_id: commit.sha,
      external_url: commit.url,
      metadata: {
        sha: commit.sha,
        repository: commit.repository,
        url: commit.url,
        author: commit.author,
      },
      created_at: commit.author.date,
    }));

    // Store PRs as activities
    const prActivities = prs.map(pr => ({
      user_id: user.id,
      type: 'pull_request',
      title: pr.title,
      description: `${pr.state} PR #${pr.number}`,
      source: 'github',
      external_id: `pr-${pr.repository}-${pr.number}`,
      external_url: pr.url,
      metadata: {
        number: pr.number,
        state: pr.state,
        repository: pr.repository,
        url: pr.url,
        additions: pr.additions,
        deletions: pr.deletions,
      },
      created_at: pr.created_at,
    }));

    // Store issues as activities
    const issueActivities = issues.map(issue => ({
      user_id: user.id,
      type: 'issue',
      title: issue.title,
      description: `${issue.state} Issue #${issue.number}`,
      source: 'github',
      external_id: `issue-${issue.repository}-${issue.number}`,
      external_url: issue.url,
      metadata: {
        number: issue.number,
        state: issue.state,
        repository: issue.repository,
        url: issue.url,
        labels: issue.labels,
        assignees: issue.assignees,
      },
      created_at: issue.created_at,
    }));

    // Insert activities (upsert to avoid duplicates)
    const allActivities = [...commitActivities, ...prActivities, ...issueActivities];
    
    if (allActivities.length > 0) {
      const { error: insertError } = await supabaseAdmin
        .from('activities')
        .upsert(allActivities, {
          onConflict: 'user_id,type,created_at',
          ignoreDuplicates: true,
        });

      if (insertError) {
        console.error('Error inserting activities:', insertError);
      }
    }

    // Update integration with sync timestamp
    await supabaseAdmin
      .from('integrations')
      .update({ 
        last_synced_at: new Date().toISOString(),
        last_github_sync: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    return NextResponse.json({
      success: true,
      synced: {
        commits: commits.length,
        pullRequests: prs.length,
        issues: issues.length,
        activities: allActivities.length,
      },
      stats,
    });
  } catch (error) {
    console.error('Error syncing GitHub:', error);
    return NextResponse.json(
      { error: 'Failed to sync GitHub data' },
      { status: 500 }
    );
  }
}

// GET endpoint to check sync status
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

    const { data: integration } = await supabaseAdmin
      .from('integrations')
      .select('github_connected, last_github_sync, last_synced_at')
      .eq('user_id', user.id)
      .single();

    return NextResponse.json({
      connected: integration?.github_connected || false,
      lastSynced: integration?.last_github_sync || integration?.last_synced_at || null,
    });
  } catch (error) {
    console.error('Error checking sync status:', error);
    return NextResponse.json(
      { error: 'Failed to check sync status' },
      { status: 500 }
    );
  }
}
