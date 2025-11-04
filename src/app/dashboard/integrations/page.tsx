'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, AlertCircle, CheckCircle2, AlertTriangle, RefreshCw, Clock, TrendingUp, Activity, BarChart3, Bell } from 'lucide-react';
import IntegrationCard, { IntegrationProvider } from '@/components/integrations/IntegrationCard';
import Skeleton, { CardSkeleton } from '@/components/Skeleton';
import { LiquidGlassCard } from '@/components/ui/liquid-weather-glass';
import { useToast } from '@/components/Toast';
import Button from '@/components/Button';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { NotificationList } from '@/components/integrations/NotificationList';

interface IntegrationStatus {
  github_connected: boolean;
  slack_connected: boolean;
  notion_connected: boolean;
  calendar_connected: boolean;
  last_synced_at?: string | null;
}

interface ProviderStatus {
  provider: IntegrationProvider;
  status: string;
  lastSync: string | null;
  activityCount: number;
  totalActivityCount: number;
  requiresReauth?: boolean;
  consecutiveFailures?: number;
  rateLimitedUntil?: string | null;
}

interface AnalyticsData {
  totalActivities: number;
  byProvider: {
    github: number;
    notion: number;
    slack: number;
    calendar: number;
  };
}

type TimePeriod = '7d' | '30d' | 'all';

