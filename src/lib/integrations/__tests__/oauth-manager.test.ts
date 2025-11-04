import { OAuthManager } from '../oauth-manager';

describe('OAuthManager', () => {
  let oauthManager: OAuthManager;

  beforeEach(() => {
    oauthManager = new OAuthManager();
    jest.clearAllMocks();
  });

  describe('GitHub OAuth Flow', () => {
    it('should generate valid GitHub authorization URL', () => {
      const url = oauthManager.getAuthorizationUrl('github', 'test-state-123');
      
      expect(url).toContain('https://github.com/login/oauth/authorize');
      expect(url).toContain('client_id=');
      expect(url).toContain('state=test-state-123');
      expect(url).toContain('scope=');
    });

    it('should exchange GitHub authorization code for tokens', async () => {
      const mockTokenResponse = {
        access_token: 'gho_test_token',
        token_type: 'bearer',
        scope: 'repo,user',
      };

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockTokenResponse,
      } as Response);

      const tokens = await oauthManager.exchangeCodeForTokens('github', 'test-code');

      expect(tokens).toHaveProperty('accessToken');
      expect(tokens.accessToken).toBe('gho_test_token');
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('github.com'),
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });

  describe('Notion OAuth Flow', () => {
    it('should generate valid Notion authorization URL', () => {
      const url = oauthManager.getAuthorizationUrl('notion', 'test-state-456');
      
      expect(url).toContain('https://api.notion.com/v1/oauth/authorize');
      expect(url).toContain('client_id=');
      expect(url).toContain('state=test-state-456');
      expect(url).toContain('response_type=code');
    });

    it('should exchange Notion authorization code for tokens', async () => {
      const mockTokenResponse = {
        access_token: 'notion_test_token',
        workspace_id: 'workspace-123',
      };

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockTokenResponse,
      } as Response);

      const tokens = await oauthManager.exchangeCodeForTokens('notion', 'test-code');

      expect(tokens).toHaveProperty('accessToken');
      expect(tokens.accessToken).toBe('notion_test_token');
    });
  });

  describe('Slack OAuth Flow', () => {
    it('should generate valid Slack authorization URL', () => {
      const url = oauthManager.getAuthorizationUrl('slack', 'test-state-789');
      
      expect(url).toContain('https://slack.com/oauth/v2/authorize');
      expect(url).toContain('client_id=');
      expect(url).toContain('state=test-state-789');
      expect(url).toContain('scope=');
    });

    it('should exchange Slack authorization code for tokens', async () => {
      const mockTokenResponse = {
        ok: true,
        access_token: 'xoxb-slack-token',
        team: { id: 'T123456' },
      };

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockTokenResponse,
      } as Response);

      const tokens = await oauthManager.exchangeCodeForTokens('slack', 'test-code');

      expect(tokens).toHaveProperty('accessToken');
      expect(tokens.accessToken).toBe('xoxb-slack-token');
    });
  });

  describe('Google Calendar OAuth Flow', () => {
    it('should generate valid Google Calendar authorization URL', () => {
      const url = oauthManager.getAuthorizationUrl('calendar', 'test-state-abc');
      
      expect(url).toContain('https://accounts.google.com/o/oauth2/v2/auth');
      expect(url).toContain('client_id=');
      expect(url).toContain('state=test-state-abc');
      expect(url).toContain('scope=');
      expect(url).toContain('access_type=offline');
    });

    it('should exchange Google Calendar authorization code for tokens', async () => {
      const mockTokenResponse = {
        access_token: 'ya29.google_token',
        refresh_token: 'refresh_token_123',
        expires_in: 3600,
        token_type: 'Bearer',
      };

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockTokenResponse,
      } as Response);

      const tokens = await oauthManager.exchangeCodeForTokens('calendar', 'test-code');

      expect(tokens).toHaveProperty('accessToken');
      expect(tokens).toHaveProperty('refreshToken');
      expect(tokens.accessToken).toBe('ya29.google_token');
      expect(tokens.refreshToken).toBe('refresh_token_123');
    });
  });

  describe('Token Refresh', () => {
    it('should refresh expired Google Calendar token', async () => {
      const mockRefreshResponse = {
        access_token: 'ya29.new_token',
        expires_in: 3600,
        token_type: 'Bearer',
      };

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockRefreshResponse,
      } as Response);

      const tokens = await oauthManager.refreshAccessToken('calendar', 'refresh_token_123');

      expect(tokens).toHaveProperty('accessToken');
      expect(tokens.accessToken).toBe('ya29.new_token');
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('token'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('refresh_token'),
        })
      );
    });
  });

  describe('Token Revocation', () => {
    it('should revoke GitHub token', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
      } as Response);

      await expect(
        oauthManager.revokeToken('github', 'gho_test_token')
      ).resolves.not.toThrow();

      expect(fetch).toHaveBeenCalled();
    });

    it('should revoke Notion token', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
      } as Response);

      await expect(
        oauthManager.revokeToken('notion', 'notion_test_token')
      ).resolves.not.toThrow();
    });

    it('should revoke Slack token', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true }),
      } as Response);

      await expect(
        oauthManager.revokeToken('slack', 'xoxb-slack-token')
      ).resolves.not.toThrow();
    });

    it('should revoke Google Calendar token', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
      } as Response);

      await expect(
        oauthManager.revokeToken('calendar', 'ya29.google_token')
      ).resolves.not.toThrow();
    });
  });
});
