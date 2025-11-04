// API Client for making requests to backend
import { cache } from '@/lib/utils/cache';

export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const CACHE_CONFIG = {
  ttl: CACHE_TTL,
  staleWhileRevalidate: true,
};

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new APIError(
      error.error || error.message || 'Request failed',
      response.status,
      error
    );
  }

  return response.json();
}

export const api = {
  // Automations
  automations: {
    list: async (useCache = true) => {
      const cacheKey = 'automations:list';

      // Check cache
      if (useCache) {
        const cached = cache.get<{ automations: any[] }>(cacheKey);
        if (cached && !cache.isStale(cacheKey)) {
          return cached;
        }
      }

      const response = await fetch('/api/automations', {
        credentials: 'include',
      });
      const data = await handleResponse<{ automations: any[] }>(response);

      // Cache the response
      cache.set(cacheKey, data, { ...CACHE_CONFIG, key: cacheKey });

      return data;
    },

    get: async (id: string) => {
      const response = await fetch(`/api/automations/${id}`, {
        credentials: 'include',
      });
      return handleResponse<{ automation: any }>(response);
    },

    create: async (data: any) => {
      const response = await fetch('/api/automations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      const result = await handleResponse<{ automation: any }>(response);

      // Invalidate list cache
      cache.invalidate('automations:list');

      return result;
    },

    update: async (id: string, data: any) => {
      const response = await fetch(`/api/automations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      const result = await handleResponse<{ automation: any }>(response);

      // Invalidate caches
      cache.invalidate('automations:list');
      cache.invalidate(`automations:${id}`);

      return result;
    },

    delete: async (id: string) => {
      const response = await fetch(`/api/automations/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const result = await handleResponse<{ success: boolean }>(response);

      // Invalidate caches
      cache.invalidate('automations:list');
      cache.invalidate(`automations:${id}`);

      return result;
    },

    execute: async (id: string) => {
      const response = await fetch(`/api/automations/${id}/execute`, {
        method: 'POST',
        credentials: 'include',
      });
      return handleResponse<{ message: string; run_id: string }>(response);
    },
  },

  // Activities
  activities: {
    list: async (params?: { type?: string; limit?: number; offset?: number }) => {
      const query = new URLSearchParams();
      if (params?.type) query.append('type', params.type);
      if (params?.limit) query.append('limit', params.limit.toString());
      if (params?.offset) query.append('offset', params.offset.toString());

      const response = await fetch(`/api/activities?${query}`, {
        credentials: 'include',
      });
      return handleResponse<{ activities: any[]; total: number }>(response);
    },

    create: async (data: any) => {
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      return handleResponse<{ activity: any }>(response);
    },
  },

  // Goals
  goals: {
    list: async (teamId?: string) => {
      const query = teamId ? `?team_id=${teamId}` : '';
      const response = await fetch(`/api/goals${query}`, {
        credentials: 'include',
      });
      return handleResponse<{ goals: any[] }>(response);
    },

    create: async (data: any) => {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      return handleResponse<{ goal: any }>(response);
    },
  },

  // Webhooks
  webhooks: {
    list: async () => {
      const response = await fetch('/api/webhooks', {
        credentials: 'include',
      });
      return handleResponse<{ webhooks: any[] }>(response);
    },

    create: async (data: any) => {
      const response = await fetch('/api/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      return handleResponse<{ webhook: any }>(response);
    },
  },

  // AI Insights
  insights: {
    get: async () => {
      const response = await fetch('/api/insights', {
        credentials: 'include',
      });
      return handleResponse<{ insights: any }>(response);
    },
  },

  // User Stats
  stats: {
    get: async () => {
      const response = await fetch('/api/stats', {
        credentials: 'include',
      });
      return handleResponse<{ stats: any }>(response);
    },
  },
};
