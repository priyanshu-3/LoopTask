import { useState, useEffect } from 'react';
import { api, APIError } from '../api/client';

export function useAutomations() {
  const [automations, setAutomations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAutomations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.automations.list();
      setAutomations(data.automations || []);
    } catch (err) {
      if (err instanceof APIError) {
        setError(err.message);
      } else {
        setError('Failed to fetch automations');
      }
      console.error('Error fetching automations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAutomations();
  }, []);

  const createAutomation = async (data: any) => {
    try {
      const result = await api.automations.create(data);
      setAutomations(prev => [result.automation, ...prev]);
      return result.automation;
    } catch (err) {
      if (err instanceof APIError) {
        throw new Error(err.message);
      }
      throw new Error('Failed to create automation');
    }
  };

  const updateAutomation = async (id: string, data: any) => {
    try {
      const result = await api.automations.update(id, data);
      setAutomations(prev =>
        prev.map(a => (a.id === id ? result.automation : a))
      );
      return result.automation;
    } catch (err) {
      if (err instanceof APIError) {
        throw new Error(err.message);
      }
      throw new Error('Failed to update automation');
    }
  };

  const deleteAutomation = async (id: string) => {
    try {
      await api.automations.delete(id);
      setAutomations(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      if (err instanceof APIError) {
        throw new Error(err.message);
      }
      throw new Error('Failed to delete automation');
    }
  };

  const executeAutomation = async (id: string) => {
    try {
      const result = await api.automations.execute(id);
      // Refresh automations to get updated stats
      await fetchAutomations();
      return result;
    } catch (err) {
      if (err instanceof APIError) {
        throw new Error(err.message);
      }
      throw new Error('Failed to execute automation');
    }
  };

  return {
    automations,
    loading,
    error,
    refresh: fetchAutomations,
    createAutomation,
    updateAutomation,
    deleteAutomation,
    executeAutomation,
  };
}
