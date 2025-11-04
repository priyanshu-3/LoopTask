'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { LiquidGlassCard } from "@/components/ui/liquid-weather-glass";
import Button from '@/components/Button';
import DashboardAuth from '../components/DashboardAuth';
import { 
  Zap, 
  Plus,
  Play,
  Pause,
  Settings,
  Trash2,
  Clock,
  GitCommit,
  MessageSquare,
  FileText,
  Calendar,
  CheckCircle
} from 'lucide-react';

export default function AutomationsPage() {
  const [automations, setAutomations] = useState([
    {
      id: '1',
      name: 'Daily Standup Summary',
      description: 'Generate and post AI summary to Slack every morning at 9 AM',
      enabled: true,
      trigger: 'Schedule',
      schedule: 'Every day at 9:00 AM',
      actions: ['Generate AI Summary', 'Post to Slack'],
      lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      runs: 47,
    },
    {
      id: '2',
      name: 'PR Review Reminder',
      description: 'Send reminder when PR is open for more than 24 hours without review',
      enabled: true,
      trigger: 'GitHub Event',
      schedule: 'When PR is open for 24h',
      actions: ['Check PR Status', 'Send Slack Notification'],
      lastRun: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      runs: 23,
    },
    {
      id: '3',
      name: 'Commit to Notion',
      description: 'Create Notion page for every commit pushed to main branch',
      enabled: false,
      trigger: 'GitHub Event',
      schedule: 'On push to main',
      actions: ['Fetch Commit Details', 'Create Notion Page'],
      lastRun: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      runs: 156,
    },
    {
      id: '4',
      name: 'Weekly Report',
      description: 'Generate comprehensive weekly report and email to team',
      enabled: true,
      trigger: 'Schedule',
      schedule: 'Every Friday at 5:00 PM',
      actions: ['Collect Weekly Data', 'Generate Report', 'Send Email'],
      lastRun: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
      runs: 12,
    },
  ]);

  const toggleAutomation = (id: string) => {
    setAutomations(automations.map(auto => 
      auto.id === id ? { ...auto, enabled: !auto.enabled } : auto
    ));
  };

  const triggerIcons = {
    'Schedule': Clock,
    'GitHub Event': GitCommit,
    'Slack Event': MessageSquare,
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
                <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                  Automations
                </h1>
                <p className="text-gray-400">Set up workflows to automate your tasks</p>
              </div>
              
              <Button variant="primary" className="flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Create Automation</span>
              </Button>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[
                { label: 'Total Automations', value: automations.length, textColor: 'text-blue-400' },
                { label: 'Active', value: automations.filter(a => a.enabled).length, textColor: 'text-green-400' },
                { label: 'Total Runs', value: automations.reduce((sum, a) => sum + a.runs, 0), textColor: 'text-purple-400' },
                { label: 'Success Rate', value: '98.5%', textColor: 'text-orange-400' },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <LiquidGlassCard shadowIntensity="xs" borderRadius="16px" glowIntensity="sm" className="p-6 bg-white/5">
                    <p className={`text-3xl font-bold ${stat.textColor} mb-1`}>{stat.value}</p>
                    <p className="text-sm text-gray-400">{stat.label}</p>
                  </LiquidGlassCard>
                </motion.div>
              ))}
            </div>

            {/* Automations List */}
            <div className="space-y-4">
              {automations.map((automation, index) => {
                const TriggerIcon = triggerIcons[automation.trigger as keyof typeof triggerIcons] || Zap;

                return (
                  <motion.div
                    key={automation.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <LiquidGlassCard shadowIntensity="xs" borderRadius="16px" glowIntensity="sm" className="p-6 bg-white/5 group">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          {/* Icon */}
                          <div className={`w-12 h-12 rounded-xl ${
                            automation.enabled ? 'bg-blue-500/10' : 'bg-gray-700/50'
                          } flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                            <Zap className={`w-6 h-6 ${
                              automation.enabled ? 'text-blue-500' : 'text-gray-500'
                            }`} />
                          </div>

                          {/* Content */}
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-xl font-semibold text-gray-200">
                                {automation.name}
                              </h3>
                              {automation.enabled && (
                                <span className="px-2 py-1 bg-green-500/10 text-green-500 text-xs rounded-full flex items-center space-x-1">
                                  <CheckCircle className="w-3 h-3" />
                                  <span>Active</span>
                                </span>
                              )}
                            </div>
                            
                            <p className="text-gray-400 mb-4">{automation.description}</p>
                            
                            {/* Trigger and Schedule */}
                            <div className="flex items-center space-x-6 mb-4">
                              <div className="flex items-center space-x-2 text-sm">
                                <TriggerIcon className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-400">{automation.trigger}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm">
                                <Clock className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-400">{automation.schedule}</span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-wrap gap-2 mb-4">
                              {automation.actions.map((action, i) => (
                                <span
                                  key={i}
                                  className="px-3 py-1 bg-gray-800 text-gray-300 text-xs rounded-full"
                                >
                                  {action}
                                </span>
                              ))}
                            </div>

                            {/* Stats */}
                            <div className="flex items-center space-x-6 text-sm text-gray-500">
                              <span>Last run: {new Date(automation.lastRun).toLocaleString()}</span>
                              <span>•</span>
                              <span>{automation.runs} total runs</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => toggleAutomation(automation.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              automation.enabled
                                ? 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20'
                                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                            }`}
                            title={automation.enabled ? 'Pause' : 'Play'}
                          >
                            {automation.enabled ? (
                              <Pause className="w-5 h-5" />
                            ) : (
                              <Play className="w-5 h-5" />
                            )}
                          </button>
                          
                          <button
                            className="p-2 rounded-lg bg-gray-700 text-gray-400 hover:bg-gray-600 transition-colors"
                            title="Settings"
                          >
                            <Settings className="w-5 h-5" />
                          </button>
                          
                          <button
                            className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </LiquidGlassCard>
                  </motion.div>
                );
              })}
            </div>

            {/* Create New Automation CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8"
            >
              <LiquidGlassCard shadowIntensity="xs" borderRadius="16px" glowIntensity="sm" className="p-6 bg-white/5 text-center py-12 border-2 border-dashed border-gray-700 hover:border-blue-500 transition-colors cursor-pointer group">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Plus className="w-8 h-8 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Create New Automation</h3>
                    <p className="text-gray-400">Set up a custom workflow to automate your tasks</p>
                  </div>
                </div>
              </LiquidGlassCard>
            </motion.div>
          </div>
        </main>
      </div>
    </DashboardAuth>
  );
}
