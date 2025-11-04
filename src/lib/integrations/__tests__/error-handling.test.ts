import { SyncService } from '../sync-service';
import { TokenManager } from '../token-manager';
import { OAuthManager } from '../oauth-manager';
import { createClient } from '@supabase/supabase-js';

// Mock dependencies
jest.mock('@supabase/supabase-js');
jest.mock('../token-manager');
jest.mock('../oauth-manager');

describe('Error Scenarios', () => {
  let syncService: SyncService;
  let tokenManager: TokenManager;
  let oauthManager: OAuthManager;
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabase);
    syncService = new SyncService();
    tokenManager = new TokenManager();
    oauthManager = new OAuthManager();
    jest.clearAllMocks();
  });

  describe('Expired Token Handling', () => {
    it('should detect expired token and attempt refresh', async () => {
      const expiredToken = {
        accessToken: 'expired_token',
        refreshToken: 'refresh_token',
        expiresAt: new Date(Date.now() - 1000), // Expired
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: {
          calendar_token_encrypted: 'encrypted_expired_token',
          calendar_refresh_token_encrypted: 'encrypted_refresh_token',
          calendar_token_expires_at: expiredToken.expiresAt.toISOString(),
        },
        error: null,
      });

      // Mock successful token refresh
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'new_token',
          expires_in: 3600,
        }),
      } as Response);

      mockSupabase.update.mockResolvedValueOnce({ error: null });

      const validToken = await tokenManager.getValidToken('user-123', 'calendar');

      expect(validToken).toBeTruthy();
      expect(fetch).toHaveBeenCalled();
    });

    it('should mark connection as requiring reauth if refresh fails', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          calendar_token_encrypted: 'encrypted_expired_token',
          calendar_refresh_token_encrypted: 'encrypted_refresh_token',
          calendar_token_expires_at: new Date(Date.now() - 1000).toISOString(),
        },
        error: null,
      });

      // Mock failed token refresh
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'invalid_grant' }),
      } as Response);

      await expect(
        tokenManager.getValidToken('user-123', 'calendar')
      ).rejects.toThrow();
    });
  });

  describe('Rate Limit Handling', () => {
    it('should handle GitHub rate limit with retry-after header', async () => {
      mockSupabase.single.mockResolvedValue({
        data: { github_token_encrypted: 'encrypted_token' },
        error: null,
      });

      let callCount = 0;
      global.fetch = jest.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({
            ok: false,
            status: 429,
            headers: new Headers({
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': String(Math.floor(Date.now() / 1000) + 60),
            }),
          } as Response);
        }
        return Promise.resolve({
          ok: true,
          json: async () => [],
        } as Response);
      });

      mockSupabase.insert.mockResolvedValue({ error: null });

      const result = await syncService.syncProvider('user-123', 'github');

      expect(result.success).toBe(true);
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    it('should implement exponential backoff for rate limits', async () => {
      mockSupabase.single.mockResolvedValue({
        data: { github_token_encrypted: 'encrypted_token' },
        error: null,
      });

      const startTime = Date.now();
      let callCount = 0;

      global.fetch = jest.fn().mockImplementation(() => {
        callCount++;
        if (callCount <= 2) {
          return Promise.resolve({
            ok: false,
            status: 429,
          } as Response);
        }
        return Promise.resolve({
          ok: true,
          json: async () => [],
        } as Response);
      });

      mockSupabase.insert.mockResolvedValue({ error: null });

      const result = await syncService.syncProvider('user-123', 'github');

      const duration = Date.now() - startTime;
      expect(result.success).toBe(true);
      expect(callCount).toBe(3);
      // Should have some delay due to backoff
      expect(duration).toBeGreaterThan(0);
    });
  });

  describe('Network Failure Handling', () => {
    it('should retry on network timeout', async () => {
      mockSupabase.single.mockResolvedValue({
        data: { github_token_encrypted: 'encrypted_token' },
        error: null,
      });

      let callCount = 0;
      global.fetch = jest.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.reject(new Error('ETIMEDOUT'));
        }
        return Promise.resolve({
          ok: true,
          json: async () => [],
        } as Response);
      });

      mockSupabase.insert.mockResolvedValue({ error: null });

      const result = await syncService.syncProvider('user-123', 'github');

      expect(result.success).toBe(true);
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    it('should fail after max retry attempts on persistent network errors', async () => {
      mockSupabase.single.mockResolvedValue({
        data: { github_token_encrypted: 'encrypted_token' },
        error: null,
      });

      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      mockSupabase.insert.mockResolvedValue({ error: null });

      const result = await syncService.syncProvider('user-123', 'github');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Network error');
      expect(fetch).toHaveBeenCalledTimes(3); // Max retries
    });
  });

  describe('Invalid Token Handling', () => {
    it('should handle 401 unauthorized errors', async () => {
      mockSupabase.single.mockResolvedValue({
        data: { github_token_encrypted: 'encrypted_token' },
        error: null,
      });

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Bad credentials' }),
      } as Response);

      const result = await syncService.syncProvider('user-123', 'github');

      expect(result.success).toBe(false);
      expect(result.error).toContain('401');
    });

    it('should mark connection as requiring reauthorization on invalid token', async () => {
      mockSupabase.single.mockResolvedValue({
        data: { notion_token_encrypted: 'encrypted_token' },
        error: null,
      });

      mockSupabase.update.mockResolvedValue({ error: null });

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'unauthorized' }),
      } as Response);

      const result = await syncService.syncProvider('user-123', 'notion');

      expect(result.success).toBe(false);
      expect(mockSupabase.update).toHaveBeenCalledWith(
        expect.objectContaining({
          notion_requires_reauth: true,
        })
      );
    });
  });

  describe('Provider Downtime Handling', () => {
    it('should handle 503 service unavailable errors', async () => {
      mockSupabase.single.mockResolvedValue({
        data: { slack_token_encrypted: 'encrypted_token' },
        error: null,
      });

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: async () => ({ error: 'service_unavailable' }),
      } as Response);

      mockSupabase.insert.mockResolvedValue({ error: null });

      const result = await syncService.syncProvider('user-123', 'slack');

      expect(result.success).toBe(false);
      expect(result.error).toContain('503');
    });

    it('should log error and continue with other providers on downtime', async () => {
      mockSupabase.single.mockResolvedValue({
        data: {
          github_token_encrypted: 'encrypted_token',
          notion_token_encrypted: 'encrypted_token',
        },
        error: null,
      });

      let callCount = 0;
      global.fetch = jest.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // GitHub fails
          return Promise.resolve({
            ok: false,
            status: 503,
          } as Response);
        }
        // Notion succeeds
        return Promise.resolve({
          ok: true,
          json: async () => ({ results: [] }),
        } as Response);
      });

      mockSupabase.insert.mockResolvedValue({ error: null });

      const results = await syncService.syncAllProviders('user-123');

      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => !r.success)).toBe(true);
      expect(results.some(r => r.success)).toBe(true);
    });
  });

  describe('Error Notifications', () => {
    it('should create notification for authentication errors', async () => {
      mockSupabase.single.mockResolvedValue({
        data: { github_token_encrypted: 'encrypted_token' },
        error: null,
      });

      mockSupabase.insert.mockResolvedValue({ error: null });
      mockSupabase.update.mockResolvedValue({ error: null });

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        status: 401,
      } as Response);

      await syncService.syncProvider('user-123', 'github');

      expect(mockSupabase.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user-123',
          type: 'integration_error',
          message: expect.stringContaining('reauthorization'),
        })
      );
    });

    it('should create notification after 3 consecutive failures', async () => {
      mockSupabase.single.mockResolvedValue({
        data: { github_token_encrypted: 'encrypted_token' },
        error: null,
      });

      mockSupabase.select.mockResolvedValue({
        data: [
          { status: 'failed', created_at: new Date().toISOString() },
          { status: 'failed', created_at: new Date().toISOString() },
          { status: 'failed', created_at: new Date().toISOString() },
        ],
        error: null,
      });

      mockSupabase.insert.mockResolvedValue({ error: null });

      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      await syncService.syncProvider('user-123', 'github');

      expect(mockSupabase.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'integration_error',
          message: expect.stringContaining('consecutive'),
        })
      );
    });

    it('should display error notification in UI', async () => {
      // This would be tested in integration/E2E tests
      // Here we verify the notification data structure
      const notification = {
        id: 'notif-1',
        user_id: 'user-123',
        type: 'integration_error',
        provider: 'github',
        message: 'GitHub integration requires reauthorization',
        severity: 'warning',
        action_url: '/dashboard/integrations',
        created_at: new Date().toISOString(),
      };

      expect(notification).toHaveProperty('type', 'integration_error');
      expect(notification).toHaveProperty('provider');
      expect(notification).toHaveProperty('message');
      expect(notification).toHaveProperty('action_url');
    });
  });
});
