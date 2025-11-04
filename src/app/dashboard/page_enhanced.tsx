'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import DashboardAuth from './components/DashboardAuth';
import StatsCard from '@/components/StatsCard';
import CommandPalette from '@/components/CommandPalette';
import { 
  GitCommit, 
  GitPullRequest, 
  Clock, 
  Zap,
  TrendingUp,
  Calendar,
  Users,
  Target,
  Brain,
  Sparkles,
  ArrowRight,
  Activity as ActivityIcon
} from 'lucide-react';
import Card from '@/components/Card';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    commits: 247,
    prs: 43,
    avgResponseTime: '2.3h',
    productivity: 87,
  });

  const [recentActivity, setRecentActivity] = useState([
    {
      id: '1',
      type: 'commit',
      title: 'Fixed authentication bug',
      repo: 'looptask/main',
      time: '2 hours ago',
      user: 'You',
    },
    {
      id: '2',
      type: 'pr',
      title: 'Add workflow automation',
      repo: 'looptask/main',
      time: '5 hours ago',
      user: 'You',
    },
    {
      id: '3',
      type: 'review',
      title: 'Reviewed PR #234',
      repo: 'looptask/main',
      time: '1 day ago',
      user: 'You',
    },
  ]);

  const [aiInsights, setAiInsights] = useState([
    {
      id: '1',
      title: 'Peak Performance Detected',
      description: 'You\'re most productive between 9 AM - 12 PM',
      type: 'success',
      action: 'Schedule important tasks during these hours',
    },
    {
      id: '2',
      title: 'Collaboration Boost',
      description: 'You\'ve reviewed 23% more PRs this week',
      type: 'info',
      action: 'Keep up the great teamwork!',
    },
  ]);

  return (
    <DashboardAuth>
      <div className="flex min-h-screen bg-gray-950">
        <Sidebar />
        
        <main className="flex-1">
          {/* Top Bar */}
          <div className="sticky top-0 z-40 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800">
            <div className="px-8 py-4 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Dashboard
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Welcome back! Here's what's happening today.
                </p>
              </div>
              <CommandPalette />
            </div>
          </div>

          <div className="p-8">
            <div className="max-w-7xl mx-auto space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                  title="Total Commits"
                  value={stats.commits}
                  change={12}
                  trend="up"
                  icon={GitCommit}
                  color="blue"
                  subtitle="Last 30 days"
                  delay={0}
                />
                <StatsCard
                  title="Pull Requests"
                  value={stats.prs}
                  change={8}
                  trend="up"
                  icon={GitPullRequest}
                  color="purple"
                  subtitle="Last 30 days"
                  delay={0.1}
                />
                <StatsCard
                  title="Avg Response Time"
                  value={stats.avgResponseTime}
                  change={-15}
                  trend="down"
                  icon={Clock}
                  color="green"
                  subtitle="Faster than last week"
                  delay={0.2}
                />
                <StatsCard
                  title="Productivity Score"
                  value={stats.productivity}
                  change={5}
                  trend="up"
                  icon={Zap}
                  color="orange"
                  subtitle="Out of 100"
                  delay={0.3}
                />
              </div>

              {/* AI Insights Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">AI Insights</h2>
                      <p className="text-sm text-gray-500">Personalized recommendations</p>
                    </div>
                  </div>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg transition-all text-sm font-medium">
                    <span>View All</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {aiInsights.map((insight, index) => (
                    <motion.div
                      key={insight.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                    >
                      <LiquidGlassCard shadowIntensity="xs" borderRadius="16px" glowIntensity="sm" className="p-6 bg-white/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-2xl" />
                        
                        <div className="relative">
                          <div className="flex items-start space-x-3 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                              <Sparkles className="w-4 h-4 text-purple-500" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-white mb-1">{insight.title}</h3>
                              <p className="text-sm text-gray-400">{insight.description}</p>
                            </div>
                          </div>
                          <div className="mt-4 pt-4 border-t border-gray-800">
                            <p className="text-xs text-purple-400 font-medium">
                              💡 {insight.action}
                            </p>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { icon: Target, label: 'Create Goal', color: 'from-green-500 to-emerald-500', href: '/dashboard/team/goals' },
                    { icon: Zap, label: 'New Workflow', color: 'from-blue-500 to-cyan-500', href: '/dashboard/workflows' },
                    { icon: Users, label: 'Invite Team', color: 'from-purple-500 to-pink-500', href: '/dashboard/team' },
                    { icon: Brain, label: 'AI Insights', color: 'from-orange-500 to-red-500', href: '/dashboard/insights' },
                  ].map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8 + index * 0.05 }}
                        whileHover={{ scale: 1.05, y: -4 }}
                        whileTap={{ scale: 0.95 }}
                        className="relative group"
                      >
                        <div className={`absolute inset-0 bg-gradient-to-r ${action.color} rounded-xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity`} />
                        <div className="relative bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-6 transition-all">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${action.color} flex items-center justify-center mb-3 mx-auto`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <p className="text-sm font-medium text-white">{action.label}</p>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>

              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Recent Activity</h2>
                  <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                    View All →
                  </button>
                </div>

                <Card>
                  <div className="divide-y divide-gray-800">
                    {recentActivity.map((activity, index) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1 + index * 0.05 }}
                        className="flex items-center space-x-4 py-4 first:pt-0 last:pb-0 hover:bg-gray-800/50 -mx-6 px-6 transition-colors"
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          activity.type === 'commit' ? 'bg-blue-500/10' :
                          activity.type === 'pr' ? 'bg-purple-500/10' :
                          'bg-green-500/10'
                        }`}>
                          {activity.type === 'commit' && <GitCommit className="w-5 h-5 text-blue-500" />}
                          {activity.type === 'pr' && <GitPullRequest className="w-5 h-5 text-purple-500" />}
                          {activity.type === 'review' && <ActivityIcon className="w-5 h-5 text-green-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{activity.title}</p>
                          <p className="text-xs text-gray-500">{activity.repo} • {activity.time}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors" />
                      </motion.div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </DashboardAuth>
  );
}
