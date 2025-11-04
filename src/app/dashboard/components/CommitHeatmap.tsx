'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ChartSkeleton } from '@/components/features/LoadingState';

export default function CommitHeatmap() {
  const [hoveredCell, setHoveredCell] = useState<{ date: string; count: number } | null>(null);
  const [heatmapData, setHeatmapData] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHeatmapData();
  }, []);

  const fetchHeatmapData = async () => {
    try {
      const response = await fetch('/api/stats');
      if (response.ok) {
        const result = await response.json();
        setHeatmapData(result.heatmapData || {});
      }
    } catch (error) {
      console.error('Error fetching heatmap data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate data for the last 12 months with real counts
  const generateHeatmapData = () => {
    const data = [];
    const today = new Date();
    
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      data.push({
        date: dateStr,
        count: heatmapData[dateStr] || 0,
        day: date.getDay(),
        week: Math.floor(i / 7),
      });
    }
    
    return data;
  };

  const data = generateHeatmapData();
  const weeks = Math.ceil(data.length / 7);

  const getColor = (count: number) => {
    if (count === 0) return 'bg-gray-800';
    if (count <= 2) return 'bg-green-900/50';
    if (count <= 4) return 'bg-green-700/70';
    if (count <= 6) return 'bg-green-500/80';
    return 'bg-green-400';
  };

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return <ChartSkeleton />;
  }

  return (
    <div className="relative">
      {/* Legend */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <span>Less</span>
          {[0, 2, 4, 6, 8].map((count) => (
            <div
              key={count}
              className={`w-3 h-3 rounded-sm ${getColor(count)}`}
            />
          ))}
          <span>More</span>
        </div>
        
        <div className="text-sm text-gray-400">
          {data.filter(d => d.count > 0).length} days active
        </div>
      </div>

      {/* Heatmap */}
      <div className="overflow-x-auto">
        <div className="inline-flex flex-col space-y-1">
          {/* Day labels */}
          <div className="flex space-x-1">
            <div className="w-8"></div>
            {days.map((day, i) => (
              <div key={i} className="text-xs text-gray-500 w-3 h-3">
                {i % 2 === 0 ? day[0] : ''}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="flex space-x-1">
            {Array.from({ length: weeks }).map((_, weekIndex) => (
              <div key={weekIndex} className="flex flex-col space-y-1">
                {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
                  const dataIndex = weekIndex * 7 + dayIndex;
                  const cell = data[dataIndex];
                  
                  if (!cell) return <div key={dayIndex} className="w-3 h-3" />;

                  return (
                    <motion.div
                      key={dayIndex}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: weekIndex * 0.01 }}
                      whileHover={{ scale: 1.5 }}
                      className={`w-3 h-3 rounded-sm ${getColor(cell.count)} cursor-pointer transition-all`}
                      onMouseEnter={() => setHoveredCell(cell)}
                      onMouseLeave={() => setHoveredCell(null)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {hoveredCell && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-0 right-0 bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-xl z-10"
        >
          <p className="text-sm font-semibold">{hoveredCell.count} commits</p>
          <p className="text-xs text-gray-400">{hoveredCell.date}</p>
        </motion.div>
      )}
    </div>
  );
}
