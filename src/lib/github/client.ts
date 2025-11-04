// GitHub API Client with proper error handling and types


export interface GitHubCommit {
  sha: string;
  message: string;
  author: {
    name: string;
    email: string;
    date: string;
  };
  url: string;
  repository: string;
}

export interface GitHubPullRequest {
  number: number;
  title: string;
  state: 'open' | 'closed' | 'merged';
  created_at: string;
  updated_at: string;
  merged_at: string | null;
  url: string;
  repository: string;
  additions: number;
  deletions: number;
}

export interface GitHubIssue {
  number: number;
  title: string;
  state: 'open' | 'closed';
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  url: string;
  repository: string;
  labels: string[];
  assignees: string[];
}

export interface GitHubRepository {
  name: string;
  full_name: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  url: string;
  updated_at: string;
}

export interface GitHubStats {
  totalCommits: number;
  totalPRs: number;
  totalRepos: number;
  languages: Record<string, number>;
  commitsByDay: Record<string, number>;
}

export class GitHubClient {
  private token: string;
  private baseUrl = 'https://api.github.com';

  constructor(token: string) {
    this.token = token;
  }

  private async fetch<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      // Handle rate limiting
      if (response.status === 403) {
        const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
        const rateLimitReset = response.headers.get('X-RateLimit-Reset');
        
        if (rateLimitRemaining === '0' && rateLimitReset) {
          const resetDate = new Date(parseInt(rateLimitReset) * 1000);
          const waitTime = Math.ceil((resetDate.getTime() - Date.now()) / 1000);
          throw new Error(
            `GitHub API rate limit exceeded. Resets in ${waitTime} seconds at ${resetDate.toISOString()}`
          );
        }
      }
      
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getUser() {
    return this.fetch<any>('/user');
  }

  async getRepositories(): Promise<GitHubRepository[]> {
    const repos = await this.fetch<any[]>('/user/repos?sort=updated&per_page=100');
    return repos.map(repo => ({
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description || '',
      language: repo.language || 'Unknown',
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      url: repo.html_url,
      updated_at: repo.updated_at,
    }));
  }

  async getCommits(since?: Date): Promise<GitHubCommit[]> {
    try {
      const user = await this.getUser();
      const repos = await this.getRepositories();
      
      const allCommits: GitHubCommit[] = [];
      const sinceParam = since ? `&since=${since.toISOString()}` : '';

      for (const repo of repos.slice(0, 20)) { // Limit to 20 repos to avoid rate limits
        try {
          const commits = await this.fetch<any[]>(
            `/repos/${repo.full_name}/commits?author=${user.login}${sinceParam}&per_page=100`
          );

          for (const commit of commits) {
            // Additional date filtering on client side for precision
            const commitDate = new Date(commit.commit.author.date);
            if (since && commitDate < since) {
              continue;
            }

            allCommits.push({
              sha: commit.sha,
              message: commit.commit.message,
              author: {
                name: commit.commit.author.name,
                email: commit.commit.author.email,
                date: commit.commit.author.date,
              },
              url: commit.html_url,
              repository: repo.full_name,
            });
          }
        } catch (error) {
          console.error(`Error fetching commits for ${repo.full_name}:`, error);
          // Continue with other repos even if one fails
        }
      }

      return allCommits;
    } catch (error) {
      console.error('Error in getCommits:', error);
      throw error;
    }
  }

  async getPullRequests(since?: Date): Promise<GitHubPullRequest[]> {
    try {
      const user = await this.getUser();
      const repos = await this.getRepositories();
      
      const allPRs: GitHubPullRequest[] = [];

      for (const repo of repos.slice(0, 20)) {
        try {
          // Use sort and direction parameters for better filtering
          const sortParam = since ? '&sort=created&direction=desc' : '';
          const prs = await this.fetch<any[]>(
            `/repos/${repo.full_name}/pulls?state=all${sortParam}&per_page=100`
          );

          for (const pr of prs) {
            if (pr.user.login === user.login) {
              // Filter by date if provided
              const createdAt = new Date(pr.created_at);
              if (since && createdAt < since) {
                continue;
              }

              allPRs.push({
                number: pr.number,
                title: pr.title,
                state: pr.merged_at ? 'merged' : pr.state,
                created_at: pr.created_at,
                updated_at: pr.updated_at,
                merged_at: pr.merged_at,
                url: pr.html_url,
                repository: repo.full_name,
                additions: pr.additions || 0,
                deletions: pr.deletions || 0,
              });
            }
          }
        } catch (error) {
          console.error(`Error fetching PRs for ${repo.full_name}:`, error);
          // Continue with other repos even if one fails
        }
      }

      return allPRs;
    } catch (error) {
      console.error('Error in getPullRequests:', error);
      throw error;
    }
  }

  async getIssues(since?: Date): Promise<GitHubIssue[]> {
    try {
      const user = await this.getUser();
      const repos = await this.getRepositories();
      
      const allIssues: GitHubIssue[] = [];

      for (const repo of repos.slice(0, 20)) {
        try {
          // Use sort and direction parameters for better filtering
          const sortParam = since ? '&sort=created&direction=desc' : '';
          const sinceParam = since ? `&since=${since.toISOString()}` : '';
          const issues = await this.fetch<any[]>(
            `/repos/${repo.full_name}/issues?state=all${sortParam}${sinceParam}&per_page=100`
          );

          for (const issue of issues) {
            // Skip pull requests (they appear in issues endpoint too)
            if (issue.pull_request) {
              continue;
            }

            // Filter by creator or assignee
            const isCreator = issue.user.login === user.login;
            const isAssignee = issue.assignees?.some((a: any) => a.login === user.login);
            
            if (isCreator || isAssignee) {
              // Additional date filtering on client side for precision
              const createdAt = new Date(issue.created_at);
              if (since && createdAt < since) {
                continue;
              }

              allIssues.push({
                number: issue.number,
                title: issue.title,
                state: issue.state,
                created_at: issue.created_at,
                updated_at: issue.updated_at,
                closed_at: issue.closed_at,
                url: issue.html_url,
                repository: repo.full_name,
                labels: issue.labels?.map((l: any) => l.name) || [],
                assignees: issue.assignees?.map((a: any) => a.login) || [],
              });
            }
          }
        } catch (error) {
          console.error(`Error fetching issues for ${repo.full_name}:`, error);
          // Continue with other repos even if one fails
        }
      }

      return allIssues;
    } catch (error) {
      console.error('Error in getIssues:', error);
      throw error;
    }
  }

  async getStats(since?: Date): Promise<GitHubStats> {
    const [commits, prs, repos] = await Promise.all([
      this.getCommits(since),
      this.getPullRequests(since),
      this.getRepositories(),
    ]);

    const languages: Record<string, number> = {};
    repos.forEach(repo => {
      if (repo.language) {
        languages[repo.language] = (languages[repo.language] || 0) + 1;
      }
    });

    const commitsByDay: Record<string, number> = {};
    commits.forEach(commit => {
      const date = new Date(commit.author.date).toISOString().split('T')[0];
      commitsByDay[date] = (commitsByDay[date] || 0) + 1;
    });

    return {
      totalCommits: commits.length,
      totalPRs: prs.length,
      totalRepos: repos.length,
      languages,
      commitsByDay,
    };
  }
}
