import { TokenManager } from '../token-manager';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

describe('TokenManager', () => {
  let tokenManager: TokenManager;
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn(),
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabase);
    tokenManager = new TokenManager();
    jest.clearAllMocks();
  });

  describe('Token Storage', () => {
    it('should store encrypted GitHub token', async () => {
      mockSupabase.upsert.mockResolvedValueOnce({ error: null });

      const tokens = {
        accessToken: 'gho_test_token',
        expiresAt: new Date(Date.now() + 3600000),
        scope: 'repo,user',
      };

      await tokenManager.storeToken('user-123', 'github', tokens);

      expect(mockSupabase.from).toHaveBeenCalledWith('integrations');
      expect(mockSupabase.upsert).toHaveBeenCalled();
    });

    it('should store encrypted Notion token with refresh token', async () => {
      mockSupabase.upsert.mockResolvedValueOnce({ error: null });

      const tokens = {
        accessToken: 'notion_test_token',
        refreshToken: 'notion_refresh_token',
        expiresAt: new Date(Date.now() + 3600000),
        scope: 'read',
      };

      await tokenManager.storeToken('user-456', 'notion', tokens);

      expect(mockSupabase.upsert).toHaveBeenCalled();
    });
  });

  describe('Token Retrieval', () => {
    it('should retrieve and decrypt GitHub token', async () => {
      const mockData = {
        github_token_encrypted: 'encrypted_token_data',
        github_token_expires_at: new Date(Date.now() + 3600000).toISOString(),
      };

      mockSupabase.single.mockResolvedValueOnce({ data: mockData, error: null });

      const tokens = await tokenManager.getToken('user-123', 'github');

      expect(tokens).toBeTruthy();
      expect(mockSupabase.from).toHaveBeenCalledWith('integrations');
      expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', 'user-123');
    });

    it('should return null for non-existent token', async () => {
      mockSupabase.single.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } });

      const tokens = await tokenManager.getToken('user-999', 'github');

      expect(tokens).toBeNull();
    });
  });

  describe('Token Validation', () => {
    it('should return valid token if not expired', async () => {
      const futureDate = new Date(Date.now() + 3600000);
      const mockData = {
        github_token_encrypted: 'encrypted_token_data',
        github_token_expires_at: futureDate.toISOString(),
      };

      mockSupabase.single.mockResolvedValueOnce({ data: mockData, error: null });

      const token = await tokenManager.getValidToken('user-123', 'github');

      expect(token).toBeTruthy();
    });

    it('should refresh token if expired (Google Calendar)', async () => {
      const pastDate = new Date(Date.now() - 1000);
      const mockData = {
        calendar_token_encrypted: 'encrypted_token_data',
        calendar_refresh_token_encrypted: 'encrypted_refresh_token',
        calendar_token_expires_at: pastDate.toISOString(),
      };

      mockSupabase.single.mockResolvedValueOnce({ data: mockData, error: null });
      mockSupabase.upsert.mockResolvedValueOnce({ error: null });

      // Mock the refresh
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'new_token',
          expires_in: 3600,
        }),
      } as Response);

      const token = await tokenManager.getValidToken('user-123', 'calendar');

      expect(token).toBeTruthy();
    });
  });

  describe('Token Deletion', () => {
    it('should delete GitHub token', async () => {
      mockSupabase.eq.mockReturnThis();
      mockSupabase.delete.mockResolvedValueOnce({ error: null });

      await tokenManager.deleteToken('user-123', 'github');

      expect(mockSupabase.from).toHaveBeenCalledWith('integrations');
      expect(mockSupabase.delete).toHaveBeenCalled();
    });

    it('should delete all tokens for a provider', async () => {
      mockSupabase.eq.mockReturnThis();
      mockSupabase.delete.mockResolvedValueOnce({ error: null });

      await tokenManager.deleteToken('user-456', 'slack');

      expect(mockSupabase.delete).toHaveBeenCalled();
    });
  });
});
