'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Sidebar from '@/components/Sidebar';
import DashboardAuth from '../../components/DashboardAuth';
import { 
  Trophy,
  Medal,
  TrendingUp,
  TrendingDown,
  Minus,
  GitCommit,
  GitPullRequest,
  Clock,
  Target,
  Flame,
  Award
} from 'lucide-react';

export default function LeaderboardPage() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week');

  // Mock leaderboard data
  const leaderboardData = [
    {
      id: '1',
      name: 'Ayush Kumar',
      avatar: 'AK',
      commits: 247,
      prs: 43,
      reviews: 67,
      score: 95,
      trend: 'up',
      change: 12,
      streak: 28,
      rank: 1,
      previousRank: 1,
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      avatar: 'SJ',
      commits: 189,
      prs: 31,
      reviews: 54,
      score: 88,
      trend: 'up',
      change: 5,
      streak: 21,
      rank: 2,
      previousRank: 3,
    },
    {
      id: '3',
      name: 'Mike Chen',
      avatar: 'MC',
      commits: 156,
      prs: 28,
      reviews: 41,
      score: 82,
      trend: 'down',
      change: -3,
      streak: 14,
      rank: 3,
      previousRank: 2,
    },
    {
      id: '4',
      name: 'Emily Davis',
      avatar: 'ED',
      commits: 134,
      prs: 24,
      reviews: 38,
      score: 79,
      trend: 'same',
      change: 0,
      streak: 19,
      rank: 4,
      previousRank: 4,
    },
    {
      id: '5',
      name: 'Alex Rodriguez',
      avatar: 'AR',
      commits: 98,
      prs: 18,
      reviews: 29,
      score: 71,
      trend: 'up',
      change: 8,
      streak: 7,
      rank: 5,
      previousRank: 6,
    },
  ];

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-orange-600" />;
    return <span className="text-xl font-bold text-gray-500">#{rank}</span>;
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
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
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 bg-clip-text text-transparent">
                Team Leaderboard
              </h1>
              <p className="text-gray-400">See who's leading the pack this {timeRange}</p>
            </motion.div>

            {/* Time Range Selector */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8 flex space-x-3"
            >
              {(['week', 'month', 'all'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${
                    timeRange === range
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </motion.div>

            {/* Top 3 Podium */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-12"
            >
              <Card className="bg-gradient-to-br from-gray-800 to-gray-900">
                <div className="flex items-end justify-center space-x-8 py-8">
                  {/* 2nd Place */}
                  {leaderboardData[1] && (
                    <motion.div
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex flex-col items-center"
                    >
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-2xl font-bold mb-3 ring-4 ring-gray-500/30">
                        {leaderboardData[1].avatar}
                      </div>
                      <Medal className="w-8 h-8 text-gray-400 mb-2" />
                      <h3 className="font-bold text-lg">{leaderboardData[1].name}</h3>
                      <p className="text-3xl font-bold text-gray-400 mt-2">{leaderboardData[1].score}</p>
                      <div className="mt-4 bg-gray-700 rounded-lg px-6 py-8 w-32 text-center">
                        <p className="text-4xl font-bold">2</p>
                      </div>
                    </motion.div>
                  )}

                  {/* 1st Place */}
                  {leaderboardData[0] && (
                    <motion.div
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="flex flex-col items-center"
                    >
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-400 to-orange-600 flex items-center justify-center text-3xl font-bold mb-3 ring-4 ring-yellow-500/30 animate-pulse">
                        {leaderboardData[0].avatar}
                      </div>
                      <Trophy className="w-10 h-10 text-yellow-500 mb-2" />
                      <h3 className="font-bold text-xl">{leaderboardData[0].name}</h3>
                      <p className="text-4xl font-bold text-yellow-500 mt-2">{leaderboardData[0].score}</p>
                      <div className="mt-4 bg-gradient-to-br from-yellow-600 to-orange-600 rounded-lg px-6 py-12 w-32 text-center">
                        <p className="text-5xl font-bold">1</p>
                      </div>
                    </motion.div>
                  )}

                  {/* 3rd Place */}
                  {leaderboardData[2] && (
                    <motion.div
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="flex flex-col items-center"
                    >
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-600 to-orange-800 flex items-center justify-center text-2xl font-bold mb-3 ring-4 ring-orange-500/30">
                        {leaderboardData[2].avatar}
                      </div>
                      <Medal className="w-8 h-8 text-orange-600 mb-2" />
                      <h3 className="font-bold text-lg">{leaderboardData[2].name}</h3>
                      <p className="text-3xl font-bold text-orange-600 mt-2">{leaderboardData[2].score}</p>
                      <div className="mt-4 bg-gray-700 rounded-lg px-6 py-6 w-32 text-center">
                        <p className="text-4xl font-bold">3</p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </Card>
            </motion.div>

            {/* Full Leaderboard */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h2 className="text-2xl font-bold mb-6">Full Rankings</h2>
              
              <div className="space-y-4">
                {leaderboardData.map((member, index) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.05 }}
                  >
                    <Card hover className={`${index < 3 ? 'ring-2 ring-blue-500/20' : ''}`}>
                      <div className="flex items-center justify-between">
                        {/* Rank & Avatar */}
                        <div className="flex items-center space-x-6">
                          <div className="w-16 flex items-center justify-center">
                            {getRankIcon(member.rank)}
                          </div>
                          
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-lg font-bold">
                            {member.avatar}
                          </div>

                          <div>
                            <h3 className="text-lg font-semibold">{member.name}</h3>
                            <div className="flex items-center space-x-2 text-sm text-gray-400">
                              <span>Rank #{member.rank}</span>
                              {member.rank !== member.previousRank && (
                                <span className="text-xs">
                                  (was #{member.previousRank})
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center space-x-8">
                          <div className="text-center">
                            <div className="flex items-center space-x-1 text-blue-400">
                              <GitCommit className="w-4 h-4" />
                              <span className="font-bold">{member.commits}</span>
                            </div>
                            <p className="text-xs text-gray-500">Commits</p>
                          </div>

                          <div className="text-center">
                            <div className="flex items-center space-x-1 text-purple-400">
                              <GitPullRequest className="w-4 h-4" />
                              <span className="font-bold">{member.prs}</span>
                            </div>
                            <p className="text-xs text-gray-500">PRs</p>
                          </div>

                          <div className="text-center">
                            <div className="flex items-center space-x-1 text-green-400">
                              <Clock className="w-4 h-4" />
                              <span className="font-bold">{member.reviews}</span>
                            </div>
                            <p className="text-xs text-gray-500">Reviews</p>
                          </div>

                          <div className="text-center">
                            <div className="flex items-center space-x-1 text-orange-400">
                              <Flame className="w-4 h-4" />
                              <span className="font-bold">{member.streak}</span>
                            </div>
                            <p className="text-xs text-gray-500">Day Streak</p>
                          </div>

                          {/* Score & Trend */}
                          <div className="text-center min-w-[100px]">
                            <div className="flex items-center justify-center space-x-2">
                              <span className="text-2xl font-bold">{member.score}</span>
                              {getTrendIcon(member.trend)}
                            </div>
                            <p className="text-xs text-gray-500">
                              {member.change > 0 && '+'}
                              {member.change !== 0 && member.change}
                              {member.change === 0 && '—'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Achievement Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="mt-12"
            >
              <h2 className="text-2xl font-bold mb-6">Top Achievements</h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { title: 'Most Commits', winner: 'Ayush Kumar', value: '247 commits', icon: GitCommit, color: 'blue' },
                  { title: 'Most PRs', winner: 'Ayush Kumar', value: '43 PRs', icon: GitPullRequest, color: 'purple' },
                  { title: 'Longest Streak', winner: 'Ayush Kumar', value: '28 days', icon: Flame, color: 'orange' },
                ].map((achievement, index) => {
                  const Icon = achievement.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.3 + index * 0.1 }}
                    >
                      <Card hover className="text-center">
                        <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-${achievement.color}-500/10 flex items-center justify-center`}>
                          <Icon className={`w-8 h-8 text-${achievement.color}-500`} />
                        </div>
                        <h3 className="font-bold text-lg mb-2">{achievement.title}</h3>
                        <p className="text-gray-400 mb-1">{achievement.winner}</p>
                        <p className={`text-2xl font-bold text-${achievement.color}-500`}>{achievement.value}</p>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </DashboardAuth>
  );
}
