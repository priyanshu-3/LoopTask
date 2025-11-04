import { IntegrationError } from '@/types/errors';

export interface SlackActivity {
  messageCount: number;
  channelParticipation: Array<{
    channelId: string;
    channelName: string;
    messageCount: number;
  }>;
  dmCount: number;
  reactionsGiven: number;
}

export interface SlackChannel {
  id: string;
  name: string;
  isMember: boolean;
  isPrivate: boolean;
  memberCount?: number;
}

export interface SlackTeam {
  id: string;
  name: string;
  domain: string;
  icon?: string;
}

interface SlackAPIChannel {
  id: string;
  name: string;
  is_member: boolean;
  is_private: boolean;
  num_members?: number;
}

interface SlackAPITeam {
  id: string;
  name: string;
  domain: string;
  icon?: {
    image_68?: string;
  };
}

interface SlackAPIMessage {
  type: string;
  user?: string;
  ts: string;
  text?: string;
}

export class SlackClient {
  private token: string;
  private baseUrl = 'https://slack.com/api';

  constructor(token: string) {
    if (!token) {
      throw new IntegrationError(
        'Slack token is required',
        'slack',
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
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new IntegrationError(
            'Invalid or expired Slack token',
            'slack',
            'INVALID_TOKEN',
            false
          );
        }
        
        if (response.status === 429) {
          throw new IntegrationError(
            'Slack API rate limit exceeded',
            'slack',
            'RATE_LIMIT',
            true
          );
        }
        
        throw new IntegrationError(
          `Slack API error: ${response.status}`,
          'slack',
          'API_ERROR',
          response.status >= 500
        );
      }

      const data = await response.json();
      
      // Slack returns 200 with ok: false for API errors
      if (!data.ok) {
        if (data.error === 'invalid_auth' || data.error === 'token_revoked') {
          throw new IntegrationError(
            'Invalid or expired Slack token',
            'slack',
            'INVALID_TOKEN',
            false
          );
        }
        
        if (data.error === 'ratelimited') {
          throw new IntegrationError(
            'Slack API rate limit exceeded',
            'slack',
            'RATE_LIMIT',
            true
          );
        }
        
        throw new IntegrationError(
          `Slack API error: ${data.error}`,
          'slack',
          'API_ERROR',
          false
        );
      }

      return data as T;
    } catch (error) {
      if (error instanceof IntegrationError) {
        throw error;
      }
      
      throw new IntegrationError(
        `Failed to connect to Slack: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'slack',
        'NETWORK_ERROR',
        true
      );
    }
  }

  /**
   * Get user activity metrics from Slack
   * @param since - Optional date to fetch activity from
   * @returns Activity metrics including message counts and channel participation
   */
  async getUserActivity(since?: Date): Promise<SlackActivity> {
    try {
      // Get authenticated user info
      const authResponse = await this.makeRequest<{
        ok: boolean;
        user_id: string;
      }>('/auth.test');
      
      const userId = authResponse.user_id;
      
      // Get list of channels user is a member of
      const channelsResponse = await this.makeRequest<{
        ok: boolean;
        channels: SlackAPIChannel[];
      }>('/conversations.list?types=public_channel,private_channel&exclude_archived=true&limit=100');
      
      const userChannels = channelsResponse.channels.filter(ch => ch.is_member);
      
      // Calculate timestamp for 'since' parameter
      const oldest = since ? Math.floor(since.getTime() / 1000).toString() : undefined;
      
      let totalMessages = 0;
      const channelParticipation: Array<{
        channelId: string;
        channelName: string;
        messageCount: number;
      }> = [];
      
      // Get message counts for each channel
      for (const channel of userChannels) {
        try {
          const historyParams = new URLSearchParams({
            channel: channel.id,
            limit: '1000',
          });
          
          if (oldest) {
            historyParams.append('oldest', oldest);
          }
          
          const historyResponse = await this.makeRequest<{
            ok: boolean;
            messages: SlackAPIMessage[];
          }>(`/conversations.history?${historyParams.toString()}`);
          
          // Count messages from the user
          const userMessages = historyResponse.messages.filter(
            msg => msg.user === userId && msg.type === 'message'
          );
          
          const messageCount = userMessages.length;
          totalMessages += messageCount;
          
          if (messageCount > 0) {
            channelParticipation.push({
              channelId: channel.id,
              channelName: channel.name,
              messageCount,
            });
          }
        } catch (error) {
          // Log error but continue with other channels
          console.warn(`Failed to fetch history for channel ${channel.name}:`, error);
        }
      }
      
      // Get DM count
      let dmCount = 0;
      try {
        const imsResponse = await this.makeRequest<{
          ok: boolean;
          channels: Array<{ id: string }>;
        }>('/conversations.list?types=im&exclude_archived=true&limit=100');
        
        for (const im of imsResponse.channels) {
          try {
            const historyParams = new URLSearchParams({
              channel: im.id,
              limit: '1000',
            });
            
            if (oldest) {
              historyParams.append('oldest', oldest);
            }
            
            const historyResponse = await this.makeRequest<{
              ok: boolean;
              messages: SlackAPIMessage[];
            }>(`/conversations.history?${historyParams.toString()}`);
            
            const userMessages = historyResponse.messages.filter(
              msg => msg.user === userId && msg.type === 'message'
            );
            
            dmCount += userMessages.length;
          } catch (error) {
            console.warn(`Failed to fetch DM history:`, error);
          }
        }
      } catch (error) {
        console.warn('Failed to fetch DMs:', error);
      }
      
      // Note: Slack's reactions API requires additional scopes and is complex
      // For now, we'll set reactionsGiven to 0
      // This can be enhanced later with proper reaction tracking
      const reactionsGiven = 0;
      
      return {
        messageCount: totalMessages,
        channelParticipation: channelParticipation.sort(
          (a, b) => b.messageCount - a.messageCount
        ),
        dmCount,
        reactionsGiven,
      };
    } catch (error) {
      if (error instanceof IntegrationError) {
        throw error;
      }
      throw new IntegrationError(
        `Failed to fetch user activity: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'slack',
        'FETCH_ERROR',
        true
      );
    }
  }

  /**
   * Get list of channels in the workspace
   * @returns List of channels
   */
  async getChannels(): Promise<SlackChannel[]> {
    try {
      const response = await this.makeRequest<{
        ok: boolean;
        channels: SlackAPIChannel[];
      }>('/conversations.list?types=public_channel,private_channel&exclude_archived=true&limit=200');
      
      return response.channels.map((channel) => ({
        id: channel.id,
        name: channel.name,
        isMember: channel.is_member,
        isPrivate: channel.is_private,
        memberCount: channel.num_members,
      }));
    } catch (error) {
      if (error instanceof IntegrationError) {
        throw error;
      }
      throw new IntegrationError(
        `Failed to fetch channels: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'slack',
        'FETCH_ERROR',
        true
      );
    }
  }

  /**
   * Get team/workspace information
   * @returns Team information
   */
  async getTeamInfo(): Promise<SlackTeam> {
    try {
      const response = await this.makeRequest<{
        ok: boolean;
        team: SlackAPITeam;
      }>('/team.info');
      
      return {
        id: response.team.id,
        name: response.team.name,
        domain: response.team.domain,
        icon: response.team.icon?.image_68,
      };
    } catch (error) {
      if (error instanceof IntegrationError) {
        throw error;
      }
      throw new IntegrationError(
        `Failed to fetch team info: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'slack',
        'FETCH_ERROR',
        true
      );
    }
  }
}
