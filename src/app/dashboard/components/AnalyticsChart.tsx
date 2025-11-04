'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartSkeleton } from '@/components/features/LoadingState';

export default function AnalyticsChart() {
  const [data, setData] = useState<any[]>([]);
  const [totals, setTotals] = useState({ commits: 0, prs: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/stats');
      if (response.ok) {
        const result = await response.json();
        setData(result.dailyData || []);
        setTotals({
          commits: result.stats.totalCommits || 0,
          prs: result.stats.totalPRs || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ChartSkeleton />;
  }

  if (data.length === 0) {
    return (
      <Card>
        <div className="h-64 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <p className="mb-2">No data available</p>
            <p className="text-sm">Sync your GitHub data to see analytics</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="day" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
              }}
            />
            <Bar dataKey="commits" fill="#3B82F6" name="Commits" />
            <Bar dataKey="prs" fill="#8B5CF6" name="Pull Requests" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-500">{totals.commits}</p>
          <p className="text-sm text-gray-400">Total Commits</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-purple-500">{totals.prs}</p>
          <p className="text-sm text-gray-400">Pull Requests</p>
        </div>
      </div>
    </Card>
  );
}
