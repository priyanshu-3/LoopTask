import OpenAI from 'openai';
import { GitHubCommit, GitHubPR, CalendarEvent } from '@/types/integration';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-build',
});

export async function generateAISummary(data: {
  commits: any[];
  prs: any[];
  meetings: any[];
}): Promise<string> {
  // Check if API key is configured
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'dummy-key-for-build') {
    return `Great progress today! You've made ${data.commits.length} commits, worked on ${data.prs.length} pull requests, and attended ${data.meetings.length} meetings. Keep up the momentum! 🚀 (Configure OPENAI_API_KEY to enable AI summaries)`;
  }

  try {
    const commitCount = data.commits.length;
    const prCount = data.prs.length;
    const meetingCount = data.meetings.length;

    const prompt = `Summarize today's developer activity in a friendly tone.
Include:
- ${commitCount} commits
- ${prCount} pull requests
- ${meetingCount} meetings
End with a short motivational line.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
      temperature: 0.7,
    });

    return response.choices[0].message.content || 'No summary available.';
  } catch (error) {
    console.error('Error generating AI summary:', error);
    return 'Unable to generate summary at this time. Please check your OpenAI API key.';
  }
}

// Legacy function for backward compatibility
export async function generateAISummaryLegacy(
  commits: GitHubCommit[],
  prs: GitHubPR[],
  events: CalendarEvent[]
): Promise<string> {
  return generateAISummary({
    commits,
    prs,
    meetings: events,
  });
}
