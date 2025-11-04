'use client';

import { useEffect, useState } from 'react';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import Button from '@/components/Button';
import Skeleton from '@/components/Skeleton';

interface CronJobStats {
  jobName: string;
  totalExecutions: number;
  successCount: number;
  failureCount: number;
  successRate: number;
  averageDuration: number;
  lastExecution?: string;
  lastStatus?: 'success' | 'failed';
  recentFailures: number;
}

interface CronJobAlert {
  jobName: string;
  alertType: string;
  threshold: number;
  currentValue: number;
  message: string;
  severity: 'warning' | 'error';
  triggeredAt: string;
}

interface CronJobExecution {
  id: string;
  jobName: string;
  startedAt: string;
  completedAt?: string;
  status: 'running' | 'success' | 'failed';
  usersProcessed: number;
  providersSync: number;
  successCount: number;
  failureCount: number;
  errorMessage?: string;
  durationMs?: number;
}

interface DashboardData {
  stats: CronJobStats[];
  alerts: CronJobAlert[];
  recentExecutions: Record<string, CronJobExecution[]>;
  timeRange: {
    hours: number;
    since: string;
  };
}

/**
 * Cron Job Monitoring Dashboard
 * 
 * Displays statistics, alerts, and recent executions for scheduled cron jobs
 * 
 * Requirements: 7.5
 */
export default function MonitoringPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState(24);

  useEffect(() => {
    fetchMonitoringData();
  }, [timeRange]);

  const fetchMonitoringData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/cron/monitoring?timeRange=${timeRange}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch monitoring data');
      }

      const data = await response.json();
      setData(data);
    } catch (err) {
      console.error('Failed to fetch monitoring data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Cron Job Monitoring</h1>
          <p className="text-gray-400">Loading monitoring data...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <Skeleton className="h-32" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <div className="text-center py-8">
            <p className="text-red-400 mb-4">Failed to load monitoring data</p>
            <p className="text-gray-400 mb-4">{error}</p>
            <Button onClick={fetchMonitoringData}>Retry</Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Cron Job Monitoring</h1>
          <p className="text-gray-400">
            Monitoring data for the last {timeRange} hours
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(parseInt(e.target.value))}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
          >
            <option value={1}>Last 1 hour</option>
            <option value={6}>Last 6 hours</option>
            <option value={24}>Last 24 hours</option>
            <option value={72}>Last 3 days</option>
            <option value={168}>Last 7 days</option>
          </select>
          <Button onClick={fetchMonitoringData}>Refresh</Button>
        </div>
      </div>

      {/* Alerts */}
      {data.alerts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Active Alerts</h2>
          <div className="space-y-2">
            {data.alerts.map((alert, index) => (
              <Card key={index} className="border-l-4 border-red-500">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={alert.severity === 'error' ? 'error' : 'warning'}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                      <span className="font-semibold">{alert.jobName}</span>
                    </div>
                    <p className="text-gray-300">{alert.message}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Triggered at {formatDate(alert.triggeredAt)}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Job Statistics */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Job Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.stats.map((stat) => (
            <Card key={stat.jobName}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">{stat.jobName}</h3>
                  {stat.lastStatus && (
                    <Badge variant={stat.lastStatus === 'success' ? 'success' : 'error'}>
                      {stat.lastStatus}
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Total Executions</p>
                    <p className="text-2xl font-bold">{stat.totalExecutions}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Success Rate</p>
                    <p className="text-2xl font-bold">
                      {(stat.successRate * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Successes</p>
                    <p className="text-xl font-semibold text-green-400">
                      {stat.successCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Failures</p>
                    <p className="text-xl font-semibold text-red-400">
                      {stat.failureCount}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-400">Average Duration</p>
                  <p className="text-lg font-semibold">
                    {formatDuration(stat.averageDuration)}
                  </p>
                </div>

                {stat.recentFailures > 0 && (
                  <div className="pt-2 border-t border-gray-700">
                    <Badge variant="error">
                      {stat.recentFailures} consecutive failures
                    </Badge>
                  </div>
                )}

                {stat.lastExecution && (
                  <div className="pt-2 border-t border-gray-700">
                    <p className="text-xs text-gray-500">
                      Last execution: {formatDate(stat.lastExecution)}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Executions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Executions</h2>
        {Object.entries(data.recentExecutions).map(([jobName, executions]) => (
          <Card key={jobName}>
            <h3 className="font-semibold text-lg mb-4">{jobName}</h3>
            <div className="space-y-2">
              {executions.map((execution) => (
                <div
                  key={execution.id}
                  className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant={
                          execution.status === 'success'
                            ? 'success'
                            : execution.status === 'failed'
                            ? 'error'
                            : 'default'
                        }
                      >
                        {execution.status}
                      </Badge>
                      <span className="text-sm text-gray-400">
                        {formatDate(execution.startedAt)}
                      </span>
                    </div>
                    <div className="flex gap-4 text-sm text-gray-400">
                      <span>Users: {execution.usersProcessed}</span>
                      <span>Providers: {execution.providersSync}</span>
                      <span>Success: {execution.successCount}</span>
                      <span>Failed: {execution.failureCount}</span>
                      {execution.durationMs && (
                        <span>Duration: {formatDuration(execution.durationMs)}</span>
                      )}
                    </div>
                    {execution.errorMessage && (
                      <p className="text-sm text-red-400 mt-1">
                        Error: {execution.errorMessage}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {data.stats.length === 0 && (
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-400">No cron job executions found in the selected time range</p>
          </div>
        </Card>
      )}
    </div>
  );
}
