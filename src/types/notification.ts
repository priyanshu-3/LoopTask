import { IntegrationProvider } from './integration';

/**
 * Notification types for integration health issues
 */
export type NotificationType = 
  | 'reauth_required' 
  | 'sync_failures' 
  | 'token_expired'
  | 'sync_success';

/**
 * Notification severity levels
 */
export type NotificationSeverity = 'info' | 'warning' | 'error' | 'success';

/**
 * Integration notification
 */
export interface IntegrationNotification {
  id: string;
  userId: string;
  provider: IntegrationProvider;
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  read: boolean;
  createdAt: Date;
  metadata?: Record<string, any>;
}

/**
 * Notification creation input
 */
export interface CreateNotificationInput {
  userId: string;
  provider: IntegrationProvider;
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
}
