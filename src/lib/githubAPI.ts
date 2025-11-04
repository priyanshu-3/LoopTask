import axios from 'axios';
import { GitHubCommit, GitHubPR } from '@/types/integration';

export async function getGitHubCommits(
  token: string,
  username: string
): Promise<GitHubCommit[]> {
  try {
    // TODO: Get user's repositories first, then fetch commits
    const response = await axios.get(
      `https://api.github.com/users/${username}/events`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    const commits = response.data
      .filter((event: any) => event.type === 'PushEvent')
      .flatMap((event: any) =>
        event.payload.commits.map((commit: any) => ({
          sha: commit.sha,
          message: commit.message,
          author: event.actor.login,
          date: event.created_at,
          url: `https://github.com/${event.repo.name}/commit/${commit.sha}`,
        }))
      )
      .slice(0, 10);

    return commits;
  } catch (error) {
    console.error('Error fetching GitHub commits:', error);
    return [];
  }
}

export async function getGitHubPRs(
  token: string,
  username: string
): Promise<GitHubPR[]> {
  try {
    const response = await axios.get(
      `https://api.github.com/search/issues?q=author:${username}+type:pr`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    const prs = response.data.items.slice(0, 10).map((pr: any) => ({
      number: pr.number,
      title: pr.title,
      state: pr.state,
      merged: pr.pull_request?.merged_at !== null,
      created_at: pr.created_at,
      url: pr.html_url,
    }));

    return prs;
  } catch (error) {
    console.error('Error fetching GitHub PRs:', error);
    return [];
  }
}

// Simplified version for automation workflow
export async function getGitHubActivity(username: string) {
  try {
    const res = await fetch(`https://api.github.com/users/${username}/events`);
    const events = await res.json();

    const commits = events
      .filter((e: any) => e.type === 'PushEvent')
      .flatMap((e: any) => e.payload.commits || []);

    const prs = events.filter((e: any) => e.type === 'PullRequestEvent');

    return { commits, prs };
  } catch (error) {
    console.error('Error fetching GitHub activity:', error);
    return { commits: [], prs: [] };
  }
}
