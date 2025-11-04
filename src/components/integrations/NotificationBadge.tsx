'use client';

import { useNotifications } from '@/lib/hooks/useNotifications';

/**
 * NotificationBadge component for displaying unread notification count
 * 
 * Requirements: 7.1, 7.2, 7.4
 */
export function NotificationBadge() {
  const { unreadCount } = useNotifications();

  if (unreadCount === 0) {
    return null;
  }

  return (
    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
      {unreadCount > 9 ? '9+' : unreadCount}
    </span>
  );
}
