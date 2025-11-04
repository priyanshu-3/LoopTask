'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { LiquidGlassCard } from "@/components/ui/liquid-weather-glass";
import DashboardAuth from '../components/DashboardAuth';
import { 
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  Target,
  Clock,
  Zap,
  Heart,
  Sparkles,
  BarChart3,
  Calendar,
  Minus
} from 'lucide-react';

export default function InsightsPage() {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch insights or use mock data
    setTimeout(() => {
      setInsights({
        productivity: {
          score: 87,
          trend: 'up',
          change: 12,
          message: "Your productivity is 12% higher than last week!",
        },
        burnout: {
          risk: 'low',
          score: 25,
          message: "You're maintaining a healthy work-life balance.",
          recommendations: [
            'Continue taking regular breaks',
            'Maintain your current pace',
            'Keep up the good work!',
          ],
        },
        patterns: [
          {
            title: 'Peak Performance Hours',
            description: "You're most productive between 9 AM - 12 PM",
            icon: Clock,
            color: 'blue',
            action: 'Schedule important tasks during these hours',
          },
          {
            title: 'Code Review Champion',
            description: "You've reviewed 23% more PRs this week",
            icon: TrendingUp,
            color: 'green',
            action: 'Great collaboration! Keep it up',
          },
          {
            title: 'Meeting Overload',
            description: '40% of your time spent in meetings',
            icon: AlertTriangle,
            color: 'yellow',
            action: 'Consider declining non-essential meetings',
          },
        ],
        suggestions: [
          {
            title: 'Optimize Your Workflow',
            description: 'Automate your daily standup summary to save 15 minutes per day',
            priority: 'high',
            impact: 'time-saving',
          },
          {
            title: 'Focus Time Blocks',
            description: 'Block 2-hour focus sessions for deep work on complex features',
            priority: 'medium',
            impact: 'productivity',
          },
          {
            title: 'Knowledge Sharing',
            description: 'Document your recent architecture decisions in Notion',
            priority: 'low',
            impact: 'team-growth',
          },
        ],
        predictions: {
          thisWeek: {
            commits: 45,
            prs: 8,
            reviews: 12,
            confidence: 85,
          },
          nextSprint: {
            velocity: 'high',
            blockers: 2,
            completion: 92,
          },
        },
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <DashboardAuth>
        <div className="p-4 md:p-8">
          <main className="max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Brain className="w-16 h-16 mx-auto mb-4 text-purple-500 animate-pulse" />
              <p className="text-gray-400">Analyzing your data with AI...</p>
            </div>
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
              className="mb-8"
            >
              <div className="flex items-center space-x-3 mb-2">
                <Brain className="w-10 h-10 text-purple-500" />
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 bg-clip-text text-transparent">
                  AI Insights
                </h1>
              </div>
              <p className="text-gray-400">Personalized recommendations powered by AI</p>
            </motion.div>

            {/* Productivity & Burnout Overview */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Productivity Score */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <LiquidGlassCard shadowIntensity="xs" borderRadius="16px" glowIntensity="sm" className="p-6 bg-white/5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/20 to-transparent rounded-full blur-3xl" />
                  
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold">Productivity Score</h3>
                      <TrendingUp className="w-6 h-6 text-green-500" />
                    </div>
                    
                    <div className="flex items-end space-x-2 mb-2">
                      <span className="text-5xl font-bold text-green-500">
                        {insights.productivity.score}
                      </span>
                      <span className="text-2xl text-gray-500 mb-2">/100</span>
                    </div>
                    
                    <p className="text-gray-400 mb-4">{insights.productivity.message}</p>
                    
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full font-medium">
                        +{insights.productivity.change}% vs last week
                      </div>
                    </div>
                  </div>
                </LiquidGlassCard>
              </motion.div>

              {/* Burnout Risk */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <LiquidGlassCard shadowIntensity="xs" borderRadius="16px" glowIntensity="sm" className="p-6 bg-white/5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-3xl" />
                  
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold">Burnout Risk</h3>
                      <Heart className="w-6 h-6 text-blue-500" />
                    </div>
                    
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="flex-1 bg-gray-700 rounded-full h-3 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${insights.burnout.score}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="h-full bg-gradient-to-r from-green-500 to-blue-500"
                        />
                      </div>
                      <span className="text-2xl font-bold text-blue-500">
                        {insights.burnout.risk.toUpperCase()}
                      </span>
                    </div>
                    
                    <p className="text-gray-400 mb-4">{insights.burnout.message}</p>
                    
                    <div className="space-y-2">
                      {insights.burnout.recommendations.map((rec: string, idx: number) => (
                        <div key={idx} className="flex items-center space-x-2 text-sm text-gray-500">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </LiquidGlassCard>
              </motion.div>
            </div>

            {/* Patterns Detected */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
                <Sparkles className="w-6 h-6 text-yellow-500" />
                <span>Patterns Detected</span>
              </h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                {insights.patterns.map((pattern: any, index: number) => {
                  const Icon = pattern.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                    >
                      <LiquidGlassCard shadowIntensity="xs" borderRadius="16px" glowIntensity="sm" className="p-6 bg-white/5 h-full">
                        <div className={`w-12 h-12 rounded-xl bg-${pattern.color}-500/10 flex items-center justify-center mb-4`}>
                          <Icon className={`w-6 h-6 text-${pattern.color}-500`} />
                        </div>
                        <h3 className="font-bold mb-2">{pattern.title}</h3>
                        <p className="text-sm text-gray-400 mb-3">{pattern.description}</p>
                        <div className={`text-xs px-3 py-1 bg-${pattern.color}-500/10 text-${pattern.color}-500 rounded-full inline-block`}>
                          {pattern.action}
                        </div>
                      </LiquidGlassCard>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* AI Suggestions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
                <Lightbulb className="w-6 h-6 text-yellow-500" />
                <span>Personalized Suggestions</span>
              </h2>
              
              <div className="space-y-4">
                {insights.suggestions.map((suggestion: any, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                  >
                    <LiquidGlassCard shadowIntensity="xs" borderRadius="16px" glowIntensity="sm" className="p-6 bg-white/5">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-bold text-lg">{suggestion.title}</h3>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              suggestion.priority === 'high' 
                                ? 'bg-red-500/10 text-red-500'
                                : suggestion.priority === 'medium'
                                ? 'bg-yellow-500/10 text-yellow-500'
                                : 'bg-blue-500/10 text-blue-500'
                            }`}>
                              {suggestion.priority} priority
                            </span>
                          </div>
                          <p className="text-gray-400 mb-3">{suggestion.description}</p>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <Target className="w-4 h-4" />
                            <span>Impact: {suggestion.impact.replace('-', ' ')}</span>
                          </div>
                        </div>
                      </div>
                    </LiquidGlassCard>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Predictions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
                <BarChart3 className="w-6 h-6 text-purple-500" />
                <span>AI Predictions</span>
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <LiquidGlassCard shadowIntensity="xs" borderRadius="16px" glowIntensity="sm" className="p-6 bg-white/5">
                  <h3 className="font-bold mb-4 flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    <span>This Week Forecast</span>
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Expected Commits</span>
                      <span className="font-bold text-blue-500">{insights.predictions.thisWeek.commits}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Expected PRs</span>
                      <span className="font-bold text-purple-500">{insights.predictions.thisWeek.prs}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Expected Reviews</span>
                      <span className="font-bold text-green-500">{insights.predictions.thisWeek.reviews}</span>
                    </div>
                    <div className="pt-3 border-t border-gray-700">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Confidence</span>
                        <span className="font-bold">{insights.predictions.thisWeek.confidence}%</span>
                      </div>
                    </div>
                  </div>
                </LiquidGlassCard>

                <LiquidGlassCard shadowIntensity="xs" borderRadius="16px" glowIntensity="sm" className="p-6 bg-white/5">
                  <h3 className="font-bold mb-4 flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-orange-500" />
                    <span>Next Sprint Outlook</span>
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Velocity</span>
                      <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-sm font-medium">
                        {insights.predictions.nextSprint.velocity.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Potential Blockers</span>
                      <span className="font-bold text-yellow-500">{insights.predictions.nextSprint.blockers}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Completion Rate</span>
                      <span className="font-bold text-green-500">{insights.predictions.nextSprint.completion}%</span>
                    </div>
                  </div>
                </LiquidGlassCard>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </DashboardAuth>
  );
}
