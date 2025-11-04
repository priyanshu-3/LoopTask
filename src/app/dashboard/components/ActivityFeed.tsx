'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import { GitCommit, GitPullRequest, Calendar, RefreshCw, Github, MessageSquare, FileText, CalendarDays, Filter } from 'lucide-react';
import { getRelativeTime } from '@/utils/formatDate';
import { TableSkeleton } from '@/components/features/LoadingState';

const activityIcons = {
  commit: GitCommit,
  pull_request: GitPullRequest,
  meeting: Calendar,
};

const activityColors = {
  commit: 'text-blue-500',
  pull_request: 'text-purple-500',
  meeting: 'text-green-500',
};

const sourceIcons = {
  github: Github,
  notion: FileText,
  slack: MessageSquare,
  calendar: CalendarDays,
};

const sourceColors = {
  github: 'text-purple-400 bg-purple-500/10',
  notion: 'text-gray-400 bg-gray-500/10',
  slack: 'text-pink-400 bg-pink-500/10',
  calendar: 'text-blue-400 bg-blue-500/10',
};

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  created_at: string;
  metadata?: any;
  source?: string;
  external_url?: string;
}

interface ActivityFeedProps {
  selectedSource?: string | null;
  onSourceChange?: (source: string | null) => void;
  integrations?: any;
}

export default function ActivityFeed({ selectedSource, onSourceChange, integrations }: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchActivities();
  }, [selectedSource]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let url = '/api/activities?limit=20';
      if (selectedSource) {
        url += `&source=${selectedSource}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch activities');
      }

      const data = await response.json();
      setActivities(data.activities || []);
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const handleSourceFilter = (source: string | null) => {
    if (onSourceChange) {
      onSourceChange(source);
    }
  };

  const getSourceBadge = (source?: string) => {
    if (!source) return null;
    
    const Icon = sourceIcons[source as keyof typeof sourceIcons];
    const colorClass = sourceColors[source as keyof typeof sourceColors];
    
    if (!Icon) return null;
    
    return (
      <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded text-xs ${colorClass}`}>
        <Icon className="w-3 h-3" />
        <span className="capitalize">{source}</span>
      </div>
    );
  };

  if (loading) {
    return <TableSkeleton rows={5} />;
  }

  if (error) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchActivities}
            className="text-blue-400 hover:text-blue-300 flex items-center justify-center space-x-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry</span>
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      {/* Source Filter */}
      <div className="mb-4 pb-4 border-b border-gray-700">
        <div className="flex items-center space-x-2 mb-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-400">Filter by source:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleSourceFilter(null)}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              !selectedSource
                ? 'bg-blue-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
          >
            All Sources
          </button>
          {integrations?.github_connected && (
            <button
              onClick={() => handleSourceFilter('github')}
              className={`px-3 py-1 rounded-lg text-sm transition-colors flex items-center space-x-1 ${
                selectedSource === 'github'
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <Github className="w-3 h-3" />
              <span>GitHub</span>
            </button>
          )}
          {integrations?.notion_connected && (
            <button
              onClick={() => handleSourceFilter('notion')}
              className={`px-3 py-1 rounded-lg text-sm transition-colors flex items-center space-x-1 ${
                selectedSource === 'notion'
                  ? 'bg-gray-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <FileText className="w-3 h-3" />
              <span>Notion</span>
            </button>
          )}
          {integrations?.slack_connected && (
            <button
              onClick={() => handleSourceFilter('slack')}
              className={`px-3 py-1 rounded-lg text-sm transition-colors flex items-center space-x-1 ${
                selectedSource === 'slack'
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3 h-3" />
              <span>Slack</span>
            </button>
          )}
          {integrations?.calendar_connected && (
            <button
              onClick={() => handleSourceFilter('calendar')}
              className={`px-3 py-1 rounded-lg text-sm transition-colors flex items-center space-x-1 ${
                selectedSource === 'calendar'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <CalendarDays className="w-3 h-3" />
              <span>Calendar</span>
            </button>
          )}
        </div>
      </div>

      {/* Activities List */}
      <div className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-2">
              {selectedSource 
                ? `No ${selectedSource} activity yet`
                : 'No recent activity yet'
              }
            </p>
            <p className="text-sm text-gray-500">
              Go to Settings → Integrations to connect and sync your data
            </p>
          </div>
        ) : (
          activities.map((activity) => {
            const Icon = activityIcons[activity.type as keyof typeof activityIcons] || GitCommit;
            const color = activityColors[activity.type as keyof typeof activityColors] || 'text-gray-500';

            return (
              <div key={activity.id} className="flex items-start space-x-3 pb-4 border-b border-gray-700 last:border-0">
                <Icon className={`w-5 h-5 mt-1 ${color}`} />
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-gray-200 flex-1">
                      {activity.external_url ? (
                        <a 
                          href={activity.external_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:text-blue-400 transition-colors"
                        >
                          {activity.title}
                        </a>
                      ) : (
                        activity.title
                      )}
                    </p>
                    {activity.source && getSourceBadge(activity.source)}
                  </div>
                  {activity.metadata?.repository && (
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.metadata.repository}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    {getRelativeTime(activity.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
