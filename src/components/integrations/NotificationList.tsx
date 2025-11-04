'use client';

import { useNotifications } from '@/lib/hooks/useNotifications';
import { IntegrationNotification } from '@/types/notification';
import Badge from '@/components/Badge';
import Button from '@/components/Button';
import Link from 'next/link';

/**
 * NotificationList component for displaying integration notifications
 * 
 * Requirements: 7.1, 7.2, 7.4
 */
export function NotificationList() {
  const {
    notifications,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-2">🔔</div>
        <p className="text-gray-500 dark:text-gray-400">No notifications</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
          You're all caught up!
        </p>
      </div>
    );
  }

  const unreadNotifications = notifications.filter((n) => !n.read);

  return (
    <div className="space-y-4">
      {/* Header with actions */}
      {unreadNotifications.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {unreadNotifications.length} unread notification{unreadNotifications.length !== 1 ? 's' : ''}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllAsRead()}
          >
            Mark all as read
          </Button>
        </div>
      )}

      {/* Notification list */}
      <div className="space-y-3">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onMarkAsRead={markAsRead}
            onDelete={deleteNotification}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Individual notification item
 */
function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
}: {
  notification: IntegrationNotification;
  onMarkAsRead: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const severityColors = {
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
  };

  const severityBadgeColors = {
    info: 'blue',
    warning: 'yellow',
    error: 'red',
    success: 'green',
  };

  const providerIcons = {
    github: '🐙',
    notion: '📝',
    slack: '💬',
    calendar: '📅',
  };

  const handleClick = async () => {
    if (!notification.read) {
      await onMarkAsRead(notification.id);
    }
  };

  return (
    <div
      className={`rounded-lg border p-4 transition-all ${
        notification.read
          ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-60'
          : severityColors[notification.severity]
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{providerIcons[notification.provider]}</span>
            <h4 className="font-medium text-gray-900 dark:text-white truncate">
              {notification.title}
            </h4>
            {!notification.read && (
              <span className="flex h-2 w-2 rounded-full bg-blue-500"></span>
            )}
          </div>

          {/* Message */}
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            {notification.message}
          </p>

          {/* Footer */}
          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant={severityBadgeColors[notification.severity] as any}>
              {notification.severity}
            </Badge>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatRelativeTime(notification.createdAt)}
            </span>
            {notification.actionUrl && notification.actionLabel && (
              <Link
                href={notification.actionUrl}
                onClick={handleClick}
                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                {notification.actionLabel} →
              </Link>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {!notification.read && (
            <button
              onClick={() => onMarkAsRead(notification.id)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title="Mark as read"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          )}
          <button
            onClick={() => onDelete(notification.id)}
            className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            title="Delete"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  
  return new Date(date).toLocaleDateString();
}
