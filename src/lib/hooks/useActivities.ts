import { useState, useEffect } from 'react';
import { api, APIError } from '../api/client';

export function useActivities(params?: { type?: string; limit?: number }) {
  const [activities, setActivities] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.activities.list(params);
      setActivities(data.activities || []);
      setTotal(data.total || 0);
    } catch (err) {
      if (err instanceof APIError) {
        setError(err.message);
      } else {
        setError('Failed to fetch activities');
      }
      console.error('Error fetching activities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [params?.type, params?.limit]);

  const createActivity = async (data: any) => {
    try {
      const result = await api.activities.create(data);
      setActivities(prev => [result.activity, ...prev]);
      setTotal(prev => prev + 1);
      return result.activity;
    } catch (err) {
      if (err instanceof APIError) {
        throw new Error(err.message);
      }
      throw new Error('Failed to create activity');
    }
  };

  return {
    activities,
    total,
    loading,
    error,
    refresh: fetchActivities,
    createActivity,
  };
}
