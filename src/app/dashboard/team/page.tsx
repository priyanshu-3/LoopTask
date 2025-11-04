'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Sidebar from '@/components/Sidebar';
import DashboardAuth from '../components/DashboardAuth';
import { 
  Users, 
  Plus,
  Crown,
  Mail,
  MoreVertical,
  UserPlus,
  Settings,
  TrendingUp,
  GitCommit,
  Award,
  Target
} from 'lucide-react';

export default function TeamPage() {
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Mock team data
  const teamMembers = [
    {
      id: '1',
      name: 'Ayush Kumar',
      email: 'ayush@looptask.com',
      role: 'Owner',
      avatar: 'AK',
      commits: 247,
      prs: 43,
      score: 95,
      status: 'online',
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah@looptask.com',
      role: 'Admin',
      avatar: 'SJ',
      commits: 189,
      prs: 31,
      score: 88,
      status: 'online',
    },
    {
      id: '3',
      name: 'Mike Chen',
      email: 'mike@looptask.com',
      role: 'Member',
      avatar: 'MC',
      commits: 156,
      prs: 28,
      score: 82,
      status: 'offline',
    },
    {
      id: '4',
      name: 'Emily Davis',
      email: 'emily@looptask.com',
      role: 'Member',
      avatar: 'ED',
      commits: 134,
      prs: 24,
      score: 79,
      status: 'online',
    },
  ];

  const teamStats = {
    totalMembers: teamMembers.length,
    totalCommits: teamMembers.reduce((sum, m) => sum + m.commits, 0),
    totalPRs: teamMembers.reduce((sum, m) => sum + m.prs, 0),
    avgScore: Math.round(teamMembers.reduce((sum, m) => sum + m.score, 0) / teamMembers.length),
  };

  const roleColors = {
    Owner: 'text-yellow-500',
    Admin: 'text-blue-500',
    Member: 'text-gray-400',
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
              className="mb-8 flex items-center justify-between"
            >
              <div>
                <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                  Team Workspace
                </h1>
                <p className="text-gray-400">Collaborate with your team members</p>
              </div>
              
              <Button 
                variant="primary" 
                className="flex items-center space-x-2"
                onClick={() => setShowInviteModal(true)}
              >
                <UserPlus className="w-5 h-5" />
                <span>Invite Member</span>
              </Button>
            </motion.div>

            {/* Team Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[
                { icon: Users, label: 'Team Members', value: teamStats.totalMembers, bgColor: 'bg-blue-500/10', iconColor: 'text-blue-500' },
                { icon: GitCommit, label: 'Total Commits', value: teamStats.totalCommits, bgColor: 'bg-purple-500/10', iconColor: 'text-purple-500' },
                { icon: TrendingUp, label: 'Total PRs', value: teamStats.totalPRs, bgColor: 'bg-green-500/10', iconColor: 'text-green-500' },
                { icon: Award, label: 'Avg Score', value: teamStats.avgScore, bgColor: 'bg-orange-500/10', iconColor: 'text-orange-500' },
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="relative overflow-hidden group hover:scale-105 transition-transform">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                          <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                        </div>
                      </div>
                      <p className="text-3xl font-bold mb-1">{stat.value}</p>
                      <p className="text-sm text-gray-400">{stat.label}</p>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Team Members Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-2xl font-bold mb-6">Team Members</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {teamMembers.map((member, index) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    <Card hover className="group">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          {/* Avatar */}
                          <div className="relative">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-xl font-bold">
                              {member.avatar}
                            </div>
                            <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-gray-800 ${
                              member.status === 'online' ? 'bg-green-500' : 'bg-gray-500'
                            }`}></div>
                          </div>

                          {/* Info */}
                          <div>
                            <h3 className="text-lg font-semibold flex items-center space-x-2">
                              <span>{member.name}</span>
                              {member.role === 'Owner' && <Crown className="w-4 h-4 text-yellow-500" />}
                            </h3>
                            <p className="text-sm text-gray-400">{member.email}</p>
                            <span className={`text-xs ${roleColors[member.role as keyof typeof roleColors]}`}>
                              {member.role}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                          <MoreVertical className="w-5 h-5 text-gray-400" />
                        </button>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-700">
                        <div className="text-center">
                          <p className="text-xl font-bold text-blue-400">{member.commits}</p>
                          <p className="text-xs text-gray-500">Commits</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-bold text-purple-400">{member.prs}</p>
                          <p className="text-xs text-gray-500">PRs</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-bold text-orange-400">{member.score}</p>
                          <p className="text-xs text-gray-500">Score</p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Team Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="mt-8"
            >
              <h2 className="text-2xl font-bold mb-6">Recent Team Activity</h2>
              <Card>
                <div className="space-y-4">
                  {[
                    { user: 'Ayush Kumar', action: 'merged PR #234', time: '2 hours ago', color: 'blue' },
                    { user: 'Sarah Johnson', action: 'committed to main', time: '3 hours ago', color: 'purple' },
                    { user: 'Mike Chen', action: 'opened PR #235', time: '5 hours ago', color: 'green' },
                    { user: 'Emily Davis', action: 'reviewed PR #233', time: '6 hours ago', color: 'orange' },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b border-gray-700 last:border-0">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full bg-${activity.color}-500`}></div>
                        <p className="text-gray-300">
                          <span className="font-semibold">{activity.user}</span> {activity.action}
                        </p>
                      </div>
                      <span className="text-sm text-gray-500">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>
        </main>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowInviteModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 border border-gray-700"
          >
            <h2 className="text-2xl font-bold mb-4">Invite Team Member</h2>
            <p className="text-gray-400 mb-6">Send an invitation to join your workspace</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  placeholder="colleague@company.com"
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Role</label>
                <select className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500">
                  <option>Member</option>
                  <option>Admin</option>
                </select>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowInviteModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" className="flex-1">
                  Send Invite
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </DashboardAuth>
  );
}
