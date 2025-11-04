import { supabaseAdmin } from '@/lib/supabaseClient';
import { IntegrationProvider } from './token-manager';
import { 
  IntegrationNotification, 
  CreateNotificationInput,
  NotificationType,
  NotificationSeverity 
} from '@/types/notification';

/**
 * NotificationService manages in-app notifications for integration health issues
 * 
 * Features:
 * - Create notifications for reauthorization needed
 * - Create notifications for consecutive sync failures
 * - Track read/unread status
 * - Get notification count for badge display
 * - Mark notifications as read
 * 
 * Requirements: 7.1, 7.2, 7.4
 */
export class NotificationService {
  /**
   * Create a notification for reauthorization required
   * 
   * @param userId - User ID
   * @param provider - Integration provider
   */
  async notifyReauthorizationRequired(
    userId: string,
    provider: IntegrationProvider
  ): Promise<void> {
    const providerName = this.getProviderDisplayName(provider);
    
    await this.createNotification({
      userId,
      provider,
      type: 'reauth_required',
      severity: 'warning',
      title: `${providerName} Reconnection Required`,
      message: `Your ${providerName} connection needs to be reauthorized. Click to reconnect.`,
      actionUrl: '/dashboard/integrations',
      actionLabel: 'Reconnect',
    });
  }

  /**
   * Create a notification for consecutive sync failures
   * 
   * @param userId - User ID
   * @param provider - Integration provider
   * @param failureCount - Number of consecutive failures
   */
  async notifySyncFailures(
    userId: string,
    provider: IntegrationProvider,
    failureCount: number
  ): Promise<void> {
    const providerName = this.getProviderDisplayName(provider);
    
    await this.createNotification({
      userId,
      provider,
      type: 'sync_failures',
      severity: 'error',
      title: `${providerName} Sync Issues`,
      message: `${providerName} has failed to sync ${failureCount} times in a row. Please check your connection.`,
      actionUrl: '/dashboard/integrations',
      actionLabel: 'View Details',
      metadata: { failureCount },
    });
  }

  /**
   * Create a notification for token expiration
   * 
   * @param userId - User ID
   * @param provider - Integration provider
   */
  async notifyTokenExpired(
    userId: string,
    provider: IntegrationProvider
  ): Promise<void> {
    const providerName = this.getProviderDisplayName(provider);
    
    await this.createNotification({
      userId,
      provider,
      type: 'token_expired',
      severity: 'warning',
      title: `${providerName} Token Expired`,
      message: `Your ${providerName} access token has expired. Please reconnect to continue syncing.`,
      actionUrl: '/dashboard/integrations',
      actionLabel: 'Reconnect',
    });
  }

  /**
   * Create a generic notification
   * 
   * @param input - Notification creation input
   */
  async createNotification(input: CreateNotificationInput): Promise<IntegrationNotification | null> {
    try {
      // Check if similar notification already exists (avoid duplicates)
      const existingNotification = await this.findSimilarNotification(
        input.userId,
        input.provider,
        input.type
      );

      if (existingNotification) {
        console.log(`Similar notification already exists for ${input.provider}:${input.type}`);
        return existingNotification;
      }

      // Create notification in database
      const { data, error } = await supabaseAdmin
        .from('integration_notifications')
        .insert({
          user_id: input.userId,
          provider: input.provider,
          type: input.type,
          severity: input.severity,
          title: input.title,
          message: input.message,
          action_url: input.actionUrl,
          action_label: input.actionLabel,
          read: false,
          metadata: input.metadata,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to create notification:', error);
        return null;
      }

      console.log(`📬 Created notification: ${input.title}`);

      return this.mapToNotification(data);
    } catch (error) {
      console.error('Failed to create notification:', error);
      return null;
    }
  }

  /**
   * Get all notifications for a user
   * 
   * @param userId - User ID
   * @param unreadOnly - Only return unread notifications
   * @returns Array of notifications
   */
  async getNotifications(
    userId: string,
    unreadOnly: boolean = false
  ): Promise<IntegrationNotification[]> {
    try {
      let query = supabaseAdmin
        .from('integration_notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (unreadOnly) {
        query = query.eq('read', false);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Failed to get notifications:', error);
        return [];
      }

      return (data || []).map(this.mapToNotification);
    } catch (error) {
      console.error('Failed to get notifications:', error);
      return [];
    }
  }

  /**
   * Get unread notification count for badge display
   * 
   * @param userId - User ID
   * @returns Number of unread notifications
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabaseAdmin
        .from('integration_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) {
        console.error('Failed to get unread count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Failed to get unread count:', error);
      return 0;
    }
  }

  /**
   * Mark notification as read
   * 
   * @param notificationId - Notification ID
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await supabaseAdmin
        .from('integration_notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Failed to mark notification as read:', error);
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }

  /**
   * Mark all notifications as read for a user
   * 
   * @param userId - User ID
   */
  async markAllAsRead(userId: string): Promise<void> {
    try {
      const { error } = await supabaseAdmin
        .from('integration_notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) {
        console.error('Failed to mark all notifications as read:', error);
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }

  /**
   * Delete a notification
   * 
   * @param notificationId - Notification ID
   */
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      const { error } = await supabaseAdmin
        .from('integration_notifications')
        .delete()
        .eq('id', notificationId);

      if (error) {
        console.error('Failed to delete notification:', error);
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  }

  /**
   * Clear notifications for a specific provider
   * Used when user reconnects or resolves issues
   * 
   * @param userId - User ID
   * @param provider - Integration provider
   */
  async clearProviderNotifications(
    userId: string,
    provider: IntegrationProvider
  ): Promise<void> {
    try {
      const { error } = await supabaseAdmin
        .from('integration_notifications')
        .delete()
        .eq('user_id', userId)
        .eq('provider', provider);

      if (error) {
        console.error('Failed to clear provider notifications:', error);
      }
    } catch (error) {
      console.error('Failed to clear provider notifications:', error);
    }
  }

  /**
   * Find similar notification to avoid duplicates
   * 
   * @param userId - User ID
   * @param provider - Integration provider
   * @param type - Notification type
   * @returns Existing notification or null
   */
  private async findSimilarNotification(
    userId: string,
    provider: IntegrationProvider,
    type: NotificationType
  ): Promise<IntegrationNotification | null> {
    try {
      // Look for unread notifications of the same type within the last 24 hours
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabaseAdmin
        .from('integration_notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('provider', provider)
        .eq('type', type)
        .eq('read', false)
        .gte('created_at', oneDayAgo)
        .limit(1)
        .single();

      if (error || !data) {
        return null;
      }

      return this.mapToNotification(data);
    } catch (error) {
      return null;
    }
  }

  /**
   * Map database record to notification object
   */
  private mapToNotification(data: any): IntegrationNotification {
    return {
      id: data.id,
      userId: data.user_id,
      provider: data.provider,
      type: data.type,
      severity: data.severity,
      title: data.title,
      message: data.message,
      actionUrl: data.action_url,
      actionLabel: data.action_label,
      read: data.read,
      createdAt: new Date(data.created_at),
      metadata: data.metadata,
    };
  }

  /**
   * Get display name for provider
   */
  private getProviderDisplayName(provider: IntegrationProvider): string {
    const names: Record<IntegrationProvider, string> = {
      github: 'GitHub',
      notion: 'Notion',
      slack: 'Slack',
      calendar: 'Google Calendar',
    };
    return names[provider];
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
