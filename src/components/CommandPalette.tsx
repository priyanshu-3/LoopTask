'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Search,
  Home,
  BarChart3,
  Activity,
  Users,
  Zap,
  Settings,
  Brain,
  Workflow,
  Target,
  Trophy,
  Command,
  ArrowRight
} from 'lucide-react';

interface Command {
  id: string;
  title: string;
  subtitle?: string;
  icon: any;
  action: () => void;
  category: string;
  keywords: string[];
}

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const router = useRouter();

  const commands: Command[] = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      subtitle: 'Go to overview',
      icon: Home,
      action: () => router.push('/dashboard'),
      category: 'Navigation',
      keywords: ['home', 'overview', 'main'],
    },
    {
      id: 'analytics',
      title: 'Analytics',
      subtitle: 'View analytics dashboard',
      icon: BarChart3,
      action: () => router.push('/dashboard/analytics'),
      category: 'Navigation',
      keywords: ['charts', 'stats', 'metrics'],
    },
    {
      id: 'insights',
      title: 'AI Insights',
      subtitle: 'View AI-powered insights',
      icon: Brain,
      action: () => router.push('/dashboard/insights'),
      category: 'Navigation',
      keywords: ['ai', 'intelligence', 'predictions'],
    },
    {
      id: 'workflows',
      title: 'Workflows',
      subtitle: 'Manage automations',
      icon: Workflow,
      action: () => router.push('/dashboard/workflows'),
      category: 'Navigation',
      keywords: ['automation', 'triggers', 'actions'],
    },
    {
      id: 'team',
      title: 'Team',
      subtitle: 'View team workspace',
      icon: Users,
      action: () => router.push('/dashboard/team'),
      category: 'Navigation',
      keywords: ['members', 'collaboration'],
    },
    {
      id: 'leaderboard',
      title: 'Leaderboard',
      subtitle: 'View team rankings',
      icon: Trophy,
      action: () => router.push('/dashboard/team/leaderboard'),
      category: 'Navigation',
      keywords: ['rankings', 'competition', 'scores'],
    },
    {
      id: 'goals',
      title: 'Goals & OKRs',
      subtitle: 'Track objectives',
      icon: Target,
      action: () => router.push('/dashboard/team/goals'),
      category: 'Navigation',
      keywords: ['objectives', 'key results', 'targets'],
    },
    {
      id: 'activity',
      title: 'Activity',
      subtitle: 'View recent activity',
      icon: Activity,
      action: () => router.push('/dashboard/activity'),
      category: 'Navigation',
      keywords: ['feed', 'recent', 'history'],
    },
    {
      id: 'settings',
      title: 'Settings',
      subtitle: 'Configure preferences',
      icon: Settings,
      action: () => router.push('/dashboard/settings'),
      category: 'Navigation',
      keywords: ['preferences', 'config', 'profile'],
    },
  ];

  const filteredCommands = commands.filter(cmd => {
    const searchLower = search.toLowerCase();
    return (
      cmd.title.toLowerCase().includes(searchLower) ||
      cmd.subtitle?.toLowerCase().includes(searchLower) ||
      cmd.keywords.some(k => k.includes(searchLower))
    );
  });

  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, Command[]>);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setIsOpen(prev => !prev);
    }
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    const handleOpenPalette = () => {
      setIsOpen(true);
    };
    window.addEventListener('openCommandPalette', handleOpenPalette);
    return () => window.removeEventListener('openCommandPalette', handleOpenPalette);
  }, []);

  const executeCommand = (cmd: Command) => {
    cmd.action();
    setIsOpen(false);
    setSearch('');
  };

  return (
    <>
      {/* Trigger Button - Hidden (use sidebar search or ⌘K keyboard shortcut) */}
      {/* Command Palette Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Palette */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 px-4"
            >
              <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden">
                {/* Search Input */}
                <div className="flex items-center px-4 py-3 border-b border-gray-800">
                  <Search className="w-5 h-5 text-gray-500 mr-3" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Type a command or search..."
                    className="flex-1 bg-transparent outline-none text-white placeholder-gray-500"
                    autoFocus
                  />
                  <kbd className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs text-gray-400">
                    ESC
                  </kbd>
                </div>

                {/* Commands List */}
                <div className="max-h-96 overflow-y-auto">
                  {Object.entries(groupedCommands).map(([category, cmds]) => (
                    <div key={category} className="py-2">
                      <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {category}
                      </div>
                      {cmds.map((cmd, index) => {
                        const Icon = cmd.icon;
                        return (
                          <motion.button
                            key={cmd.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.02 }}
                            onClick={() => executeCommand(cmd)}
                            className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-800 transition-colors group"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                                <Icon className="w-4 h-4 text-blue-500" />
                              </div>
                              <div className="text-left">
                                <div className="text-sm font-medium text-white">
                                  {cmd.title}
                                </div>
                                {cmd.subtitle && (
                                  <div className="text-xs text-gray-500">
                                    {cmd.subtitle}
                                  </div>
                                )}
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors" />
                          </motion.button>
                        );
                      })}
                    </div>
                  ))}

                  {filteredCommands.length === 0 && (
                    <div className="px-4 py-8 text-center text-gray-500">
                      No commands found
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-4 py-2 border-t border-gray-800 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center space-x-1">
                      <kbd className="px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded">↑</kbd>
                      <kbd className="px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded">↓</kbd>
                      <span>to navigate</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <kbd className="px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded">↵</kbd>
                      <span>to select</span>
                    </span>
                  </div>
                  <span className="flex items-center space-x-1">
                    <kbd className="px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded">ESC</kbd>
                    <span>to close</span>
                  </span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
