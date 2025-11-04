'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from '@/components/Card';
import Sidebar from '@/components/Sidebar';
import DashboardAuth from '../components/DashboardAuth';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  GitCommit, 
  GitPullRequest, 
  Calendar,
  Award,
  Target,
  Zap
} from 'lucide-react';
import CommitHeatmap from '../components/CommitHeatmap';
import ProductivityChart from '../components/ProductivityChart';
import LanguageBreakdown from '../components/LanguageBreakdown';
import WeeklyActivity from '../components/WeeklyActivity';

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    totalCommits: 0,
    commitsTrend: 0,
    totalPRs: 0,
    prsTrend: 0,
    avgResponseTime: '0h',
    responseTrend: 0,
    productivityScore: 0,
    scoreTrend: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      if (response.ok) {
        const data = await response.json();
        setStats({
          totalCommits: data.stats.totalCommits || 0,
          commitsTrend: data.stats.commitTrend || 0,
          totalPRs: data.stats.totalPRs || 0,
          prsTrend: data.stats.prTrend || 0,
          avgResponseTime: data.stats.avgResponseTime || '0h',
          responseTrend: data.stats.responseTrend || 0,
          productivityScore: data.stats.productivityScore || 0,
          scoreTrend: data.stats.commitTrend || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardAuth>
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-8 bg-gray-950">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                Analytics Dashboard
              </h1>
              <p className="text-gray-400">Track your productivity and coding patterns</p>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                {
                  icon: GitCommit,
                  label: 'Total Commits',
                  value: stats.totalCommits,
                  trend: stats.commitsTrend,
                  bgColor: 'bg-blue-500/10',
                  iconColor: 'text-blue-500',
                  gradientFrom: 'from-blue-500/10',
                },
                {
                  icon: GitPullRequest,
                  label: 'Pull Requests',
                  value: stats.totalPRs,
                  trend: stats.prsTrend,
                  bgColor: 'bg-purple-500/10',
                  iconColor: 'text-purple-500',
                  gradientFrom: 'from-purple-500/10',
                },
                {
                  icon: Activity,
                  label: 'Avg Response Time',
                  value: stats.avgResponseTime,
                  trend: stats.responseTrend,
                  bgColor: 'bg-green-500/10',
                  iconColor: 'text-green-500',
                  gradientFrom: 'from-green-500/10',
                },
                {
                  icon: Award,
                  label: 'Productivity Score',
                  value: stats.productivityScore,
                  trend: stats.scoreTrend,
                  bgColor: 'bg-orange-500/10',
                  iconColor: 'text-orange-500',
                  gradientFrom: 'from-orange-500/10',
                },
              ].map((stat, index) => {
                const Icon = stat.icon;
                const isPositive = stat.trend > 0;
                const TrendIcon = isPositive ? TrendingUp : TrendingDown;

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="relative overflow-hidden group hover:scale-105 transition-transform">
                      <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradientFrom} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                      
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                          <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                            <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                          </div>
                          <div className={`flex items-center space-x-1 text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                            <TrendIcon className="w-4 h-4" />
                            <span>{Math.abs(stat.trend)}%</span>
                          </div>
                        </div>
                        
                        <p className="text-3xl font-bold mb-1">{stat.value}</p>
                        <p className="text-sm text-gray-400">{stat.label}</p>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Charts Grid */}
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card>
                  <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                    <Target className="w-5 h-5 text-blue-500" />
                    <span>Productivity Trends</span>
                  </h3>
                  <ProductivityChart />
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card>
                  <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-purple-500" />
                    <span>Weekly Activity</span>
                  </h3>
                  <WeeklyActivity />
                </Card>
              </motion.div>
            </div>

            {/* Heatmap */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mb-8"
            >
              <Card>
                <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-green-500" />
                  <span>Contribution Heatmap</span>
                </h3>
                <CommitHeatmap />
              </Card>
            </motion.div>

            {/* Language Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card>
                <h3 className="text-xl font-semibold mb-4">Language Breakdown</h3>
                <LanguageBreakdown />
              </Card>
            </motion.div>
          </div>
        </main>
      </div>
    </DashboardAuth>
  );
}