export default function IntegrationsPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [integrationStatus, setIntegrationStatus] = useState<IntegrationStatus | null>(null);
  const [providerStatuses, setProviderStatuses] = useState<Record<IntegrationProvider, ProviderStatus>>({
    github: { provider: 'github', status: 'idle', lastSync: null, activityCount: 0, totalActivityCount: 0 },
    notion: { provider: 'notion', status: 'idle', lastSync: null, activityCount: 0, totalActivityCount: 0 },
    slack: { provider: 'slack', status: 'idle', lastSync: null, activityCount: 0, totalActivityCount: 0 },
    calendar: { provider: 'calendar', status: 'idle', lastSync: null, activityCount: 0, totalActivityCount: 0 },
  });
  const [syncingProviders, setSyncingProviders] = useState<Set<IntegrationProvider>>(new Set());
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('30d');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Fetch integration status on mount only
  useEffect(() => {
    fetchIntegrationStatus();
    
    // Set up auto-refresh every 30 seconds (instead of constant polling)
    const interval = setInterval(() => {
      fetchIntegrationStatus();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Fetch analytics when period changes (with debounce)
  useEffect(() => {
    if (!loading && integrationStatus) {
      const timer = setTimeout(() => {
        fetchAnalytics();
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [selectedPeriod, loading, integrationStatus]);

  const fetchIntegrationStatus = async () => {
    try {
      setLoading(true);

      // Fetch overall integration status
      const response = await fetch('/api/integrations');
      if (!response.ok) {
        throw new Error('Failed to fetch integration status');
      }
      const data = await response.json();
      setIntegrationStatus(data);

      // Fetch detailed status for each connected provider (only if connected)
      const providers: IntegrationProvider[] = ['github', 'notion', 'slack', 'calendar'];
      const connectedProviders = providers.filter(provider => {
        const connectedKey = `${provider}_connected` as keyof IntegrationStatus;
        return data[connectedKey];
      });
      
      // Only fetch status for connected providers
      const statusPromises = connectedProviders.map(async (provider) => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
          
          const statusResponse = await fetch(`/api/integrations/${provider}/status`, {
            signal: controller.signal,
          });
          
          clearTimeout(timeoutId);
          
          if (statusResponse.ok) {
            const statusData = await statusResponse.json();
            return { provider, data: statusData };
          }
        } catch (err) {
          if (err instanceof Error && err.name !== 'AbortError') {
            console.error(`Failed to fetch ${provider} status:`, err);
          }
        }
        return { provider, data: null };
      });

      const statuses = await Promise.all(statusPromises);
      const newProviderStatuses = { ...providerStatuses };
      
      statuses.forEach(({ provider, data }) => {
        if (data) {
          newProviderStatuses[provider] = {
            provider,
            status: data.status || 'idle',
            lastSync: data.lastSync || null,
            activityCount: data.activityCount || 0,
            totalActivityCount: data.totalActivityCount || 0,
            requiresReauth: data.requiresReauth || false,
            consecutiveFailures: data.consecutiveFailures || 0,
            rateLimitedUntil: data.rateLimitedUntil || null,
          };
        }
      });

      setProviderStatuses(newProviderStatuses);
    } catch (err) {
      console.error('Error fetching integration status:', err);
      showToast({
        type: 'error',
        title: 'Failed to load integrations',
        message: 'Please refresh the page to try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (provider: IntegrationProvider) => {
    try {
      // Redirect to OAuth connect endpoint
      window.location.href = `/api/integrations/${provider}/connect`;
    } catch (err) {
      console.error(`Error connecting ${provider}:`, err);
      showToast({
        type: 'error',
        title: `Failed to connect ${provider}`,
        message: 'Please try again.',
      });
    }
  };

  const handleDisconnect = async (provider: IntegrationProvider) => {
    if (!confirm(`Are you sure you want to disconnect ${provider}? This will remove all synced data.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/integrations/${provider}/disconnect`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to disconnect');
      }

      showToast({
        type: 'success',
        title: `${provider} disconnected`,
        message: 'All synced data has been removed.',
      });
      
      // Refresh status
      await fetchIntegrationStatus();
    } catch (err) {
      console.error(`Error disconnecting ${provider}:`, err);
      showToast({
        type: 'error',
        title: `Failed to disconnect ${provider}`,
        message: 'Please try again.',
      });
    }
  };

  const handleSync = async (provider: IntegrationProvider) => {
    try {
      setSyncingProviders(prev => new Set(prev).add(provider));

      const response = await fetch(`/api/integrations/${provider}/sync`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle rate limiting
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          showToast({
            type: 'info',
            title: 'Rate limit reached',
            message: `Please wait ${retryAfter || 'a moment'} before syncing again.`,
            duration: 7000,
          });
          return;
        }
        
        throw new Error(errorData.error || 'Sync failed');
      }

      const result = await response.json();
      
      showToast({
        type: 'success',
        title: `${provider} synced successfully!`,
        message: `${result.itemsSynced || 0} items synced in ${Math.round(result.duration / 1000)}s`,
      });

      // Refresh status after sync
      await fetchIntegrationStatus();
    } catch (err) {
      console.error(`Error syncing ${provider}:`, err);
      const errorMessage = err instanceof Error ? err.message : 'Please try again.';
      
      showToast({
        type: 'error',
        title: `Failed to sync ${provider}`,
        message: errorMessage,
        duration: 7000,
      });
    } finally {
      setSyncingProviders(prev => {
        const newSet = new Set(prev);
        newSet.delete(provider);
        return newSet;
      });
    }
  };

  const handleRetrySync = (provider: IntegrationProvider) => {
    handleSync(provider);
  };

  const fetchAnalytics = async () => {
    try {
      setLoadingAnalytics(true);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
      
      const response = await fetch(`/api/integrations/analytics?period=${selectedPeriod}`, {
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('Error fetching analytics:', err);
      }
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const providers: IntegrationProvider[] = ['github', 'notion', 'slack', 'calendar'];
  const connectedCount = integrationStatus 
    ? providers.filter(p => integrationStatus[`${p}_connected` as keyof IntegrationStatus]).length 
    : 0;

  // Prepare chart data
  const chartData = analyticsData ? [
    { name: 'GitHub', value: analyticsData.byProvider.github, color: '#6366f1' },
    { name: 'Notion', value: analyticsData.byProvider.notion, color: '#8b5cf6' },
    { name: 'Slack', value: analyticsData.byProvider.slack, color: '#ec4899' },
    { name: 'Calendar', value: analyticsData.byProvider.calendar, color: '#14b8a6' },
  ].filter(item => item.value > 0) : [];

  const periodLabels: Record<TimePeriod, string> = {
    '7d': 'Last 7 Days',
    '30d': 'Last 30 Days',
    'all': 'All Time',
  };

  return (
    <div className="p-4 md:p-8 text-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-3 mb-2">
            <Zap className="w-8 h-8 text-blue-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
              Integrations
            </h1>
          </div>
          <p className="text-gray-400 text-lg">
            Connect your favorite tools to track activity across all platforms
          </p>
          
          {/* Connection summary */}
          {!loading && integrationStatus && (
            <div className="mt-4 flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className="text-gray-300">
                {connectedCount} of {providers.length} integrations connected
              </span>
            </div>
          )}
        </motion.div>

        {/* Analytics Overview */}
        {!loading && connectedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            {/* Time Period Selector */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                <BarChart3 className="w-6 h-6 text-blue-500" />
                <span>Activity Analytics</span>
              </h2>
              <div className="flex space-x-2">
                {(['7d', '30d', 'all'] as TimePeriod[]).map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedPeriod === period
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {periodLabels[period]}
                  </button>
                ))}
              </div>
            </div>

            {/* Activity Count Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              {/* Total Activities Card */}
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <Activity className="w-8 h-8 text-white/80" />
                  <TrendingUp className="w-5 h-5 text-white/60" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {loadingAnalytics ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    analyticsData?.totalActivities.toLocaleString() || '0'
                  )}
                </div>
                <div className="text-blue-100 text-sm">Total Activities</div>
              </div>

              {/* Individual Provider Cards */}
              {providers.map((provider) => {
                const connectedKey = `${provider}_connected` as keyof IntegrationStatus;
                const connected = integrationStatus?.[connectedKey];
                const count = analyticsData?.byProvider[provider] || 0;
                
                const providerConfig = {
                  github: { color: 'from-indigo-600 to-indigo-700', icon: '🔧' },
                  notion: { color: 'from-purple-600 to-purple-700', icon: '📝' },
                  slack: { color: 'from-pink-600 to-pink-700', icon: '💬' },
                  calendar: { color: 'from-teal-600 to-teal-700', icon: '📅' },
                };

                const config = providerConfig[provider];

                return (
                  <div
                    key={provider}
                    className={`bg-gradient-to-br ${config.color} rounded-xl p-6 shadow-lg ${
                      !connected ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{config.icon}</span>
                      {connected && (
                        <CheckCircle2 className="w-4 h-4 text-white/60" />
                      )}
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">
                      {loadingAnalytics ? (
                        <Skeleton className="h-8 w-16" />
                      ) : (
                        count.toLocaleString()
                      )}
                    </div>
                    <div className="text-white/90 text-sm capitalize">{provider}</div>
                  </div>
                );
              })}
            </div>

            {/* Activity Distribution Chart */}
            {chartData.length > 0 && (
              <LiquidGlassCard shadowIntensity="xs" borderRadius="16px" glowIntensity="sm" className="p-6 bg-white/5">
                <h3 className="text-lg font-semibold text-white mb-4">Activity Distribution</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: '1px solid #374151',
                          borderRadius: '0.5rem',
                          color: '#fff',
                        }}
                        formatter={(value: number) => [value.toLocaleString(), 'Activities']}
                      />
                      <Legend
                        wrapperStyle={{ color: '#9ca3af' }}
                        formatter={(value) => <span className="text-gray-400">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </LiquidGlassCard>
            )}
          </motion.div>
        )}

        {/* Warning banners for issues */}
        {!loading && Object.values(providerStatuses).some(s => s.requiresReauth) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg"
          >
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-yellow-400 font-semibold mb-1">Reauthorization Required</h3>
                <p className="text-yellow-400/80 text-sm mb-3">
                  Some integrations need to be reconnected. Click "Connect" to reauthorize.
                </p>
                <div className="flex flex-wrap gap-2">
                  {Object.values(providerStatuses)
                    .filter(s => s.requiresReauth)
                    .map(s => (
                      <Button
                        key={s.provider}
                        variant="outline"
                        size="sm"
                        onClick={() => handleConnect(s.provider)}
                        className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                      >
                        Reconnect {s.provider}
                      </Button>
                    ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {!loading && Object.values(providerStatuses).some(s => (s.consecutiveFailures || 0) >= 3) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
          >
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-red-400 font-semibold mb-1">Sync Failures Detected</h3>
                <p className="text-red-400/80 text-sm mb-3">
                  Some integrations have failed to sync multiple times. Try reconnecting or contact support.
                </p>
                <div className="flex flex-wrap gap-2">
                  {Object.values(providerStatuses)
                    .filter(s => (s.consecutiveFailures || 0) >= 3)
                    .map(s => (
                      <Button
                        key={s.provider}
                        variant="outline"
                        size="sm"
                        onClick={() => handleRetrySync(s.provider)}
                        className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                      >
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Retry {s.provider}
                      </Button>
                    ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {!loading && Object.values(providerStatuses).some(s => s.rateLimitedUntil) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg"
          >
            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-blue-400 font-semibold mb-1">Rate Limit Active</h3>
                <p className="text-blue-400/80 text-sm">
                  Some integrations are temporarily rate limited. Sync will resume automatically.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Integration cards */}
        {!loading && integrationStatus && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {providers.map((provider, index) => {
              const connectedKey = `${provider}_connected` as keyof IntegrationStatus;
              const connected = Boolean(integrationStatus[connectedKey]);
              const status = providerStatuses[provider];

              return (
                <motion.div
                  key={provider}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <IntegrationCard
                    provider={provider}
                    connected={connected}
                    lastSync={status.lastSync}
                    activityCount={status.activityCount}
                    totalActivityCount={status.totalActivityCount}
                    onConnect={() => handleConnect(provider)}
                    onDisconnect={() => handleDisconnect(provider)}
                    onSync={() => handleSync(provider)}
                    syncing={syncingProviders.has(provider)}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Notifications Section */}
        {!loading && connectedCount > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <LiquidGlassCard shadowIntensity="xs" borderRadius="16px" glowIntensity="sm" className="p-6 bg-white/5">
              <div className="flex items-center space-x-2 mb-4">
                <Bell className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-semibold text-white">Notifications</h3>
              </div>
              <NotificationList />
            </LiquidGlassCard>
          </motion.div>
        )}

        {/* Help text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <LiquidGlassCard shadowIntensity="xs" borderRadius="16px" glowIntensity="sm" className="p-6 bg-white/5">
            <h3 className="text-lg font-semibold text-white mb-2">Getting Started</h3>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Click "Connect" on any integration to authorize DevTrack to access your data</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Once connected, data will sync automatically every 15-30 minutes</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Use "Sync Now" to manually fetch the latest data at any time</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Your data is encrypted and secure - we only store what's necessary for analytics</span>
              </li>
            </ul>
          </LiquidGlassCard>
        </motion.div>
      </div>
    </div>
  );
}
