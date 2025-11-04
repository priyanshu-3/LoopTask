import { AISummaryEngine } from '../ai-summary-engine';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// Mock dependencies
jest.mock('@supabase/supabase-js');
jest.mock('openai');

describe('AISummaryEngine', () => {
  let aiEngine: AISummaryEngine;
  let mockSupabase: any;
  let mockOpenAI: any;

  beforeEach(() => {
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      single: jest.fn(),
    };

    mockOpenAI = {
      chat: {
        completions: {
          create: jest.fn(),
        },
      },
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabase);
    (OpenAI as jest.Mock).mockImplementation(() => mockOpenAI);

    aiEngine = new AISummaryEngine();
    jest.clearAllMocks();
  });

  describe('Daily Summary Generation', () => {
    it('should generate daily summary with single integration', async () => {
      const mockActivities = [
        {
          id: '1',
          user_id: 'user-123',
          source: 'github',
          type: 'commit',
          description: 'Fixed bug in auth',
          created_at: new Date().toISOString(),
        },
      ];

      mockSupabase.select.mockResolvedValueOnce({
        data: mockActivities,
        error: null,
      });

      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' },
      });

      mockOpenAI.chat.completions.create.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                summary: 'You made 1 commit today focusing on authentication fixes.',
                highlights: ['Fixed bug in auth'],
                insights: ['Active in authentication work'],
                recommendations: ['Continue with security improvements'],
                stats: {
                  totalCommits: 1,
                  totalPRs: 0,
                  totalMeetings: 0,
                  meetingHours: 0,
                  focusTime: 8,
                  collaborationScore: 7,
                },
              }),
            },
          },
        ],
      });

      mockSupabase.insert.mockResolvedValueOnce({ error: null });

      const summary = await aiEngine.generateDailySummary('user-123');

      expect(summary).toHaveProperty('summary');
      expect(summary).toHaveProperty('highlights');
      expect(summary).toHaveProperty('insights');
      expect(summary).toHaveProperty('recommendations');
      expect(summary).toHaveProperty('stats');
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalled();
    });

    it('should generate daily summary with multiple integrations', async () => {
      const mockActivities = [
        {
          id: '1',
          source: 'github',
          type: 'commit',
          description: 'Fixed bug',
        },
        {
          id: '2',
          source: 'notion',
          type: 'page_edit',
          description: 'Updated docs',
        },
        {
          id: '3',
          source: 'slack',
          type: 'message',
          description: 'Team discussion',
        },
        {
          id: '4',
          source: 'calendar',
          type: 'meeting',
          description: 'Sprint planning',
        },
      ];

      mockSupabase.select.mockResolvedValueOnce({
        data: mockActivities,
        error: null,
      });

      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' },
      });

      mockOpenAI.chat.completions.create.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                summary: 'Productive day across all platforms with coding, documentation, and collaboration.',
                highlights: ['Fixed bug', 'Updated docs', 'Sprint planning'],
                insights: ['Balanced work across development and collaboration'],
                recommendations: ['Maintain this balanced approach'],
                stats: {
                  totalCommits: 1,
                  totalPRs: 0,
                  totalMeetings: 1,
                  meetingHours: 1,
                  focusTime: 6,
                  collaborationScore: 9,
                },
              }),
            },
          },
        ],
      });

      mockSupabase.insert.mockResolvedValueOnce({ error: null });

      const summary = await aiEngine.generateDailySummary('user-123');

      expect(summary.stats.totalCommits).toBeGreaterThan(0);
      expect(summary.stats.totalMeetings).toBeGreaterThan(0);
    });
  });

  describe('Weekly Summary Generation', () => {
    it('should generate weekly summary', async () => {
      const mockActivities = Array.from({ length: 20 }, (_, i) => ({
        id: `${i}`,
        source: ['github', 'notion', 'slack', 'calendar'][i % 4],
        type: 'activity',
        description: `Activity ${i}`,
        created_at: new Date(Date.now() - i * 86400000).toISOString(),
      }));

      mockSupabase.select.mockResolvedValueOnce({
        data: mockActivities,
        error: null,
      });

      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' },
      });

      mockOpenAI.chat.completions.create.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                summary: 'Productive week with consistent activity across all platforms.',
                highlights: ['20 activities completed', 'Balanced work distribution'],
                insights: ['Consistent daily activity', 'Good work-life balance'],
                recommendations: ['Keep up the momentum'],
                stats: {
                  totalCommits: 5,
                  totalPRs: 2,
                  totalMeetings: 5,
                  meetingHours: 5,
                  focusTime: 35,
                  collaborationScore: 8,
                },
              }),
            },
          },
        ],
      });

      mockSupabase.insert.mockResolvedValueOnce({ error: null });

      const summary = await aiEngine.generateWeeklySummary('user-123');

      expect(summary).toHaveProperty('summary');
      expect(summary.highlights.length).toBeGreaterThan(0);
    });
  });

  describe('Summary Caching', () => {
    it('should return cached summary if available and fresh', async () => {
      const cachedSummary = {
        id: 'summary-1',
        user_id: 'user-123',
        date: new Date().toISOString().split('T')[0],
        type: 'daily',
        summary: 'Cached summary',
        highlights: ['Cached highlight'],
        insights: ['Cached insight'],
        recommendations: ['Cached recommendation'],
        stats: { totalCommits: 5 },
        created_at: new Date().toISOString(),
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: cachedSummary,
        error: null,
      });

      const summary = await aiEngine.getCachedSummary('user-123', new Date());

      expect(summary).toBeTruthy();
      expect(summary?.summary).toBe('Cached summary');
      expect(mockOpenAI.chat.completions.create).not.toHaveBeenCalled();
    });

    it('should generate new summary if cache is stale', async () => {
      const staleCachedSummary = {
        id: 'summary-1',
        user_id: 'user-123',
        date: new Date(Date.now() - 7200000).toISOString().split('T')[0], // 2 hours old
        type: 'daily',
        created_at: new Date(Date.now() - 7200000).toISOString(),
      };

      mockSupabase.single
        .mockResolvedValueOnce({
          data: staleCachedSummary,
          error: null,
        })
        .mockResolvedValueOnce({
          data: null,
          error: { code: 'PGRST116' },
        });

      mockSupabase.select.mockResolvedValueOnce({
        data: [],
        error: null,
      });

      mockOpenAI.chat.completions.create.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                summary: 'Fresh summary',
                highlights: [],
                insights: [],
                recommendations: [],
                stats: {},
              }),
            },
          },
        ],
      });

      mockSupabase.insert.mockResolvedValueOnce({ error: null });

      const summary = await aiEngine.generateDailySummary('user-123');

      expect(summary.summary).toBe('Fresh summary');
    });
  });

  describe('Insights and Recommendations Quality', () => {
    it('should provide actionable insights', async () => {
      mockSupabase.select.mockResolvedValueOnce({
        data: [
          { source: 'github', type: 'commit', created_at: new Date().toISOString() },
        ],
        error: null,
      });

      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' },
      });

      mockOpenAI.chat.completions.create.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                summary: 'Test summary',
                highlights: ['Made commits'],
                insights: ['Most active in morning hours', 'Focus on backend work'],
                recommendations: ['Schedule deep work in mornings', 'Consider pair programming'],
                stats: { totalCommits: 5 },
              }),
            },
          },
        ],
      });

      mockSupabase.insert.mockResolvedValueOnce({ error: null });

      const summary = await aiEngine.generateDailySummary('user-123');

      expect(summary.insights).toBeInstanceOf(Array);
      expect(summary.insights.length).toBeGreaterThan(0);
      expect(summary.recommendations).toBeInstanceOf(Array);
      expect(summary.recommendations.length).toBeGreaterThan(0);
    });

    it('should identify productivity patterns', async () => {
      const mockActivities = [
        { source: 'github', type: 'commit', created_at: '2024-01-01T09:00:00Z' },
        { source: 'github', type: 'commit', created_at: '2024-01-01T10:00:00Z' },
        { source: 'calendar', type: 'meeting', created_at: '2024-01-01T14:00:00Z' },
      ];

      mockSupabase.select.mockResolvedValueOnce({
        data: mockActivities,
        error: null,
      });

      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' },
      });

      mockOpenAI.chat.completions.create.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                summary: 'Pattern-based summary',
                highlights: ['Morning coding sessions'],
                insights: ['Peak productivity in morning', 'Meetings in afternoon'],
                recommendations: ['Protect morning time for coding'],
                stats: {
                  totalCommits: 2,
                  totalMeetings: 1,
                  focusTime: 4,
                  collaborationScore: 6,
                },
              }),
            },
          },
        ],
      });

      mockSupabase.insert.mockResolvedValueOnce({ error: null });

      const summary = await aiEngine.generateDailySummary('user-123');

      expect(summary.insights).toContain(expect.stringContaining('morning'));
    });
  });
});
