import { IntegrationError } from '@/types/errors';

export interface NotionPage {
  id: string;
  title: string;
  lastEditedTime: Date;
  url: string;
  parentDatabase?: string;
}

export interface NotionDatabase {
  id: string;
  title: string;
  url: string;
  lastEditedTime: Date;
}

interface NotionAPIPage {
  id: string;
  url: string;
  last_edited_time: string;
  properties: {
    title?: {
      title: Array<{ plain_text: string }>;
    };
    Name?: {
      title: Array<{ plain_text: string }>;
    };
  };
  parent?: {
    type: string;
    database_id?: string;
  };
}

interface NotionAPIDatabase {
  id: string;
  url: string;
  title: Array<{ plain_text: string }>;
  last_edited_time: string;
}

export class NotionClient {
  private token: string;
  private baseUrl = 'https://api.notion.com/v1';
  private notionVersion = '2022-06-28';

  constructor(token: string) {
    if (!token) {
      throw new IntegrationError(
        'Notion token is required',
        'notion',
        'MISSING_TOKEN',
        false
      );
    }
    this.token = token;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Notion-Version': this.notionVersion,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 401) {
          throw new IntegrationError(
            'Invalid or expired Notion token',
            'notion',
            'INVALID_TOKEN',
            false
          );
        }
        
        if (response.status === 429) {
          throw new IntegrationError(
            'Notion API rate limit exceeded',
            'notion',
            'RATE_LIMIT',
            true
          );
        }
        
        throw new IntegrationError(
          errorData.message || `Notion API error: ${response.status}`,
          'notion',
          'API_ERROR',
          response.status >= 500
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof IntegrationError) {
        throw error;
      }
      
      throw new IntegrationError(
        `Failed to connect to Notion: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'notion',
        'NETWORK_ERROR',
        true
      );
    }
  }

  private extractPageTitle(properties: NotionAPIPage['properties']): string {
    // Try 'title' property first (most common)
    if (properties.title?.title?.[0]?.plain_text) {
      return properties.title.title[0].plain_text;
    }
    
    // Try 'Name' property (common in databases)
    if (properties.Name?.title?.[0]?.plain_text) {
      return properties.Name.title[0].plain_text;
    }
    
    return 'Untitled';
  }

  async getRecentPages(since?: Date): Promise<NotionPage[]> {
    try {
      const filter: any = {
        filter: {
          property: 'object',
          value: 'page',
        },
        sort: {
          direction: 'descending',
          timestamp: 'last_edited_time',
        },
      };

      if (since) {
        filter.filter = {
          and: [
            filter.filter,
            {
              timestamp: 'last_edited_time',
              last_edited_time: {
                on_or_after: since.toISOString(),
              },
            },
          ],
        };
      }

      const response = await this.makeRequest<{
        results: NotionAPIPage[];
        has_more: boolean;
        next_cursor: string | null;
      }>('/search', {
        method: 'POST',
        body: JSON.stringify(filter),
      });

      return response.results.map((page) => ({
        id: page.id,
        title: this.extractPageTitle(page.properties),
        lastEditedTime: new Date(page.last_edited_time),
        url: page.url,
        parentDatabase: page.parent?.type === 'database_id' 
          ? page.parent.database_id 
          : undefined,
      }));
    } catch (error) {
      if (error instanceof IntegrationError) {
        throw error;
      }
      throw new IntegrationError(
        `Failed to fetch recent pages: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'notion',
        'FETCH_ERROR',
        true
      );
    }
  }

  async getDatabases(): Promise<NotionDatabase[]> {
    try {
      const response = await this.makeRequest<{
        results: NotionAPIDatabase[];
        has_more: boolean;
        next_cursor: string | null;
      }>('/search', {
        method: 'POST',
        body: JSON.stringify({
          filter: {
            property: 'object',
            value: 'database',
          },
          sort: {
            direction: 'descending',
            timestamp: 'last_edited_time',
          },
        }),
      });

      return response.results.map((db) => ({
        id: db.id,
        title: db.title?.[0]?.plain_text || 'Untitled Database',
        url: db.url,
        lastEditedTime: new Date(db.last_edited_time),
      }));
    } catch (error) {
      if (error instanceof IntegrationError) {
        throw error;
      }
      throw new IntegrationError(
        `Failed to fetch databases: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'notion',
        'FETCH_ERROR',
        true
      );
    }
  }

  async getPageContent(pageId: string): Promise<string> {
    try {
      // Remove hyphens from page ID if present
      const cleanPageId = pageId.replace(/-/g, '');
      
      const response = await this.makeRequest<{
        results: Array<{
          type: string;
          [key: string]: any;
        }>;
      }>(`/blocks/${cleanPageId}/children`, {
        method: 'GET',
      });

      // Extract text content from blocks
      const textContent = response.results
        .map((block) => {
          if (block.type === 'paragraph' && block.paragraph?.rich_text) {
            return block.paragraph.rich_text
              .map((text: any) => text.plain_text)
              .join('');
          }
          if (block.type === 'heading_1' && block.heading_1?.rich_text) {
            return block.heading_1.rich_text
              .map((text: any) => text.plain_text)
              .join('');
          }
          if (block.type === 'heading_2' && block.heading_2?.rich_text) {
            return block.heading_2.rich_text
              .map((text: any) => text.plain_text)
              .join('');
          }
          if (block.type === 'heading_3' && block.heading_3?.rich_text) {
            return block.heading_3.rich_text
              .map((text: any) => text.plain_text)
              .join('');
          }
          if (block.type === 'bulleted_list_item' && block.bulleted_list_item?.rich_text) {
            return '• ' + block.bulleted_list_item.rich_text
              .map((text: any) => text.plain_text)
              .join('');
          }
          if (block.type === 'numbered_list_item' && block.numbered_list_item?.rich_text) {
            return block.numbered_list_item.rich_text
              .map((text: any) => text.plain_text)
              .join('');
          }
          return '';
        })
        .filter((text) => text.length > 0)
        .join('\n');

      return textContent || 'No content available';
    } catch (error) {
      if (error instanceof IntegrationError) {
        throw error;
      }
      throw new IntegrationError(
        `Failed to fetch page content: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'notion',
        'FETCH_ERROR',
        true
      );
    }
  }
}
