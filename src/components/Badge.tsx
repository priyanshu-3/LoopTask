'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple' | 'pink';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  pulse?: boolean;
  className?: string;
}

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  icon: Icon,
  pulse = false,
  className = '',
}: BadgeProps) {
  const variants = {
    default: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    success: 'bg-green-500/10 text-green-400 border-green-500/20',
    warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    error: 'bg-red-500/10 text-red-400 border-red-500/20',
    info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    pink: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`
        inline-flex items-center space-x-1 font-medium rounded-full border
        ${variants[variant]}
        ${sizes[size]}
        ${pulse ? 'animate-pulse' : ''}
        ${className}
      `}
    >
      {Icon && <Icon className={iconSizes[size]} />}
      <span>{children}</span>
    </motion.span>
  );
}

// Preset badges
export function StatusBadge({ status }: { status: 'active' | 'inactive' | 'pending' | 'error' }) {
  const config = {
    active: { variant: 'success' as const, label: 'Active', pulse: true },
    inactive: { variant: 'default' as const, label: 'Inactive', pulse: false },
    pending: { variant: 'warning' as const, label: 'Pending', pulse: true },
    error: { variant: 'error' as const, label: 'Error', pulse: false },
  };

  const { variant, label, pulse } = config[status];

  return (
    <Badge variant={variant} pulse={pulse}>
      {label}
    </Badge>
  );
}

export function PriorityBadge({ priority }: { priority: 'low' | 'medium' | 'high' | 'critical' }) {
  const config = {
    low: { variant: 'info' as const, label: 'Low', pulse: false },
    medium: { variant: 'warning' as const, label: 'Medium', pulse: false },
    high: { variant: 'error' as const, label: 'High', pulse: false },
    critical: { variant: 'error' as const, label: 'Critical', pulse: true },
  };

  const { variant, label, pulse } = config[priority];

  return (
    <Badge variant={variant} pulse={pulse}>
      {label}
    </Badge>
  );
}
