'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ChartSkeleton } from '@/components/features/LoadingState';

export default function WeeklyActivity() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/stats');
      if (response.ok) {
        const result = await response.json();
        // Get last 7 days
        const last7Days = (result.dailyData || []).slice(-7);
        setData(last7Days.map((item: any) => ({
          day: item.day,
          commits: item.commits + item.prs,
          hours: (item.commits + item.prs) * 0.5, // Estimate: 30 min per activity
        })));
      }
    } catch (error) {
      console.error('Error fetching weekly activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const colors = ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#6366F1', '#EF4444'];

  if (loading) {
    return <ChartSkeleton />;
  }

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400">
        No activity data available
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="day" stroke="#9CA3AF" />
          <YAxis stroke="#9CA3AF" label={{ value: 'Hours', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '8px',
            }}
            cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
          />
          <Bar dataKey="hours" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Summary */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold text-blue-400">
            {data.reduce((sum, d) => sum + d.hours, 0).toFixed(1)}h
          </p>
          <p className="text-xs text-gray-400">Total Hours</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-purple-400">
            {data.reduce((sum, d) => sum + d.commits, 0)}
          </p>
          <p className="text-xs text-gray-400">Total Commits</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-green-400">
            {(data.reduce((sum, d) => sum + d.hours, 0) / 7).toFixed(1)}h
          </p>
          <p className="text-xs text-gray-400">Daily Average</p>
        </div>
      </div>
    </div>
  );
}
