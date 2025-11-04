import { useState, useEffect } from 'react';
import { api, APIError } from '../api/client';

export function useInsights() {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.insights.get();
      setInsights(data.insights);
    } catch (err) {
      if (err instanceof APIError) {
        setError(err.message);
      } else {
        setError('Failed to fetch insights');
      }
      console.error('Error fetching insights:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  return {
    insights,
    loading,
    error,
    refresh: fetchInsights,
  };
}
