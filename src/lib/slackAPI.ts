import axios from 'axios';

export async function postToSlack(
  token: string,
  channelId: string,
  message: string
): Promise<void> {
  try {
    await axios.post(
      'https://slack.com/api/chat.postMessage',
      {
        channel: channelId,
        text: message,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: message,
            },
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error posting to Slack:', error);
  }
}

export async function postDailySummaryToSlack(summary: string): Promise<void> {
  const token = process.env.SLACK_BOT_TOKEN;
  const channelId = process.env.SLACK_CHANNEL_ID;

  if (!token || !channelId) {
    console.warn('Slack credentials not configured');
    return;
  }

  const formattedMessage = `📊 *Daily Developer Summary*\n\n${summary}`;
  await postToSlack(token, channelId, formattedMessage);
}

// Simplified version for direct use
export async function postSummaryToSlack(summaryText: string): Promise<void> {
  const slackWebhook = process.env.SLACK_BOT_TOKEN;
  if (!slackWebhook) return;

  await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${slackWebhook}`,
    },
    body: JSON.stringify({
      channel: process.env.SLACK_CHANNEL_ID || '#general',
      text: summaryText,
    }),
  });
}
