'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { LiquidGlassCard } from "@/components/ui/liquid-weather-glass";
import Button from '@/components/Button';
import DashboardAuth from '../components/DashboardAuth';
import { 
  Workflow,
  Plus,
  Play,
  Pause,
  Edit,
  Trash2,
  Clock,
  Zap,
  GitBranch,
  Webhook,
  Mail,
  MessageSquare,
  FileText,
  Brain,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';

import { useAutomations } from '@/lib/hooks/useAutomations';
import { useToast } from '@/components/Toast';

export default function WorkflowsPage() {
  const {
    automations: workflows,
    loading,
    error,
    updateAutomation,
    deleteAutomation: deleteWorkflowAPI,
    executeAutomation,
  } = useAutomations();
  
  const { showToast } = useToast();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [executing, setExecuting] = useState<string | null>(null);

  const executeWorkflow = async (id: string) => {
    setExecuting(id);
    try {
      await executeAutomation(id);
      showToast({
        type: 'success',
        title: 'Workflow Executed',
        message: 'Your workflow has been executed successfully',
      });
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Execution Failed',
        message: error.message || 'Failed to execute workflow',
      });
    } finally {
      setExecuting(null);
    }
  };

  const toggleWorkflow = async (id: string, enabled: boolean) => {
    try {
      await updateAutomation(id, { enabled: !enabled });
      showToast({
        type: 'success',
        title: enabled ? 'Workflow Paused' : 'Workflow Activated',
        message: `Workflow has been ${enabled ? 'paused' : 'activated'}`,
      });
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: error.message || 'Failed to update workflow',
      });
    }
  };

  const deleteWorkflow = async (id: string) => {
    if (!confirm('Are you sure you want to delete this workflow?')) return;
    
    try {
      await deleteWorkflowAPI(id);
      showToast({
        type: 'success',
        title: 'Workflow Deleted',
        message: 'Workflow has been deleted successfully',
      });
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Delete Failed',
        message: error.message || 'Failed to delete workflow',
      });
    }
  };

  const getTriggerIcon = (type: string) => {
    switch (type) {
      case 'schedule': return Clock;
      case 'github_event': return GitBranch;
      case 'webhook': return Webhook;
      case 'slack_message': return MessageSquare;
      default: return Zap;
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'send_slack': return MessageSquare;
      case 'create_notion': return FileText;
      case 'send_email': return Mail;
      case 'webhook': return Webhook;
      case 'ai_summary': return Brain;
      default: return Zap;
    }
  };

  if (loading) {
    return (
      <DashboardAuth>
        <div className="p-4 md:p-8">
          <main className="flex-1 p-8 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </main>
        </div>
      </DashboardAuth>
    );
  }

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
                <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
                  Workflow Builder
                </h1>
                <p className="text-gray-400">Automate your tasks with custom workflows</p>
              </div>
              
              <Button 
                variant="primary" 
                className="flex items-center space-x-2"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus className="w-5 h-5" />
                <span>Create Workflow</span>
              </Button>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[
                { 
                  label: 'Total Workflows', 
                  value: workflows.length, 
                  icon: Workflow, 
                  color: 'blue' 
                },
                { 
                  label: 'Active', 
                  value: workflows.filter(w => w.enabled).length, 
                  icon: CheckCircle2, 
                  color: 'green' 
                },
                { 
                  label: 'Total Runs', 
                  value: workflows.reduce((sum, w) => sum + (w.total_runs || 0), 0), 
                  icon: Play, 
                  color: 'purple' 
                },
                { 
                  label: 'Success Rate', 
                  value: workflows.length > 0 
                    ? Math.round((workflows.reduce((sum, w) => sum + (w.success_count || 0), 0) / 
                        Math.max(workflows.reduce((sum, w) => sum + (w.total_runs || 0), 0), 1)) * 100) + '%'
                    : '0%', 
                  icon: Zap, 
                  color: 'orange' 
                },
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

            {/* Workflows List */}
            {workflows.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16"
              >
                <Workflow className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <h3 className="text-xl font-semibold mb-2">No workflows yet</h3>
                <p className="text-gray-400 mb-6">Create your first workflow to automate tasks</p>
                <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                  <Plus className="w-5 h-5 mr-2" />
                  Create Workflow
                </Button>
              </motion.div>
            ) : (
              <div className="space-y-6">
                {workflows.map((workflow, index) => {
                  const TriggerIcon = getTriggerIcon(workflow.trigger_type);
                  
                  return (
                    <motion.div
                      key={workflow.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.05 }}
                    >
                      <LiquidGlassCard shadowIntensity="xs" borderRadius="16px" glowIntensity="sm" className="p-6 bg-white/5">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <div className={`w-10 h-10 rounded-lg ${
                                workflow.enabled ? 'bg-green-500/10' : 'bg-gray-700'
                              } flex items-center justify-center`}>
                                <TriggerIcon className={`w-5 h-5 ${
                                  workflow.enabled ? 'text-green-500' : 'text-gray-500'
                                }`} />
                              </div>
                              <div>
                                <h3 className="text-xl font-bold">{workflow.name}</h3>
                                <p className="text-sm text-gray-400">{workflow.description}</p>
                              </div>
                            </div>

                            {/* Workflow Flow */}
                            <div className="flex items-center space-x-2 mb-4 overflow-x-auto pb-2">
                              <div className="px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full text-xs font-medium whitespace-nowrap">
                                {workflow.trigger_type.replace('_', ' ')}
                              </div>
                              <div className="text-gray-600">→</div>
                              {workflow.actions?.map((action: any, idx: number) => {
                                const ActionIcon = getActionIcon(action.type);
                                return (
                                  <div key={idx} className="flex items-center space-x-2">
                                    <div className="px-3 py-1 bg-purple-500/10 text-purple-500 rounded-full text-xs font-medium flex items-center space-x-1 whitespace-nowrap">
                                      <ActionIcon className="w-3 h-3" />
                                      <span>{action.type.replace('_', ' ')}</span>
                                    </div>
                                    {idx < workflow.actions.length - 1 && (
                                      <div className="text-gray-600">→</div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            {/* Stats */}
                            <div className="flex items-center space-x-6 text-sm text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Play className="w-4 h-4" />
                                <span>{workflow.total_runs || 0} runs</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                <span>{workflow.success_count || 0} success</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <XCircle className="w-4 h-4 text-red-500" />
                                <span>{workflow.failure_count || 0} failed</span>
                              </div>
                              {workflow.last_run_at && (
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-4 h-4" />
                                  <span>Last run: {new Date(workflow.last_run_at).toLocaleString()}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => executeWorkflow(workflow.id)}
                              disabled={!workflow.enabled || executing === workflow.id}
                              className="p-2 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Run now"
                            >
                              {executing === workflow.id ? (
                                <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                              ) : (
                                <Play className="w-5 h-5 text-blue-400" />
                              )}
                            </button>
                            <button
                              onClick={() => toggleWorkflow(workflow.id, workflow.enabled)}
                              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                              title={workflow.enabled ? 'Pause' : 'Resume'}
                            >
                              {workflow.enabled ? (
                                <Pause className="w-5 h-5 text-yellow-400" />
                              ) : (
                                <Play className="w-5 h-5 text-green-400" />
                              )}
                            </button>
                            <button
                              onClick={() => deleteWorkflow(workflow.id)}
                              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-5 h-5 text-red-400" />
                            </button>
                          </div>
                        </div>
                      </LiquidGlassCard>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Create Workflow Modal - Will be implemented in next component */}
      {showCreateModal && (
        <CreateWorkflowModal 
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            // Workflows will be refetched automatically by the hook
          }}
        />
      )}
    </DashboardAuth>
  );
}

// Placeholder for Create Workflow Modal
function CreateWorkflowModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-800 rounded-2xl p-8 max-w-2xl w-full border border-gray-700 max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-2xl font-bold mb-4">Create Workflow</h2>
        <p className="text-gray-400 mb-6">Workflow builder coming soon! Use the API to create workflows for now.</p>
        
        <div className="flex space-x-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Close
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
