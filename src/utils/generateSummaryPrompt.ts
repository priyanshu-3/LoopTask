import { Activity } from '@/types/integration';

export function generateSummaryPrompt(activities: Activity[]): string {
  const commits = activities.filter(a => a.type === 'commit');
  const prs = activities.filter(a => a.type === 'pr');
  const meetings = activities.filter(a => a.type === 'meeting');

  return `
Generate a concise daily summary for a developer based on these activities:

**Commits:** ${commits.length}
${commits.slice(0, 5).map(c => `- ${c.content}`).join('\n')}

**Pull Requests:** ${prs.length}
${prs.slice(0, 3).map(pr => `- ${pr.content}`).join('\n')}

**Meetings:** ${meetings.length}
${meetings.map(m => `- ${m.content}`).join('\n')}

Provide a friendly summary with productivity insights.
  `.trim();
}
