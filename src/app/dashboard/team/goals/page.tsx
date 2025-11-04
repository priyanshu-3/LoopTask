'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { LiquidGlassCard } from "@/components/ui/liquid-weather-glass";
import Button from '@/components/Button';
import DashboardAuth from '../../components/DashboardAuth';
import { 
  Target,
  Plus,
  TrendingUp,
  CheckCircle2,
  Circle,
  Calendar,
  Users,
  Flag,
  Edit,
  Trash2
} from 'lucide-react';

export default function GoalsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'quarterly',
    deadline: '',
    owner: 'Ayush Kumar',
    // team_id will be auto-created by the API if not provided
  });

  const handleCreateGoal = async () => {
    if (!formData.title) {
      alert('Please enter a goal title');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Goal created:', data);
        setShowCreateModal(false);
        setFormData({
          title: '',
          description: '',
          type: 'quarterly',
          deadline: '',
          owner: 'Ayush Kumar',
        });
        // Refresh the page to show the new goal
        window.location.reload();
      } else {
        const error = await response.json();
        console.error('Failed to create goal:', error);
        alert(`Failed to create goal: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating goal:', error);
      alert('Error creating goal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Mock goals data
  const goals = [
    {
      id: '1',
      title: 'Ship Q4 Features',
      description: 'Complete all planned features for Q4 release',
      type: 'quarterly',
      progress: 75,
      target: 100,
      current: 75,
      unit: '%',
      deadline: '2025-12-31',
      owner: 'Ayush Kumar',
      status: 'on-track',
      keyResults: [
        { title: 'Complete authentication system', progress: 100, status: 'completed' },
        { title: 'Build analytics dashboard', progress: 80, status: 'in-progress' },
        { title: 'Implement team features', progress: 60, status: 'in-progress' },
      ],
    },
    {
      id: '2',
      title: 'Improve Code Quality',
      description: 'Increase test coverage and reduce technical debt',
      type: 'ongoing',
      progress: 45,
      target: 80,
      current: 45,
      unit: '%',
      deadline: '2025-11-30',
      owner: 'Sarah Johnson',
      status: 'at-risk',
      keyResults: [
        { title: 'Achieve 80% test coverage', progress: 45, status: 'in-progress' },
        { title: 'Reduce code duplication by 30%', progress: 20, status: 'in-progress' },
        { title: 'Fix all critical bugs', progress: 70, status: 'in-progress' },
      ],
    },
    {
      id: '3',
      title: 'Team Growth',
      description: 'Expand team and improve collaboration',
      type: 'quarterly',
      progress: 90,
      target: 100,
      current: 9,
      unit: ' members',
      deadline: '2025-12-15',
      owner: 'Mike Chen',
      status: 'on-track',
      keyResults: [
        { title: 'Hire 3 new developers', progress: 100, status: 'completed' },
        { title: 'Onboard all new members', progress: 90, status: 'in-progress' },
        { title: 'Establish team rituals', progress: 80, status: 'in-progress' },
      ],
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return 'text-green-500 bg-green-500/10';
      case 'at-risk': return 'text-yellow-500 bg-yellow-500/10';
      case 'off-track': return 'text-red-500 bg-red-500/10';
      case 'completed': return 'text-blue-500 bg-blue-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
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
              className="mb-8 flex items-center justify-between"
            >
              <div>
                <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-green-400 to-blue-600 bg-clip-text text-transparent">
                  Team Goals & OKRs
                </h1>
                <p className="text-gray-400">Track objectives and key results</p>
              </div>
              
              <Button 
                variant="primary" 
                className="flex items-center space-x-2"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus className="w-5 h-5" />
                <span>Create Goal</span>
              </Button>
            </motion.div>

            {/* Goals Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[
                { label: 'Total Goals', value: goals.length, icon: Target, color: 'blue' },
                { label: 'On Track', value: goals.filter(g => g.status === 'on-track').length, icon: CheckCircle2, color: 'green' },
                { label: 'At Risk', value: goals.filter(g => g.status === 'at-risk').length, icon: Flag, color: 'yellow' },
                { label: 'Avg Progress', value: Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length) + '%', icon: TrendingUp, color: 'purple' },
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <LiquidGlassCard shadowIntensity="xs" borderRadius="16px" glowIntensity="sm" className="p-6 bg-white/5 hover:scale-105 transition-transform">
                      <div className={`w-12 h-12 rounded-xl bg-${stat.color}-500/10 flex items-center justify-center mb-4`}>
                        <Icon className={`w-6 h-6 text-${stat.color}-500`} />
                      </div>
                      <p className="text-3xl font-bold mb-1">{stat.value}</p>
                      <p className="text-sm text-gray-400">{stat.label}</p>
                    </LiquidGlassCard>
                  </motion.div>
                );
              })}
            </div>

            {/* Goals List */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="space-y-6"
            >
              {goals.map((goal, index) => (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <LiquidGlassCard shadowIntensity="xs" borderRadius="16px" glowIntensity="sm" className="p-6 bg-white/5">
                    {/* Goal Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-2xl font-bold">{goal.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(goal.status)}`}>
                            {goal.status.replace('-', ' ')}
                          </span>
                        </div>
                        <p className="text-gray-400 mb-4">{goal.description}</p>
                        
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4" />
                            <span>{goal.owner}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span>Due {new Date(goal.deadline).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Flag className="w-4 h-4" />
                            <span className="capitalize">{goal.type}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                          <Edit className="w-5 h-5 text-gray-400" />
                        </button>
                        <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                          <Trash2 className="w-5 h-5 text-red-400" />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Overall Progress</span>
                        <span className="text-sm font-bold">{goal.current}{goal.unit} / {goal.target}{goal.unit}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${goal.progress}%` }}
                          transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                          className={`h-full ${getProgressColor(goal.progress)} rounded-full`}
                        />
                      </div>
                    </div>

                    {/* Key Results */}
                    <div>
                      <h4 className="font-semibold mb-3">Key Results</h4>
                      <div className="space-y-3">
                        {goal.keyResults.map((kr, krIndex) => (
                          <div key={krIndex} className="flex items-center space-x-3">
                            {kr.status === 'completed' ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                            ) : (
                              <Circle className="w-5 h-5 text-gray-500 flex-shrink-0" />
                            )}
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className={`text-sm ${kr.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                                  {kr.title}
                                </span>
                                <span className="text-sm font-medium">{kr.progress}%</span>
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${kr.progress}%` }}
                                  transition={{ duration: 0.8, delay: 0.6 + index * 0.1 + krIndex * 0.05 }}
                                  className={`h-full ${kr.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'}`}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </LiquidGlassCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </main>
      </div>

      {/* Create Goal Modal */}
      {showCreateModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowCreateModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-800 rounded-2xl p-8 max-w-2xl w-full mx-4 border border-gray-700 max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-2xl font-bold mb-4">Create New Goal</h2>
            <p className="text-gray-400 mb-6">Set a new objective for your team</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Goal Title</label>
                <input
                  type="text"
                  placeholder="e.g., Ship Q4 Features"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  placeholder="Describe the goal..."
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Type</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="quarterly">Quarterly</option>
                    <option value="monthly">Monthly</option>
                    <option value="ongoing">Ongoing</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Deadline</label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Owner</label>
                <select 
                  value={formData.owner}
                  onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option>Ayush Kumar</option>
                  <option>Sarah Johnson</option>
                  <option>Mike Chen</option>
                  <option>Emily Davis</option>
                </select>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => setShowCreateModal(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  className="flex-1"
                  onClick={handleCreateGoal}
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Goal'}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </DashboardAuth>
  );
}
