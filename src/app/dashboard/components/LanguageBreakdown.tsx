'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { ChartSkeleton } from '@/components/features/LoadingState';

const languageColors: Record<string, string> = {
  TypeScript: '#3178C6',
  JavaScript: '#F7DF1E',
  Python: '#3776AB',
  Java: '#007396',
  Go: '#00ADD8',
  Rust: '#000000',
  Ruby: '#CC342D',
  PHP: '#777BB4',
  CSS: '#1572B6',
  HTML: '#E34F26',
  Unknown: '#6B7280',
};

export default function LanguageBreakdown() {
  const [languages, setLanguages] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    try {
      const response = await fetch('/api/stats');
      if (response.ok) {
        const result = await response.json();
        setLanguages(result.languages || {});
      }
    } catch (error) {
      console.error('Error fetching language data:', error);
    } finally {
      setLoading(false);
    }
  };

  const data = Object.entries(languages)
    .map(([name, value]) => ({
      name,
      value,
      color: languageColors[name] || languageColors.Unknown,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (loading) {
    return <ChartSkeleton />;
  }

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400">
        No language data available
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Pie Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Language List */}
      <div className="space-y-4">
        {data.map((lang, index) => {
          const percentage = ((lang.value / total) * 100).toFixed(1);
          
          return (
            <motion.div
              key={lang.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: lang.color }}
                  />
                  <span className="text-sm font-medium">{lang.name}</span>
                </div>
                <span className="text-sm text-gray-400">{percentage}%</span>
              </div>
              
              <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: lang.color }}
                />
              </div>
            </motion.div>
          );
        })}

        {/* Total Lines */}
        <div className="pt-4 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Total Lines of Code</span>
            <span className="text-lg font-bold text-blue-400">127,543</span>
          </div>
        </div>
      </div>
    </div>
  );
}
