/**
 * OAuth Manager
 * Handles OAuth 2.0 flows for all integration providers
 */

export type IntegrationProvider = 'github' | 'notion' | 'slack' | 'calendar';

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
  authUrl: string;
  tokenUrl: string;
  revokeUrl?: string;
}

export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
  scope: string;
  tokenType?: string;
}

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  token_type?: string;
}

export class OAuthManager {
  private configs: Map<IntegrationProvider, OAuthConfig>;

  constructor() {
    this.configs = new Map();
    this.initializeConfigs();
  }

  /**
   * Initialize OAuth configurations for all providers
   */
  private initializeConfigs(): void {
    // GitHub OAuth Configuration
    if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
      this.configs.set('github', {
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        redirectUri: `${process.env.NEXTAUTH_URL}/api/integrations/github/callback`,
        scopes: ['repo', 'read:user', 'read:org'],
        authUrl: 'https://github.com/login/oauth/authorize',
        tokenUrl: 'https://github.com/login/oauth/access_token',
        revokeUrl: 'https://api.github.com/applications/{client_id}/token',
      });
    }

    // Notion OAuth Configuration
    if (process.env.NOTION_CLIENT_ID && process.env.NOTION_CLIENT_SECRET) {
      this.configs.set('notion', {
        clientId: process.env.NOTION_CLIENT_ID,
        clientSecret: process.env.NOTION_CLIENT_SECRET,
        redirectUri: `${process.env.NEXTAUTH_URL}/api/integrations/notion/callback`,
        scopes: ['read_content', 'read_user'],
        authUrl: 'https://api.notion.com/v1/oauth/authorize',
        tokenUrl: 'https://api.notion.com/v1/oauth/token',
      });
    }

    // Slack OAuth Configuration
    if (process.env.SLACK_CLIENT_ID && process.env.SLACK_CLIENT_SECRET) {
      this.configs.set('slack', {
        clientId: process.env.SLACK_CLIENT_ID,
        clientSecret: process.env.SLACK_CLIENT_SECRET,
        redirectUri: `${process.env.NEXTAUTH_URL}/api/integrations/slack/callback`,
        scopes: [
          'channels:history',
          'channels:read',
          'users:read',
          'team:read',
          'im:history',
          'reactions:read',
        ],
        authUrl: 'https://slack.com/oauth/v2/authorize',
        tokenUrl: 'https://slack.com/api/oauth.v2.access',
        revokeUrl: 'https://slack.com/api/auth.revoke',
      });
    }

