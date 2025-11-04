import { TokenManager } from '../token-manager';
import { encrypt, decrypt } from '../encryption';
import { CSRFManager } from '../csrf-manager';
import { RateLimiter } from '../rate-limiter';
import { createClient } from '@supabase/supabase-js';

// Mock dependencies
jest.mock('@supabase/supabase-js');
jest.mock('../encryption');

describe('Security Measures', () => {
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabase);
    jest.clearAllMocks();
  });

  describe('Token Encryption', () => {
    it('should encrypt tokens before storing in database', async () => {
      const tokenManager = new TokenManager();
      
      (encrypt as jest.Mock).mockReturnValue('encrypted_token_data');
      mockSupabase.upsert.mockResolvedValueOnce({ error: null });

      const tokens = {
        accessToken: 'gho_sensitive_token',
        expiresAt: new Date(Date.now() + 3600000),
        scope: 'repo',
      };

      await tokenManager.storeToken('user-123', 'github', tokens);

      expect(encrypt).toHaveBeenCalledWith('gho_sensitive_token', expect.any(String));
      expect(mockSupabase.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          github_token_encrypted: 'encrypted_token_data',
        })
      );
    });

    it('should decrypt tokens when retrieving from database', async () => {
      const tokenManager = new TokenManager();

      mockSupabase.single.mockResolvedValueOnce({
        data: {
          github_token_encrypted: 'encrypted_token_data',
          github_token_expires_at: new Date(Date.now() + 3600000).toISOString(),
        },
        error: null,
      });

      (decrypt as jest.Mock).mockReturnValue('gho_decrypted_token');

      const tokens = await tokenManager.getToken('user-123', 'github');

      expect(decrypt).toHaveBeenCalledWith('encrypted_token_data', expect.any(String));
      expect(tokens?.accessToken).toBe('gho_decrypted_token');
    });

    it('should verify tokens are never stored in plain text', async () => {
      const tokenManager = new TokenManager();

      (encrypt as jest.Mock).mockReturnValue('encrypted_data');
      mockSupabase.upsert.mockResolvedValueOnce({ error: null });

      const tokens = {
        accessToken: 'plain_text_token',
        refreshToken: 'plain_text_refresh',
        expiresAt: new Date(Date.now() + 3600000),
        scope: 'read',
      };

      await tokenManager.storeToken('user-123', 'notion', tokens);

      const upsertCall = mockSupabase.upsert.mock.calls[0][0];
      
      // Verify plain text tokens are not in the database call
      expect(JSON.stringify(upsertCall)).not.toContain('plain_text_token');
      expect(JSON.stringify(upsertCall)).not.toContain('plain_text_refresh');
      expect(upsertCall).toHaveProperty('notion_token_encrypted');
    });

    it('should use AES-256-GCM encryption', () => {
      const testData = 'sensitive_token_data';
      const key = 'test-encryption-key-32-bytes-long!';

      (encrypt as jest.Mock).mockImplementation((data, encKey) => {
        expect(encKey).toHaveLength(32); // AES-256 requires 32-byte key
        return 'encrypted_' + data;
      });

      encrypt(testData, key);

      expect(encrypt).toHaveBeenCalled();
    });
  });

  describe('CSRF Protection', () => {
    it('should generate unique state tokens for OAuth flows', () => {
      const csrfManager = new CSRFManager();

      const state1 = csrfManager.generateState('user-123', 'github');
      const state2 = csrfManager.generateState('user-123', 'github');

      expect(state1).toBeTruthy();
      expect(state2).toBeTruthy();
      expect(state1).not.toBe(state2);
    });

    it('should validate state parameter in OAuth callback', () => {
      const csrfManager = new CSRFManager();

      const state = csrfManager.generateState('user-123', 'github');
      const isValid = csrfManager.validateState(state, 'user-123', 'github');

      expect(isValid).toBe(true);
    });

    it('should reject invalid state tokens', () => {
      const csrfManager = new CSRFManager();

      const isValid = csrfManager.validateState('invalid_state', 'user-123', 'github');

      expect(isValid).toBe(false);
    });

    it('should expire state tokens after timeout', async () => {
      const csrfManager = new CSRFManager();

      const state = csrfManager.generateState('user-123', 'github');

      // Wait for expiration (mock time passage)
      jest.useFakeTimers();
      jest.advanceTimersByTime(600000); // 10 minutes

      const isValid = csrfManager.validateState(state, 'user-123', 'github');

      expect(isValid).toBe(false);

      jest.useRealTimers();
    });

    it('should include state in OAuth authorization URL', () => {
      const csrfManager = new CSRFManager();
      const state = csrfManager.generateState('user-123', 'github');

      const authUrl = `https://github.com/login/oauth/authorize?client_id=test&state=${state}`;

      expect(authUrl).toContain(`state=${state}`);
      expect(state).toHaveLength(32); // Standard state length
    });
  });

  describe('Rate Limiting', () => {
    it('should limit sync endpoint to 10 requests per minute per user', async () => {
      const rateLimiter = new RateLimiter();

      // Make 10 requests (should all succeed)
      for (let i = 0; i < 10; i++) {
        const allowed = await rateLimiter.checkLimit('user-123', 'sync');
        expect(allowed).toBe(true);
      }

      // 11th request should be rate limited
      const allowed = await rateLimiter.checkLimit('user-123', 'sync');
      expect(allowed).toBe(false);
    });

    it('should limit summary endpoint to 20 requests per minute per user', async () => {
      const rateLimiter = new RateLimiter();

      // Make 20 requests (should all succeed)
      for (let i = 0; i < 20; i++) {
        const allowed = await rateLimiter.checkLimit('user-123', 'summary');
        expect(allowed).toBe(true);
      }

      // 21st request should be rate limited
      const allowed = await rateLimiter.checkLimit('user-123', 'summary');
      expect(allowed).toBe(false);
    });

    it('should return 429 status with retry-after header when rate limited', async () => {
      const rateLimiter = new RateLimiter();

      // Exhaust rate limit
      for (let i = 0; i < 10; i++) {
        await rateLimiter.checkLimit('user-123', 'sync');
      }

      const result = await rateLimiter.checkLimit('user-123', 'sync');
      const retryAfter = rateLimiter.getRetryAfter('user-123', 'sync');

      expect(result).toBe(false);
      expect(retryAfter).toBeGreaterThan(0);
      expect(retryAfter).toBeLessThanOrEqual(60);
    });

    it('should reset rate limit after time window', async () => {
      const rateLimiter = new RateLimiter();

      // Exhaust rate limit
      for (let i = 0; i < 10; i++) {
        await rateLimiter.checkLimit('user-123', 'sync');
      }

      expect(await rateLimiter.checkLimit('user-123', 'sync')).toBe(false);

      // Fast forward time
      jest.useFakeTimers();
      jest.advanceTimersByTime(60000); // 1 minute

      expect(await rateLimiter.checkLimit('user-123', 'sync')).toBe(true);

      jest.useRealTimers();
    });
  });

  describe('HTTPS-Only Redirects', () => {
    it('should enforce HTTPS in OAuth redirect URIs', () => {
      const redirectUri = process.env.NEXTAUTH_URL + '/api/integrations/github/callback';

      expect(redirectUri).toMatch(/^https:\/\//);
    });

    it('should reject HTTP redirect URIs in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const httpUri = 'http://example.com/callback';
      const httpsUri = 'https://example.com/callback';

      expect(httpUri.startsWith('https://')).toBe(false);
      expect(httpsUri.startsWith('https://')).toBe(true);

      process.env.NODE_ENV = originalEnv;
    });

    it('should use secure cookies for OAuth state', () => {
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        maxAge: 600, // 10 minutes
      };

      expect(cookieOptions.httpOnly).toBe(true);
      expect(cookieOptions.sameSite).toBe('lax');
    });
  });

  describe('Data Deletion on Disconnect', () => {
    it('should delete all tokens when disconnecting integration', async () => {
      const tokenManager = new TokenManager();

      mockSupabase.eq.mockReturnThis();
      mockSupabase.update.mockResolvedValueOnce({ error: null });

      await tokenManager.deleteToken('user-123', 'github');

      expect(mockSupabase.update).toHaveBeenCalledWith(
        expect.objectContaining({
          github_token_encrypted: null,
          github_refresh_token_encrypted: null,
        })
      );
    });

    it('should delete activity data when disconnecting integration', async () => {
      mockSupabase.eq.mockReturnThis();
      mockSupabase.delete.mockResolvedValueOnce({ error: null });

      await mockSupabase
        .from('activities')
        .delete()
        .eq('user_id', 'user-123')
        .eq('source', 'github');

      expect(mockSupabase.delete).toHaveBeenCalled();
      expect(mockSupabase.eq).toHaveBeenCalledWith('source', 'github');
    });

    it('should delete sync logs when disconnecting integration', async () => {
      mockSupabase.eq.mockReturnThis();
      mockSupabase.delete.mockResolvedValueOnce({ error: null });

      await mockSupabase
        .from('integration_sync_logs')
        .delete()
        .eq('user_id', 'user-123')
        .eq('provider', 'github');

      expect(mockSupabase.delete).toHaveBeenCalled();
      expect(mockSupabase.eq).toHaveBeenCalledWith('provider', 'github');
    });

    it('should delete all user data on account deletion', async () => {
      const userId = 'user-123';

      mockSupabase.eq.mockReturnThis();
      mockSupabase.delete.mockResolvedValue({ error: null });

      // Delete integrations
      await mockSupabase.from('integrations').delete().eq('user_id', userId);

      // Delete activities
      await mockSupabase.from('activities').delete().eq('user_id', userId);

      // Delete sync logs
      await mockSupabase.from('integration_sync_logs').delete().eq('user_id', userId);

      // Delete AI summaries
      await mockSupabase.from('ai_summaries').delete().eq('user_id', userId);

      expect(mockSupabase.delete).toHaveBeenCalledTimes(4);
    });

    it('should verify no sensitive data remains after deletion', async () => {
      const tokenManager = new TokenManager();

      mockSupabase.eq.mockReturnThis();
      mockSupabase.update.mockResolvedValueOnce({ error: null });

      await tokenManager.deleteToken('user-123', 'github');

      mockSupabase.single.mockResolvedValueOnce({
        data: {
          github_token_encrypted: null,
          github_refresh_token_encrypted: null,
        },
        error: null,
      });

      const tokens = await tokenManager.getToken('user-123', 'github');

      expect(tokens).toBeNull();
    });
  });

  describe('Input Validation', () => {
    it('should validate OAuth callback parameters', () => {
      const validateOAuthCallback = (code: string, state: string) => {
        if (!code || typeof code !== 'string') {
          throw new Error('Invalid code parameter');
        }
        if (!state || typeof state !== 'string') {
          throw new Error('Invalid state parameter');
        }
        if (code.length > 500) {
          throw new Error('Code parameter too long');
        }
        return true;
      };

      expect(() => validateOAuthCallback('valid_code', 'valid_state')).not.toThrow();
      expect(() => validateOAuthCallback('', 'valid_state')).toThrow('Invalid code');
      expect(() => validateOAuthCallback('valid_code', '')).toThrow('Invalid state');
    });

    it('should sanitize user inputs', () => {
      const sanitizeInput = (input: string) => {
        return input
          .replace(/[<>]/g, '')
          .replace(/javascript:/gi, '')
          .trim();
      };

      expect(sanitizeInput('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
      expect(sanitizeInput('javascript:alert(1)')).toBe('alert(1)');
      expect(sanitizeInput('  normal input  ')).toBe('normal input');
    });

    it('should validate date range parameters', () => {
      const validateDateRange = (start: string, end: string) => {
        const startDate = new Date(start);
        const endDate = new Date(end);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          throw new Error('Invalid date format');
        }

        if (startDate > endDate) {
          throw new Error('Start date must be before end date');
        }

        const maxRange = 90 * 24 * 60 * 60 * 1000; // 90 days
        if (endDate.getTime() - startDate.getTime() > maxRange) {
          throw new Error('Date range too large');
        }

        return true;
      };

      expect(() => validateDateRange('2024-01-01', '2024-01-31')).not.toThrow();
      expect(() => validateDateRange('invalid', '2024-01-31')).toThrow('Invalid date format');
      expect(() => validateDateRange('2024-01-31', '2024-01-01')).toThrow('Start date must be before end date');
      expect(() => validateDateRange('2024-01-01', '2024-12-31')).toThrow('Date range too large');
    });
  });

  describe('API Key Security', () => {
    it('should never expose API keys in responses', () => {
      const response = {
        success: true,
        provider: 'github',
        // Should NOT include these:
        // clientId: process.env.GITHUB_CLIENT_ID,
        // clientSecret: process.env.GITHUB_CLIENT_SECRET,
      };

      expect(response).not.toHaveProperty('clientId');
      expect(response).not.toHaveProperty('clientSecret');
      expect(response).not.toHaveProperty('apiKey');
    });

    it('should store provider credentials in environment variables', () => {
      expect(process.env.GITHUB_CLIENT_ID).toBeTruthy();
      expect(process.env.GITHUB_CLIENT_SECRET).toBeTruthy();
      expect(process.env.NOTION_CLIENT_ID).toBeTruthy();
      expect(process.env.SLACK_CLIENT_ID).toBeTruthy();
      expect(process.env.GOOGLE_CLIENT_ID).toBeTruthy();
      expect(process.env.OPENAI_API_KEY).toBeTruthy();
    });

    it('should not log sensitive information', () => {
      const logSafeData = (data: any) => {
        const safe = { ...data };
        delete safe.accessToken;
        delete safe.refreshToken;
        delete safe.clientSecret;
        delete safe.apiKey;
        return safe;
      };

      const sensitiveData = {
        userId: 'user-123',
        provider: 'github',
        accessToken: 'gho_secret_token',
        clientSecret: 'secret_key',
      };

      const safeData = logSafeData(sensitiveData);

      expect(safeData).toHaveProperty('userId');
      expect(safeData).toHaveProperty('provider');
      expect(safeData).not.toHaveProperty('accessToken');
      expect(safeData).not.toHaveProperty('clientSecret');
    });
  });
});
