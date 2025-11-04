'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  BarChart3,
  Brain,
  Activity,
  Users,
  Trophy,
  Target,
  Zap,
  Workflow,
  Settings,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Sparkles,
  GitBranch,
  Calendar,
  Bell,
  Search,
  Command,
  Github,
  MessageSquare,
  FileText,
  CalendarDays
} from 'lucide-react';
import { useNotifications } from '@/lib/hooks/useNotifications';

interface NavItem {
  name: string;
  href: string;
  icon: any;
  badge?: string;
  notificationCount?: number;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  {
    name: 'Overview',
    href: '/dashboard',
    icon: Home,
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
    badge: 'New',
  },
  {
    name: 'AI Insights',
    href: '/dashboard/insights',
    icon: Brain,
    badge: 'AI',
  },
  {
    name: 'Activity',
    href: '/dashboard/activity',
    icon: Activity,
  },
  {
    name: 'Integrations',
    href: '/dashboard/integrations',
    icon: Sparkles,
  },
  {
    name: 'Team',
    href: '/dashboard/team',
    icon: Users,
    children: [
      { name: 'Overview', href: '/dashboard/team', icon: Users },
      { name: 'Leaderboard', href: '/dashboard/team/leaderboard', icon: Trophy },
      { name: 'Goals & OKRs', href: '/dashboard/team/goals', icon: Target },
    ],
  },
  {
    name: 'Workflows',
    href: '/dashboard/workflows',
    icon: Workflow,
  },
  {
    name: 'Automations',
    href: '/dashboard/automations',
    icon: Zap,
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
];

export default function ProfessionalSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>(['Team']);
  const { unreadCount } = useNotifications();
  const [integrations, setIntegrations] = useState<any>(null);

  // Fetch integrations status
  useEffect(() => {
    const fetchIntegrations = async () => {
      try {
        const res = await fetch('/api/integrations');
        if (res.ok) {
          const data = await res.json();
          setIntegrations(data);
        }
      } catch (err) {
        console.error('Error fetching integrations:', err);
      }
    };
    fetchIntegrations();
  }, []);

