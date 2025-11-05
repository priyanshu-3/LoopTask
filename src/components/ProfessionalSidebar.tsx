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
  const [collapsed, setCollapsed] = useState(() => {
    // Initialize based on screen size on mount
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1280;
    }
    return false;
  });
  const [expandedItems, setExpandedItems] = useState<string[]>(['Team']);
  const [userToggled, setUserToggled] = useState(false);
  const { unreadCount } = useNotifications();
  const [integrations, setIntegrations] = useState<any>(null);

  // Auto-collapse sidebar on smaller screens (only if user hasn't manually toggled)
  useEffect(() => {
    let resizeTimer: NodeJS.Timeout;
    
    const checkScreenSize = () => {
      // Clear any pending resize checks
      clearTimeout(resizeTimer);
      
      // Debounce resize events
      resizeTimer = setTimeout(() => {
        const width = window.innerWidth;
        const isSmallScreen = width < 1280;
        
        setCollapsed((prevCollapsed) => {
          // If user hasn't manually toggled, auto-collapse/expand based on screen size
          if (!userToggled) {
            return isSmallScreen;
          } else {
            // If user has manually toggled, only force collapse on mobile (< 1024px)
            // On larger screens, respect user's manual preference
            if (width < 1024) {
              return true;
            } else if (width >= 1280 && prevCollapsed) {
              // Allow expansion on large screens even if user toggled
              // This provides better UX when resizing from small to large
              setUserToggled(false);
              return false;
            }
            return prevCollapsed;
          }
        });
      }, 150);
    };

    // Listen for resize events
    window.addEventListener('resize', checkScreenSize);
    
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', checkScreenSize);
    };
  }, [userToggled]);

  // Fetch integrations status with caching
  useEffect(() => {
    const fetchIntegrations = async () => {
      try {
        // Check cache first
        const cacheKey = '/api/integrations';
        const cached = typeof window !== 'undefined' && (window as any).__integrationsCache;
        
        if (cached && Date.now() - cached.timestamp < 30000) {
          setIntegrations(cached.data);
          return;
        }
        
        const res = await fetch('/api/integrations');
        if (res.ok) {
          const data = await res.json();
          setIntegrations(data);
          
          // Cache the result
          if (typeof window !== 'undefined') {
            (window as any).__integrationsCache = {
              data,
              timestamp: Date.now(),
            };
          }
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
        {/* Search */}
        {!collapsed && (
          <div className="px-4 pt-4 pb-2">
            <button 
              onClick={() => {
                // Trigger Command Palette via custom event
                window.dispatchEvent(new CustomEvent('openCommandPalette'));
              }}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                  e.preventDefault();
                  window.dispatchEvent(new CustomEvent('openCommandPalette'));
                }
              }}
              className="w-full flex items-center space-x-2 px-3 py-2 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg transition-colors text-sm text-gray-400 group"
            >
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
            onClick={() => {
              setUserToggled(true);
              setCollapsed(!collapsed);
            }}
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
      {/* Desktop Sidebar - Always visible */}
      <motion.aside
        animate={{ width: collapsed ? 80 : 256 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed left-0 top-0 bottom-0 bg-gray-950 border-r border-gray-800 z-30 overflow-y-auto"
      >
        <SidebarContent />
      </motion.aside>
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