    // Google Calendar OAuth Configuration
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
      this.configs.set('calendar', {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        redirectUri: `${process.env.NEXTAUTH_URL}/api/integrations/calendar/callback`,
        scopes: [
          'https://www.googleapis.com/auth/calendar.readonly',
          'https://www.googleapis.com/auth/calendar.events.readonly',
        ],
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        revokeUrl: 'https://oauth2.googleapis.com/revoke',
      });
    }
  }

  /**
   * Get OAuth configuration for a provider
   */
  private getConfig(provider: IntegrationProvider): OAuthConfig {
    const config = this.configs.get(provider);
    if (!config) {
      throw new Error(
        `OAuth configuration not found for provider: ${provider}. Please check environment variables.`
      );
    }
    return config;
  }

  /**
   * Generate authorization URL for OAuth flow
   * @param provider - Integration provider
   * @param state - CSRF protection state parameter
   * @returns Authorization URL to redirect user to
   */
  getAuthorizationUrl(provider: IntegrationProvider, state?: string): string {
    const config = this.getConfig(provider);
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      scope: config.scopes.join(' '),
      response_type: 'code',
    });

    // Add state parameter for CSRF protection
    if (state) {
      params.append('state', state);
    }

    // Provider-specific parameters
    if (provider === 'calendar') {
      params.append('access_type', 'offline'); // Request refresh token
      params.append('prompt', 'consent'); // Force consent screen to get refresh token
    }

    if (provider === 'slack') {
      params.append('user_scope', config.scopes.join(','));
    }

    return `${config.authUrl}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access tokens
   * @param provider - Integration provider
   * @param code - Authorization code from OAuth callback
   * @returns OAuth tokens including access token and optional refresh token
   */
  async exchangeCodeForTokens(
    provider: IntegrationProvider,
    code: string
  ): Promise<OAuthTokens> {
    const config = this.getConfig(provider);

    const body = new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      redirect_uri: config.redirectUri,
    });

    // Provider-specific parameters
    if (provider === 'github') {
      // GitHub doesn't use grant_type
    } else if (provider === 'notion') {
      body.append('grant_type', 'authorization_code');
    } else {
      body.append('grant_type', 'authorization_code');
    }

    try {
      const response = await fetch(config.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
        body: body.toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Token exchange failed for ${provider}: ${response.status} ${errorText}`
        );
      }

      const data: TokenResponse = await response.json();

      // Check for error in response body (some providers return 200 with error)
      if ('error' in data) {
        throw new Error(
          `Token exchange failed for ${provider}: ${(data as any).error}`
        );
      }

      return this.parseTokenResponse(data);
    } catch (error) {
      console.error(`Error exchanging code for tokens (${provider}):`, error);
      throw error;
    }
  }

  /**
   * Refresh an expired access token using refresh token
   * @param provider - Integration provider
   * @param refreshToken - Refresh token
   * @returns New OAuth tokens
   */
  async refreshAccessToken(
    provider: IntegrationProvider,
    refreshToken: string
  ): Promise<OAuthTokens> {
    const config = this.getConfig(provider);

    // GitHub doesn't support token refresh
    if (provider === 'github') {
      throw new Error('GitHub does not support token refresh. User must reauthorize.');
    }

    const body = new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    });

    try {
      const response = await fetch(config.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
        body: body.toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Token refresh failed for ${provider}: ${response.status} ${errorText}`
        );
      }

      const data: TokenResponse = await response.json();

      // Check for error in response body
      if ('error' in data) {
        throw new Error(
          `Token refresh failed for ${provider}: ${(data as any).error}`
        );
      }

      return this.parseTokenResponse(data, refreshToken);
    } catch (error) {
      console.error(`Error refreshing access token (${provider}):`, error);
      throw error;
    }
  }

  /**
   * Revoke an access token
   * @param provider - Integration provider
   * @param token - Access token to revoke
   */
  async revokeToken(provider: IntegrationProvider, token: string): Promise<void> {
    const config = this.getConfig(provider);

    if (!config.revokeUrl) {
      console.warn(`No revoke URL configured for ${provider}, skipping revocation`);
      return;
    }

    try {
      let response: Response;

      if (provider === 'github') {
        // GitHub uses DELETE with basic auth
        const revokeUrl = config.revokeUrl.replace('{client_id}', config.clientId);
        response = await fetch(revokeUrl, {
          method: 'DELETE',
          headers: {
            Authorization: `Basic ${Buffer.from(
              `${config.clientId}:${config.clientSecret}`
            ).toString('base64')}`,
            Accept: 'application/json',
          },
          body: JSON.stringify({ access_token: token }),
        });
      } else if (provider === 'slack') {
        // Slack uses POST with token parameter
        response = await fetch(config.revokeUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json',
          },
          body: new URLSearchParams({ token }).toString(),
        });
      } else {
        // Google uses POST with token parameter
        response = await fetch(config.revokeUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({ token }).toString(),
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `Token revocation failed for ${provider}: ${response.status} ${errorText}`
        );
        // Don't throw - revocation failure shouldn't block disconnect
      }
    } catch (error) {
      console.error(`Error revoking token (${provider}):`, error);
      // Don't throw - revocation failure shouldn't block disconnect
    }
  }

  /**
   * Parse token response from provider
   */
  private parseTokenResponse(
    data: TokenResponse,
    existingRefreshToken?: string
  ): OAuthTokens {
    const expiresIn = data.expires_in || 3600; // Default to 1 hour if not provided
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || existingRefreshToken,
      expiresAt,
      scope: data.scope || '',
      tokenType: data.token_type || 'Bearer',
    };
  }
}

// Export singleton instance
export const oauthManager = new OAuthManager();