  const toggleExpand = (itemName: string) => {
    setExpandedItems(prev =>
      prev.includes(itemName)
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const SidebarContent = () => {
    // Calculate connected integrations count
    const connectedCount = integrations 
      ? [
          integrations.github_connected,
          integrations.notion_connected,
          integrations.slack_connected,
          integrations.calendar_connected,
        ].filter(Boolean).length
      : 0;

    // Add notification count to Integrations item
    const navigationWithNotifications = navigation.map(item => {
      if (item.name === 'Integrations') {
        return { 
          ...item, 
          notificationCount: unreadCount,
          badge: connectedCount > 0 ? `${connectedCount}` : undefined
        };
      }
      return item;
    });

    return (
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <Link href="/dashboard" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                  LoopTask
                </h1>
                <p className="text-xs text-gray-500">Developer Platform</p>
              </div>
            )}
          </Link>
        </div>

        {/* Search */}
        {!collapsed && (
          <div className="px-4 py-3">
            <button className="w-full flex items-center space-x-2 px-3 py-2 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg transition-colors text-sm text-gray-400 group">
              <Search className="w-4 h-4" />
              <span className="flex-1 text-left">Search...</span>
              <kbd className="px-1.5 py-0.5 bg-gray-900 border border-gray-700 rounded text-xs">
                <Command className="w-3 h-3 inline" />K
              </kbd>
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigationWithNotifications.map((item) => (
            <NavItem
              key={item.name}
              item={item}
              collapsed={collapsed}
              isActive={isActive}
              isExpanded={expandedItems.includes(item.name)}
              onToggle={() => toggleExpand(item.name)}
            />
          ))}
        </nav>

        {/* Quick Actions */}
        {!collapsed && (
          <div className="p-4 border-t border-gray-800 space-y-2">
            <button className="w-full flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg transition-all text-sm font-medium text-white shadow-lg shadow-blue-500/20">
              <Zap className="w-4 h-4" />
              <span>New Workflow</span>
            </button>
            <button className="w-full flex items-center space-x-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm text-gray-400">
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
              <span className="ml-auto w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                3
              </span>
            </button>
          </div>
        )}

        {/* Integration Status */}
        {!collapsed && integrations && (
          <div className="p-4 border-t border-gray-800">
            <div className="text-xs text-gray-500 mb-3 font-medium">Connected Integrations</div>
            <div className="space-y-2">
              {integrations.github_connected && (
                <div className="flex items-center space-x-2 text-sm">
                  <Github className="w-4 h-4 text-purple-400" />
                  <span className="text-gray-400 flex-1">GitHub</span>
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                </div>
              )}
              {integrations.notion_connected && (
                <div className="flex items-center space-x-2 text-sm">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400 flex-1">Notion</span>
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                </div>
              )}
              {integrations.slack_connected && (
                <div className="flex items-center space-x-2 text-sm">
                  <MessageSquare className="w-4 h-4 text-pink-400" />
                  <span className="text-gray-400 flex-1">Slack</span>
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                </div>
              )}
              {integrations.calendar_connected && (
                <div className="flex items-center space-x-2 text-sm">
                  <CalendarDays className="w-4 h-4 text-blue-400" />
                  <span className="text-gray-400 flex-1">Calendar</span>
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                </div>
              )}
              {!integrations.github_connected && !integrations.notion_connected && 
               !integrations.slack_connected && !integrations.calendar_connected && (
                <p className="text-xs text-gray-500">No integrations connected</p>
              )}
            </div>
          </div>
        )}

        {/* Collapse Toggle */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm text-gray-400"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-900 border border-gray-800 rounded-lg"
      >
        <Menu className="w-6 h-6 text-white" />
      </button>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-gray-950 border-r border-gray-800 z-50"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden lg:block fixed left-0 top-0 bottom-0 bg-gray-950 border-r border-gray-800 z-30"
      >
        <SidebarContent />
      </motion.aside>

      {/* Spacer for content */}
      <div className={`hidden lg:block ${collapsed ? 'w-20' : 'w-[280px]'} flex-shrink-0 transition-all duration-300`} />
    </>
  );
}

function NavItem({
  item,
  collapsed,
  isActive,
  isExpanded,
  onToggle,
  depth = 0,
}: {
  item: NavItem;
  collapsed: boolean;
  isActive: (href: string) => boolean;
  isExpanded: boolean;
  onToggle: () => void;
  depth?: number;
}) {
  const Icon = item.icon;
  const hasChildren = item.children && item.children.length > 0;
  const active = isActive(item.href);

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={onToggle}
          className={`
            w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all group
            ${active ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}
          `}
        >
          <div className="flex items-center space-x-3">
            <Icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && (
              <>
                <span className="font-medium">{item.name}</span>
                {item.badge && (
                  <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full font-medium">
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </div>
          {!collapsed && (
            <ChevronDown
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            />
          )}
        </button>

        {/* Children */}
        <AnimatePresence>
          {isExpanded && !collapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="ml-4 mt-1 space-y-1 overflow-hidden"
            >
              {item.children?.map((child) => (
                <Link
                  key={child.href}
                  href={child.href}
                  className={`
                    flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-all
                    ${isActive(child.href)
                      ? 'bg-blue-600/50 text-white'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }
                  `}
                >
                  <child.icon className="w-4 h-4" />
                  <span>{child.name}</span>
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      className={`
        flex items-center space-x-3 px-3 py-2 rounded-lg transition-all group relative
        ${active
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
        }
      `}
    >
      {/* Active Indicator */}
      {active && (
        <motion.div
          layoutId="activeIndicator"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-400 rounded-r-full"
        />
      )}

      <Icon className="w-5 h-5 flex-shrink-0" />
      {!collapsed && (
        <>
          <span className="font-medium flex-1">{item.name}</span>
          {item.badge && (
            <span className={`
              px-1.5 py-0.5 text-xs rounded-full font-medium
              ${active ? 'bg-white/20 text-white' : 'bg-blue-500/20 text-blue-400'}
            `}>
              {item.badge}
            </span>
          )}
          {item.notificationCount !== undefined && item.notificationCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              {item.notificationCount > 9 ? '9+' : item.notificationCount}
            </span>
          )}
        </>
      )}
      
      {/* Notification badge for collapsed state */}
      {collapsed && item.notificationCount !== undefined && item.notificationCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
          {item.notificationCount > 9 ? '9' : item.notificationCount}
        </span>
      )}

      {/* Tooltip for collapsed state */}
      {collapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 border border-gray-800 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
          {item.name}
        </div>
      )}
    </Link>
  );
}
