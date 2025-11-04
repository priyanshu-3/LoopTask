'use client';

import { motion } from 'framer-motion';
import { 
  Github, 
  Calendar, 
  MessageSquare, 
  FileText, 
  RefreshCw, 
  CheckCircle2, 
  XCircle,
  Clock,
  Activity
} from 'lucide-react';
import Badge from '@/components/Badge';
import Button from '@/components/Button';
import { useState } from 'react';

export type IntegrationProvider = 'github' | 'notion' | 'slack' | 'calendar';

interface IntegrationCardProps {
  provider: IntegrationProvider;
  connected: boolean;
  lastSync?: string | null;
  activityCount?: number;
  totalActivityCount?: number;
  onConnect: () => void;
  onDisconnect: () => void;
  onSync: () => void;
  syncing?: boolean;
}

const providerConfig = {
  github: {
    name: 'GitHub',
    icon: Github,
    color: 'from-gray-600 to-gray-800',
    description: 'Sync commits, PRs, and issues',
  },
  notion: {
    name: 'Notion',
    icon: FileText,
    color: 'from-gray-700 to-black',
    description: 'Track documentation and notes',
  },
  slack: {
    name: 'Slack',
    icon: MessageSquare,
    color: 'from-purple-600 to-pink-600',
    description: 'Monitor team communication',
  },
  calendar: {
    name: 'Google Calendar',
    icon: Calendar,
    color: 'from-blue-600 to-cyan-600',
    description: 'Analyze meeting patterns',
  },
};

export default function IntegrationCard({
  provider,
  connected,
  lastSync,
  activityCount = 0,
  totalActivityCount = 0,
  onConnect,
  onDisconnect,
  onSync,
  syncing = false,
}: IntegrationCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const config = providerConfig[provider];
  const Icon = config.icon;

  const formatLastSync = (dateString: string | null | undefined) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all duration-300 overflow-hidden group"
    >
      {/* Background gradient effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <motion.div
              animate={{ rotate: isHovered ? 360 : 0 }}
              transition={{ duration: 0.6 }}
              className={`p-3 rounded-lg bg-gradient-to-br ${config.color}`}
            >
              <Icon className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h3 className="text-lg font-semibold text-white">{config.name}</h3>
              <p className="text-sm text-gray-400">{config.description}</p>
            </div>
          </div>
          
          {/* Connection status badge */}
          <Badge 
            variant={connected ? 'success' : 'default'} 
            pulse={connected}
            icon={connected ? CheckCircle2 : XCircle}
          >
            {connected ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>

        {/* Stats */}
        {connected && (
          <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
            <div>
              <div className="flex items-center space-x-2 text-gray-400 text-xs mb-1">
                <Activity className="w-3 h-3" />
                <span>Total Activities</span>
              </div>
              <p className="text-2xl font-bold text-white">{totalActivityCount}</p>
            </div>
            <div>
              <div className="flex items-center space-x-2 text-gray-400 text-xs mb-1">
                <Clock className="w-3 h-3" />
                <span>Last Sync</span>
              </div>
              <p className="text-sm font-medium text-gray-300">{formatLastSync(lastSync)}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {connected ? (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={onSync}
                disabled={syncing}
                className="flex-1 flex items-center justify-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                <span>{syncing ? 'Syncing...' : 'Sync Now'}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onDisconnect}
                disabled={syncing}
              >
                Disconnect
              </Button>
            </>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={onConnect}
              className="w-full"
            >
              Connect {config.name}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
