'use client';

import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'purple' | 'green' | 'orange' | 'red' | 'gradient';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  striped?: boolean;
}

export default function ProgressBar({
  value,
  max = 100,
  size = 'md',
  color = 'blue',
  showLabel = true,
  label,
  animated = true,
  striped = false,
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const colors = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
    gradient: 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500',
  };

  return (
    <div className="w-full">
      {(showLabel || label) && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-400">
            {label || 'Progress'}
          </span>
          <span className="text-sm font-bold text-white">
            {Math.round(percentage)}%
          </span>
        </div>
      )}

      <div className={`w-full bg-gray-800 rounded-full overflow-hidden ${sizes[size]}`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{
            duration: animated ? 1 : 0,
            ease: 'easeOut',
          }}
          className={`
            h-full rounded-full relative
            ${colors[color]}
            ${striped ? 'bg-stripes' : ''}
          `}
        >
          {animated && (
            <motion.div
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}

// Circular progress
export function CircularProgress({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  color = 'blue',
  showLabel = true,
}: {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: 'blue' | 'purple' | 'green' | 'orange' | 'red';
  showLabel?: boolean;
}) {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const colors = {
    blue: '#3b82f6',
    purple: '#a855f7',
    green: '#10b981',
    orange: '#f59e0b',
    red: '#ef4444',
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-800"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors[color]}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-white">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  );
}

// Multi-segment progress
export function SegmentedProgress({
  segments,
  size = 'md',
}: {
  segments: Array<{ value: number; color: string; label?: string }>;
  size?: 'sm' | 'md' | 'lg';
}) {
  const total = segments.reduce((sum, seg) => sum + seg.value, 0);

  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className="w-full">
      <div className={`w-full bg-gray-800 rounded-full overflow-hidden flex ${sizes[size]}`}>
        {segments.map((segment, index) => {
          const percentage = (segment.value / total) * 100;
          return (
            <motion.div
              key={index}
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1, delay: index * 0.1 }}
              className={`h-full ${segment.color}`}
              title={segment.label}
            />
          );
        })}
      </div>
      {segments.some(s => s.label) && (
        <div className="flex items-center justify-between mt-2 text-xs">
          {segments.map((segment, index) => (
            segment.label && (
              <div key={index} className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${segment.color}`} />
                <span className="text-gray-400">{segment.label}</span>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
}
