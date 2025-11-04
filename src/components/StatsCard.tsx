'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
  color?: 'blue' | 'purple' | 'green' | 'orange' | 'red' | 'pink';
  subtitle?: string;
  delay?: number;
}

export default function StatsCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  color = 'blue',
  subtitle,
  delay = 0,
}: StatsCardProps) {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-500/10',
      text: 'text-blue-500',
      border: 'border-blue-500/20',
      glow: 'shadow-blue-500/20',
    },
    purple: {
      bg: 'bg-purple-500/10',
      text: 'text-purple-500',
      border: 'border-purple-500/20',
      glow: 'shadow-purple-500/20',
    },
    green: {
      bg: 'bg-green-500/10',
      text: 'text-green-500',
      border: 'border-green-500/20',
      glow: 'shadow-green-500/20',
    },
    orange: {
      bg: 'bg-orange-500/10',
      text: 'text-orange-500',
      border: 'border-orange-500/20',
      glow: 'shadow-orange-500/20',
    },
    red: {
      bg: 'bg-red-500/10',
      text: 'text-red-500',
      border: 'border-red-500/20',
      glow: 'shadow-red-500/20',
    },
    pink: {
      bg: 'bg-pink-500/10',
      text: 'text-pink-500',
      border: 'border-pink-500/20',
      glow: 'shadow-pink-500/20',
    },
  };

  const colors = colorClasses[color];

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-500 bg-green-500/10';
    if (trend === 'down') return 'text-red-500 bg-red-500/10';
    return 'text-gray-500 bg-gray-500/10';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="relative group"
    >
      {/* Glow effect on hover */}
      <div className={`absolute inset-0 ${colors.bg} rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      
      {/* Card */}
      <div className={`relative bg-gray-900 border ${colors.border} rounded-xl p-6 hover:shadow-xl transition-all duration-300`}>
        {/* Icon */}
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center`}>
            <Icon className={`w-6 h-6 ${colors.text}`} />
          </div>
          
          {/* Trend Badge */}
          {change !== undefined && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: delay + 0.2, type: 'spring' }}
              className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getTrendColor()}`}
            >
              {getTrendIcon()}
              <span>{change > 0 ? '+' : ''}{change}%</span>
            </motion.div>
          )}
        </div>

        {/* Value */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: delay + 0.1, type: 'spring' }}
          className="mb-2"
        >
          <div className="text-3xl font-bold text-white mb-1">
            {value}
          </div>
          <div className="text-sm text-gray-400">
            {title}
          </div>
        </motion.div>

        {/* Subtitle */}
        {subtitle && (
          <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-800">
            {subtitle}
          </div>
        )}

        {/* Animated border on hover */}
        <div className={`absolute inset-0 rounded-xl border-2 ${colors.border} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      </div>
    </motion.div>
  );
}

// Preset stat cards
export function LoadingStatsCard({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-gray-900 border border-gray-800 rounded-xl p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-gray-800 animate-pulse" />
        <div className="w-16 h-6 rounded-full bg-gray-800 animate-pulse" />
      </div>
      <div className="space-y-2">
        <div className="h-8 w-24 bg-gray-800 rounded animate-pulse" />
        <div className="h-4 w-32 bg-gray-800 rounded animate-pulse" />
      </div>
    </motion.div>
  );
}
