'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Activity, Settings, BarChart3, Zap, Users, Trophy, Target, ChevronDown, ChevronRight, Brain, Plug, Github, MessageSquare, FileText, CalendarDays, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: Home },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'AI Insights', href: '/dashboard/insights', icon: Brain },
  { name: 'Activity', href: '/dashboard/activity', icon: Activity },
  { 
    name: 'Team', 
    href: '/dashboard/team', 
    icon: Users,
    subItems: [
      { name: 'Overview', href: '/dashboard/team' },
      { name: 'Leaderboard', href: '/dashboard/team/leaderboard' },
      { name: 'Goals & OKRs', href: '/dashboard/team/goals' },
    ]
  },
  { name: 'Workflows', href: '/dashboard/workflows', icon: Zap },
  { name: 'Integrations', href: '/dashboard/integrations', icon: Plug },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

interface SidebarProps {
  integrations?: {
    github_connected?: boolean;
    notion_connected?: boolean;
    slack_connected?: boolean;
    calendar_connected?: boolean;
  } | null;
}

export default function Sidebar({ integrations }: SidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>(['Team']);
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsOpen(false); // Close mobile menu on desktop
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [pathname, isMobile]);

  const toggleExpand = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  const connectedCount = integrations 
    ? [
        integrations.github_connected,
        integrations.notion_connected,
        integrations.slack_connected,
        integrations.calendar_connected,
      ].filter(Boolean).length
    : 0;

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed top-4 left-4 z-50 lg:hidden bg-gray-900 p-2 rounded-lg border border-gray-800 hover:bg-gray-800 transition-colors"
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} className="text-white" /> : <Menu size={24} className="text-white" />}
        </button>
      )}

      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-gray-900 border-r border-gray-800 min-h-screen flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isMobile ? (isOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
        `}
      >
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          const isExpanded = expandedItems.includes(item.name);
          const hasSubItems = 'subItems' in item && item.subItems;
          
          return (
            <div key={item.name}>
              {hasSubItems ? (
                <>
                  <button
                    onClick={() => toggleExpand(item.name)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                      pathname.startsWith(item.href)
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon size={20} />
                      <span className="font-medium">{item.name}</span>
                    </div>
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                  
                  {isExpanded && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.subItems.map((subItem) => (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className={`flex items-center px-4 py-2 rounded-lg text-sm transition-colors ${
                            pathname === subItem.href
                              ? 'bg-blue-600/50 text-white'
                              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                          }`}
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.href}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon size={20} />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  {item.name === 'Integrations' && connectedCount > 0 && (
                    <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {connectedCount}
                    </span>
                  )}
                </Link>
              )}
            </div>
          );
        })}
      </nav>

      {/* Integration Status Footer */}
      {integrations && connectedCount > 0 && (
        <div className="p-4 border-t border-gray-800">
          <div className="text-xs text-gray-500 mb-2">Connected Integrations</div>
          <div className="space-y-2">
            {integrations.github_connected && (
              <div className="flex items-center space-x-2 text-sm">
                <Github className="w-4 h-4 text-purple-400" />
                <span className="text-gray-400">GitHub</span>
                <div className="ml-auto w-2 h-2 rounded-full bg-green-500"></div>
              </div>
            )}
            {integrations.notion_connected && (
              <div className="flex items-center space-x-2 text-sm">
                <FileText className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400">Notion</span>
                <div className="ml-auto w-2 h-2 rounded-full bg-green-500"></div>
              </div>
            )}
            {integrations.slack_connected && (
              <div className="flex items-center space-x-2 text-sm">
                <MessageSquare className="w-4 h-4 text-pink-400" />
                <span className="text-gray-400">Slack</span>
                <div className="ml-auto w-2 h-2 rounded-full bg-green-500"></div>
              </div>
            )}
            {integrations.calendar_connected && (
              <div className="flex items-center space-x-2 text-sm">
                <CalendarDays className="w-4 h-4 text-blue-400" />
                <span className="text-gray-400">Calendar</span>
                <div className="ml-auto w-2 h-2 rounded-full bg-green-500"></div>
              </div>
            )}
          </div>
        </div>
      )}
      </aside>
    </>
  );
}
