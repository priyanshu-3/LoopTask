'use client';

import { motion } from 'framer-motion';
import { 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Clock,
  AlertCircle
} from 'lucide-react';
import { IntegrationProvider } from '@/types/integration';

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

interface SyncStatusIndicatorProps {
  provider: IntegrationProvider;
  status: SyncStatus;
  lastSync?: Date | string | null;
  error?: string;
  className?: string;
}

export default function SyncStatusIndicator({
  provider,
  status,
  lastSync,
  error,
  className = '',
}: SyncStatusIndicatorProps) {
  const formatLastSync = (dateValue: Date | string | null | undefined) => {
    if (!dateValue) return 'Never synced';
    
    const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  const statusConfig = {
    idle: {
      icon: Clock,
      color: 'text-gray-400',
      bgColor: 'bg-gray-500/10',
      borderColor: 'border-gray-500/20',
      label: 'Idle',
      animate: false,
    },
    syncing: {
      icon: Loader2,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      label: 'Syncing',
      animate: true,
    },
    success: {
      icon: CheckCircle2,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
      label: 'Success',
      animate: false,
    },
    error: {
      icon: XCircle,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20',
      label: 'Error',
      animate: false,
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Status indicator with icon */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`
          relative flex items-center justify-center
          w-10 h-10 rounded-full border
          ${config.bgColor} ${config.borderColor}
        `}
      >
        <Icon 
          className={`
            w-5 h-5 ${config.color}
            ${config.animate ? 'animate-spin' : ''}
          `}
        />
        
        {/* Pulse effect for syncing */}
        {status === 'syncing' && (
          <motion.div
            className="absolute inset-0 rounded-full bg-blue-500/20"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
      </motion.div>

      {/* Status text and timestamp */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <span className={`text-sm font-medium ${config.color}`}>
            {config.label}
          </span>
          {status === 'success' && lastSync && (
            <span className="text-xs text-gray-500">
              • {formatLastSync(lastSync)}
            </span>
          )}
        </div>
        
        {/* Error message with tooltip */}
        {status === 'error' && error && (
          <div className="group relative mt-1">
            <div className="flex items-center space-x-1 text-xs text-red-400/80 cursor-help">
              <AlertCircle className="w-3 h-3" />
              <span className="truncate">{error}</span>
            </div>
            
            {/* Tooltip */}
            <div className="
              absolute left-0 top-full mt-2 z-50
              hidden group-hover:block
              w-64 p-3 rounded-lg
              bg-gray-900 border border-red-500/30
              shadow-xl shadow-red-500/10
            ">
              <p className="text-xs text-red-400 break-words">{error}</p>
            </div>
          </div>
        )}
        
        {/* Last sync for idle state */}
        {status === 'idle' && lastSync && (
          <p className="text-xs text-gray-500 mt-0.5">
            Last synced {formatLastSync(lastSync)}
          </p>
        )}
        
        {/* Syncing progress message */}
        {status === 'syncing' && (
          <p className="text-xs text-gray-500 mt-0.5">
            Fetching latest data...
          </p>
        )}
      </div>
    </div>
  );
}
