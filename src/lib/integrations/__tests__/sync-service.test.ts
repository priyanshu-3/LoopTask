import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';
import { SyncService } from '../sync-service';
import { createClient } from '@supabase/supabase-js';

// Mock dependencies
jest.mock('@supabase/supabase-js');
jest.mock('../token-manager');
jest.mock('../../github/client');
jest.mock('../notion-client');
jest.mock('../slack-client');
jest.mock('../calendar-client');

describe('SyncService', () => {
  let syncService: SyncService;
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
    jest.clearAllMocks();
  });

  describe('Manual Sync', () => {
    it('should sync GitHub data successfully', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { github_token_encrypted: 'encrypted_token' },
        error: null,
      });

      mockSupabase.insert.mockResolvedValueOnce({ error: null });

      global.fetch = jest.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [
            { sha: 'abc123', commit: { message: 'Test commit' }, author: { login: 'user' } },
          ],
        } as Response);

      const result = await syncService.syncProvider('user-123', 'github');

      expect(result.success).toBe(true);
      expect(result.provider).toBe('github');
      expect(result.itemsSynced).toBeGreaterThan(0);
    });

    it('should sync Notion data successfully', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { notion_token_encrypted: 'encrypted_token' },
        error: null,
      });

      mockSupabase.insert.mockResolvedValueOnce({ error: null });

      global.fetch = jest.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            results: [
              { id: 'page-1', properties: { title: { title: [{ plain_text: 'Test Page' }] } } },
            ],
          }),
        } as Response);

      const result = await syncService.syncProvider('user-456', 'notion');

      expect(result.success).toBe(true);
      expect(result.provider).toBe('notion');
    });

    it('should sync Slack data successfully', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { slack_token_encrypted: 'encrypted_token' },
        error: null,
      });

      mockSupabase.insert.mockResolvedValueOnce({ error: null });

      global.fetch = jest.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            ok: true,
            channels: [{ id: 'C123', name: 'general' }],
          }),
        } as Response);

      const result = await syncService.syncProvider('user-789', 'slack');

      expect(result.success).toBe(true);
      expect(result.provider).toBe('slack');
    });

    it('should sync Google Calendar data successfully', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { calendar_token_encrypted: 'encrypted_token' },
        error: null,
      });

      mockSupabase.insert.mockResolvedValueOnce({ error: null });

      global.fetch = jest.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            items: [
              { id: 'event-1', summary: 'Team Meeting', start: { dateTime: new Date().toISOString() } },
            ],
          }),
        } as Response);

      const result = await syncService.syncProvider('user-abc', 'calendar');

      expect(result.success).toBe(true);
      expect(result.provider).toBe('calendar');
    });
  });

  describe('Automatic Background Sync', () => {
    it('should sync all providers for a user', async () => {
      mockSupabase.single.mockResolvedValue({
        data: {
          github_token_encrypted: 'encrypted_token',
          notion_token_encrypted: 'encrypted_token',
        },
        error: null,
      });

      mockSupabase.insert.mockResolvedValue({ error: null });

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ results: [], items: [] }),
      } as Response);

      const results = await syncService.syncAllProviders('user-123');

      expect(results).toBeInstanceOf(Array);
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('Sync with No New Data', () => {
    it('should handle sync when no new data is available', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { github_token_encrypted: 'encrypted_token' },
        error: null,
      });

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      } as Response);

      const result = await syncService.syncProvider('user-123', 'github');

      expect(result.success).toBe(true);
      expect(result.itemsSynced).toBe(0);
    });
  });

  describe('Sync with Large Datasets', () => {
    it('should handle pagination for large GitHub datasets', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { github_token_encrypted: 'encrypted_token' },
        error: null,
      });

      mockSupabase.insert.mockResolvedValue({ error: null });

      // Mock paginated responses
      const largeDataset = Array.from({ length: 100 }, (_, i) => ({
        sha: `commit-${i}`,
        commit: { message: `Commit ${i}` },
        author: { login: 'user' },
      }));

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => largeDataset,
      } as Response);

      const result = await syncService.syncProvider('user-123', 'github');

      expect(result.success).toBe(true);
      expect(result.itemsSynced).toBe(100);
    });
  });

  describe('Sync Error Handling and Retry', () => {
    it('should retry on network failure', async () => {
      mockSupabase.single.mockResolvedValue({
        data: { github_token_encrypted: 'encrypted_token' },
        error: null,
      });

      // First call fails, second succeeds
      global.fetch = jest.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [{ sha: 'abc123', commit: { message: 'Test' }, author: { login: 'user' } }],
        } as Response);

      mockSupabase.insert.mockResolvedValue({ error: null });

      const result = await syncService.syncProvider('user-123', 'github');

      expect(result.success).toBe(true);
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    it('should handle rate limit errors with exponential backoff', async () => {
      mockSupabase.single.mockResolvedValue({
        data: { github_token_encrypted: 'encrypted_token' },
        error: null,
      });

      global.fetch = jest.fn()
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
          headers: new Headers({ 'Retry-After': '60' }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [],
        } as Response);

      const result = await syncService.syncProvider('user-123', 'github');

      expect(result.success).toBe(true);
    });

    it('should fail after max retry attempts', async () => {
      mockSupabase.single.mockResolvedValue({
        data: { github_token_encrypted: 'encrypted_token' },
        error: null,
      });

      mockSupabase.insert.mockResolvedValue({ error: null });

      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      const result = await syncService.syncProvider('user-123', 'github');

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });

  describe('Data Verification', () => {
    it('should verify data appears in activities table', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { github_token_encrypted: 'encrypted_token' },
        error: null,
      });

      const insertSpy = jest.fn().mockResolvedValue({ error: null });
      mockSupabase.insert = insertSpy;

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { sha: 'abc123', commit: { message: 'Test commit' }, author: { login: 'user' } },
        ],
      } as Response);

      await syncService.syncProvider('user-123', 'github');

      expect(insertSpy).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            user_id: 'user-123',
            source: 'github',
            external_id: expect.any(String),
          }),
        ])
      );
    });
  });

  describe('Sync Status', () => {
    it('should return sync status for a provider', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          last_github_sync: new Date().toISOString(),
        },
        error: null,
      });

      mockSupabase.select.mockResolvedValueOnce({
        data: [
          { status: 'success', items_synced: 10, created_at: new Date().toISOString() },
        ],
        error: null,
      });

      const status = await syncService.getSyncStatus('user-123', 'github');

      expect(status).toHaveProperty('lastSync');
      expect(status).toHaveProperty('status');
    });
  });
});
