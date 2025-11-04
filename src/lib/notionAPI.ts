import axios from 'axios';

export async function createNotionPage(
  token: string,
  databaseId: string,
  title: string,
  content: string
): Promise<void> {
  try {
    // TODO: Implement Notion API integration
    await axios.post(
      'https://api.notion.com/v1/pages',
      {
        parent: { database_id: databaseId },
        properties: {
          Name: {
            title: [
              {
                text: {
                  content: title,
                },
              },
            ],
          },
        },
        children: [
          {
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [
                {
                  type: 'text',
                  text: {
                    content: content,
                  },
                },
              ],
            },
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error creating Notion page:', error);
  }
}

export async function syncCommitToNotion(
  token: string,
  databaseId: string,
  commitMessage: string,
  commitUrl: string
): Promise<void> {
  await createNotionPage(
    token,
    databaseId,
    `Commit: ${commitMessage}`,
    `View commit: ${commitUrl}`
  );
}

// Batch update for automation workflow
export async function updateNotionTasks(commits: any[]): Promise<void> {
  const notionKey = process.env.NOTION_API_KEY;
  const databaseId = process.env.NOTION_DATABASE_ID;
  
  if (!notionKey || !databaseId) {
    console.warn('Notion credentials not configured');
    return;
  }

  for (const commit of commits.slice(0, 5)) {
    try {
      await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${notionKey}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify({
          parent: { database_id: databaseId },
          properties: {
            Name: { title: [{ text: { content: commit.message || 'Commit' } }] },
            Status: { select: { name: 'In Progress' } },
          },
        }),
      });
    } catch (error) {
      console.error('Error updating Notion task:', error);
    }
  }
}
