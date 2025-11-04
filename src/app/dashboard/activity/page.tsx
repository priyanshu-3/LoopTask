'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { LiquidGlassCard } from "@/components/ui/liquid-weather-glass";
import DashboardAuth from '../components/DashboardAuth';
import { 
  GitCommit, 
  GitPullRequest, 
  Calendar, 
  MessageSquare,
  Filter,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { getRelativeTime } from '@/utils/formatDate';

export default function ActivityPage() {
  const [filter, setFilter] = useState<'all' | 'commit' | 'pr' | 'meeting'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock activity data
  const activities = [
    {
      id: '1',
      type: 'commit' as const,
      title: 'Fixed authentication bug in login flow',
      description: 'Resolved issue where users were getting logged out unexpectedly',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      status: 'success' as const,
      repo: 'looptask/frontend',
    },
    {
      id: '2',
      type: 'pr' as const,
      title: 'Add new dashboard components',
      description: 'Implemented analytics charts and activity feed',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      status: 'pending' as const,
      repo: 'looptask/frontend',
    },
    {
      id: '3',
      type: 'meeting' as const,
      title: 'Team standup meeting',
      description: 'Daily sync with the development team',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      status: 'success' as const,
    },
    {
      id: '4',
      type: 'commit' as const,
      title: 'Updated API documentation',
      description: 'Added examples for new endpoints',
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      status: 'success' as const,
      repo: 'looptask/docs',
    },
    {
      id: '5',
      type: 'pr' as const,
      title: 'Refactor database queries',
      description: 'Optimized slow queries for better performance',
      timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
      status: 'failed' as const,
      repo: 'looptask/backend',
    },
  ];

  const filteredActivities = activities.filter(activity => {
    const matchesFilter = filter === 'all' || activity.type === filter;
    const matchesSearch = activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         activity.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const activityIcons = {
    commit: GitCommit,
    pr: GitPullRequest,
    meeting: Calendar,
  };

  const activityColors = {
    commit: { bg: 'bg-blue-500/10', icon: 'text-blue-500' },
    pr: { bg: 'bg-purple-500/10', icon: 'text-purple-500' },
    meeting: { bg: 'bg-green-500/10', icon: 'text-green-500' },
  };

  const statusIcons = {
    success: CheckCircle,
    pending: AlertCircle,
    failed: XCircle,
  };

  const statusColors = {
    success: 'text-green-500',
    pending: 'text-yellow-500',
    failed: 'text-red-500',
  };

  return (
    <DashboardAuth>
      <div className="p-4 md:p-8">
        
        <main className="max-w-7xl mx-auto">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                Activity Feed
              </h1>
              <p className="text-gray-400">Track all your development activities in one place</p>
            </motion.div>

            {/* Filters and Search */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6"
            >
              <LiquidGlassCard shadowIntensity="xs" borderRadius="16px" glowIntensity="sm" className="p-6 bg-white/5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                  {/* Search */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search activities..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-gray-300"
                    />
                  </div>

                  {/* Filter Buttons */}
                  <div className="flex items-center space-x-2">
                    <Filter className="w-5 h-5 text-gray-400" />
                    {[
                      { value: 'all', label: 'All' },
                      { value: 'commit', label: 'Commits' },
                      { value: 'pr', label: 'PRs' },
                      { value: 'meeting', label: 'Meetings' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setFilter(option.value as any)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          filter === option.value
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </LiquidGlassCard>
            </motion.div>

            {/* Activity List */}
            <div className="space-y-4">
              {filteredActivities.length === 0 ? (
                <LiquidGlassCard shadowIntensity="xs" borderRadius="16px" glowIntensity="sm" className="p-6 bg-white/5">
                  <div className="text-center py-12">
                    <p className="text-gray-400">No activities found</p>
                  </div>
                </LiquidGlassCard>
              ) : (
                filteredActivities.map((activity, index) => {
                  const Icon = activityIcons[activity.type];
                  const StatusIcon = statusIcons[activity.status];
                  const color = activityColors[activity.type];

                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <LiquidGlassCard shadowIntensity="xs" borderRadius="16px" glowIntensity="sm" className="p-6 bg-white/5 group cursor-pointer">
                        <div className="flex items-start space-x-4">
                          {/* Icon */}
                          <div className={`w-12 h-12 rounded-xl ${color.bg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                            <Icon className={`w-6 h-6 ${color.icon}`} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="text-lg font-semibold text-gray-200 group-hover:text-blue-400 transition-colors">
                                  {activity.title}
                                </h3>
                                {activity.repo && (
                                  <p className="text-sm text-gray-500">{activity.repo}</p>
                                )}
                              </div>
                              <StatusIcon className={`w-5 h-5 ${statusColors[activity.status]} flex-shrink-0`} />
                            </div>
                            
                            <p className="text-gray-400 mb-3">{activity.description}</p>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>{getRelativeTime(activity.timestamp)}</span>
                              </div>
                              <span className="capitalize">{activity.type}</span>
                              <span className={`capitalize ${statusColors[activity.status]}`}>
                                {activity.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </LiquidGlassCard>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Load More */}
            {filteredActivities.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 text-center"
              >
                <button className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors">
                  Load More Activities
                </button>
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </DashboardAuth>
  );
}
