'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { LiquidGlassCard } from '@/components/ui/liquid-weather-glass';
import Button from '@/components/Button';
import Skeleton from '@/components/Skeleton';
import { 
  Sparkles, 
  RefreshCw, 
  Calendar, 
  Github, 
  MessageSquare, 
  FileText, 
  CalendarDays,
  TrendingUp,
  Clock,
  GitPullRequest,
  Users,
  Lightbulb
} from 'lucide-react';

type DateRange = 'today' | 'week' | 'month' | 'custom';

interface AISummaryData {
  summary: string;
  highlights: string[];
  insights: string[];
  recommendations: string[];
  stats: {
    totalCommits: number;
    totalPRs: number;
    totalMeetings: number;
    meetingHours: number;
    focusTime: number;
    collaborationScore: number;
  };
  breakdown?: {
    github: number;
    notion: number;
    slack: number;
    calendar: number;
  };
}

export default function AISummaryCard() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>('today');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [summaryData, setSummaryData] = useState<AISummaryData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load summary on mount and when date range changes
  useEffect(() => {
    if (session?.user) {
      loadSummary();
    }
  }, [session, dateRange]);

  const getDateRangeParams = () => {
    const now = new Date();
    let start: Date;
    let end = now;

    switch (dateRange) {
      case 'today':
        start = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        start = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        start = new Date(now.setDate(now.getDate() - 30));
        break;
      case 'custom':
        if (customStartDate && customEndDate) {
          start = new Date(customStartDate);
          end = new Date(customEndDate);
        } else {
          start = new Date(now.setDate(now.getDate() - 7));
        }
        break;
      default:
        start = new Date(now.setHours(0, 0, 0, 0));
    }

    return {
      start: start.toISOString(),
      end: end.toISOString(),
      type: dateRange === 'today' ? 'daily' : dateRange === 'week' ? 'weekly' : 'monthly'
    };
  };

  const loadSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = getDateRangeParams();
      const queryString = new URLSearchParams(params).toString();
      
      const res = await fetch(`/api/integrations/summary?${queryString}`);
      
      if (res.ok) {
        const data = await res.json();
        setSummaryData(data);
        setError(null);
      } else {
        const errorData = await res.json().catch(() => ({}));
        
        // If no activity data, set empty summary
        if (res.status === 404 || errorData.message?.includes('No activity data')) {
          setSummaryData(null);
          setError('No activity data found. Connect integrations to get started.');
        } else if (res.status === 503) {
          setError('AI service temporarily unavailable. Please try again later.');
        } else {
          setError(errorData.message || 'Failed to load summary');
        }
      }
    } catch (error) {
      console.error('Failed to load summary:', error);
      setSummaryData(null);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadSummary();
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'github':
        return <Github className="w-4 h-4" />;
      case 'notion':
        return <FileText className="w-4 h-4" />;
      case 'slack':
        return <MessageSquare className="w-4 h-4" />;
      case 'calendar':
        return <CalendarDays className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'github':
        return 'text-purple-400 bg-purple-500/10';
      case 'notion':
        return 'text-gray-400 bg-gray-500/10';
      case 'slack':
        return 'text-pink-400 bg-pink-500/10';
      case 'calendar':
        return 'text-blue-400 bg-blue-500/10';
      default:
        return 'text-gray-400 bg-gray-500/10';
    }
  };

  return (
    <LiquidGlassCard 
      shadowIntensity='sm'
      borderRadius='16px'
      glowIntensity='md'
      className="p-6 bg-white/5 relative overflow-hidden"
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-pulse"></div>
      
      <div className="relative z-10">
        {/* Header with date range selector */}
        <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-blue-400 animate-pulse" />
            <h3 className="text-xl font-semibold text-white">AI Summary</h3>
          </div>
          
          <div className="flex items-center space-x-2 flex-wrap gap-2">
            {/* Date Range Selector */}
            <div className="flex items-center space-x-1 bg-white/5 backdrop-blur-sm rounded-lg p-1 border border-white/10">
              <button
                onClick={() => setDateRange('today')}
                className={`px-3 py-1 rounded text-sm transition-all ${
                  dateRange === 'today' 
                    ? 'bg-blue-500 text-white shadow-lg' 
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setDateRange('week')}
                className={`px-3 py-1 rounded text-sm transition-all ${
                  dateRange === 'week' 
                    ? 'bg-blue-500 text-white shadow-lg' 
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setDateRange('month')}
                className={`px-3 py-1 rounded text-sm transition-all ${
                  dateRange === 'month' 
                    ? 'bg-blue-500 text-white shadow-lg' 
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                Month
              </button>
            </div>

            {/* Refresh Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>

        {loading ? (
          // Loading skeleton
          <div className="space-y-4">
            <Skeleton variant="text" count={3} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Skeleton variant="rectangular" height={80} />
              <Skeleton variant="rectangular" height={80} />
              <Skeleton variant="rectangular" height={80} />
              <Skeleton variant="rectangular" height={80} />
            </div>
            <Skeleton variant="rectangular" height={100} />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="bg-red-500/10 backdrop-blur-sm border border-red-500/30 rounded-lg p-4 mb-4">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
            <div className="flex items-center justify-center space-x-3">
              {error.includes('No activity data') && (
                <Button 
                  onClick={() => window.location.href = '/dashboard/integrations'} 
                  variant="primary" 
                  size="sm"
                >
                  Connect Integrations
                </Button>
              )}
              <Button onClick={handleRefresh} variant="outline" size="sm">
                Try Again
              </Button>
            </div>
          </div>
        ) : summaryData ? (
          <>
            {/* Summary Text */}
            <p className="text-gray-300 leading-relaxed mb-4">
              {summaryData.summary}
            </p>

            {/* Activity Breakdown by Platform */}
            {summaryData.breakdown && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-400 mb-2 flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>Activity by Platform</span>
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(summaryData.breakdown).map(([provider, count]) => (
                    <div 
                      key={provider}
                      className={`rounded-lg p-3 flex items-center space-x-2 ${getProviderColor(provider)}`}
                    >
                      {getProviderIcon(provider)}
                      <div>
                        <p className="text-lg font-bold">{count}</p>
                        <p className="text-xs capitalize">{provider}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Productivity Metrics */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-400 mb-2 flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Productivity Metrics</span>
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="bg-blue-500/10 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <Github className="w-4 h-4 text-blue-400" />
                    <p className="text-xs text-gray-400">Commits</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-400">{summaryData.stats.totalCommits}</p>
                </div>
                <div className="bg-purple-500/10 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <GitPullRequest className="w-4 h-4 text-purple-400" />
                    <p className="text-xs text-gray-400">Pull Requests</p>
                  </div>
                  <p className="text-2xl font-bold text-purple-400">{summaryData.stats.totalPRs}</p>
                </div>
                <div className="bg-green-500/10 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <Users className="w-4 h-4 text-green-400" />
                    <p className="text-xs text-gray-400">Meetings</p>
                  </div>
                  <p className="text-2xl font-bold text-green-400">{summaryData.stats.totalMeetings}</p>
                </div>
                <div className="bg-orange-500/10 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <Clock className="w-4 h-4 text-orange-400" />
                    <p className="text-xs text-gray-400">Meeting Hours</p>
                  </div>
                  <p className="text-2xl font-bold text-orange-400">{summaryData.stats.meetingHours.toFixed(1)}</p>
                </div>
                <div className="bg-cyan-500/10 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <p className="text-xs text-gray-400">Focus Time</p>
                  </div>
                  <p className="text-2xl font-bold text-cyan-400">{summaryData.stats.focusTime.toFixed(1)}h</p>
                </div>
                <div className="bg-pink-500/10 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-pink-400" />
                    <p className="text-xs text-gray-400">Collaboration</p>
                  </div>
                  <p className="text-2xl font-bold text-pink-400">{summaryData.stats.collaborationScore}%</p>
                </div>
              </div>
            </div>

            {/* Key Insights */}
            {summaryData.insights && summaryData.insights.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-400 mb-2 flex items-center space-x-2">
                  <Lightbulb className="w-4 h-4" />
                  <span>Key Insights</span>
                </h4>
                <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-3 space-y-2">
                  {summaryData.insights.map((insight, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <span className="text-yellow-400 mt-0.5">•</span>
                      <p className="text-sm text-gray-300">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {summaryData.recommendations && summaryData.recommendations.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-400 mb-2 flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>Recommendations</span>
                </h4>
                <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-3 space-y-2">
                  {summaryData.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <span className="text-green-400 mt-0.5">✓</span>
                      <p className="text-sm text-gray-300">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-200 mb-2 text-lg font-medium">No summary available yet</p>
            <p className="text-sm text-gray-300 mb-4">
              Connect integrations and sync your data to generate AI-powered insights
            </p>
            <div className="flex items-center justify-center space-x-3">
              <Button 
                onClick={() => window.location.href = '/dashboard/integrations'} 
                variant="primary" 
                size="sm"
              >
                Connect Integrations
              </Button>
              <Button onClick={handleRefresh} variant="outline" size="sm">
                Refresh
              </Button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs text-gray-400">
          <span>Powered by AI</span>
          <span>{new Date().toLocaleDateString()}</span>
        </div>
      </div>
    </LiquidGlassCard>
  );
}
