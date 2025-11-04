import { supabaseAdmin } from '@/lib/supabaseClient';

/**
 * Cron job execution statistics
 */
export interface CronJobStats {
  jobName: string;
  totalExecutions: number;
  successCount: number;
  failureCount: number;
  successRate: number;
  averageDuration: number;
  lastExecution?: Date;
  lastStatus?: 'success' | 'failed';
  recentFailures: number;
}

/**
 * Cron job execution record
 */
export interface CronJobExecution {
  id: string;
  jobName: string;
  startedAt: Date;
  completedAt?: Date;
  status: 'running' | 'success' | 'failed';
  usersProcessed: number;
  providersSync: number;
  successCount: number;
  failureCount: number;
  errorMessage?: string;
  durationMs?: number;
  metadata?: any;
}

/**
 * Alert configuration for cron job monitoring
 */
export interface CronJobAlert {
  jobName: string;
  alertType: 'high_failure_rate' | 'consecutive_failures' | 'long_duration';
  threshold: number;
  currentValue: number;
  message: string;
  severity: 'warning' | 'error';
  triggeredAt: Date;
}

/**
 * CronMonitoringService provides monitoring and alerting for scheduled cron jobs
 * 
 * Features:
 * - Track execution statistics (success/failure rates)
 * - Monitor job duration and performance
 * - Detect high failure rates and send alerts
 * - Provide dashboard data for monitoring UI
 * 
 * Requirements: 7.5
 */
export class CronMonitoringService {
  private readonly HIGH_FAILURE_RATE_THRESHOLD = 0.5; // 50%
  private readonly CONSECUTIVE_FAILURES_THRESHOLD = 3;
  private readonly LONG_DURATION_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

  /**
   * Get statistics for a specific cron job
   * 
   * @param jobName - Name of the cron job
   * @param timeRangeHours - Time range to analyze (default: 24 hours)
   * @returns Job statistics
   */
  async getJobStats(jobName: string, timeRangeHours: number = 24): Promise<CronJobStats> {
    try {
      const since = new Date(Date.now() - timeRangeHours * 60 * 60 * 1000);

      const { data: executions, error } = await supabaseAdmin
        .from('cron_job_executions')
        .select('*')
        .eq('job_name', jobName)
        .gte('started_at', since.toISOString())
        .order('started_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch job stats:', error);
        throw error;
      }

      if (!executions || executions.length === 0) {
        return {
          jobName,
          totalExecutions: 0,
          successCount: 0,
          failureCount: 0,
          successRate: 0,
          averageDuration: 0,
          recentFailures: 0,
        };
      }

      const totalExecutions = executions.length;
      const successCount = executions.filter((e) => e.status === 'success').length;
      const failureCount = executions.filter((e) => e.status === 'failed').length;
      const successRate = totalExecutions > 0 ? successCount / totalExecutions : 0;

      const completedExecutions = executions.filter((e) => e.duration_ms != null);
      const averageDuration =
        completedExecutions.length > 0
          ? completedExecutions.reduce((sum, e) => sum + (e.duration_ms || 0), 0) /
            completedExecutions.length
          : 0;

      const lastExecution = executions[0];
      const lastExecutionDate = lastExecution ? new Date(lastExecution.started_at) : undefined;
      const lastStatus = lastExecution?.status === 'success' || lastExecution?.status === 'failed'
        ? lastExecution.status
        : undefined;

      // Count recent consecutive failures
      let recentFailures = 0;
      for (const execution of executions) {
        if (execution.status === 'failed') {
          recentFailures++;
        } else if (execution.status === 'success') {
          break;
        }
      }

      return {
        jobName,
        totalExecutions,
        successCount,
        failureCount,
        successRate,
        averageDuration,
        lastExecution: lastExecutionDate,
        lastStatus,
        recentFailures,
      };
    } catch (error) {
      console.error(`Failed to get stats for job ${jobName}:`, error);
      throw error;
    }
  }

  /**
   * Get statistics for all cron jobs
   * 
   * @param timeRangeHours - Time range to analyze (default: 24 hours)
   * @returns Array of job statistics
   */
  async getAllJobStats(timeRangeHours: number = 24): Promise<CronJobStats[]> {
    try {
      const since = new Date(Date.now() - timeRangeHours * 60 * 60 * 1000);

      // Get all unique job names
      const { data: jobs, error } = await supabaseAdmin
        .from('cron_job_executions')
        .select('job_name')
        .gte('started_at', since.toISOString());

      if (error) {
        console.error('Failed to fetch job names:', error);
        throw error;
      }

      if (!jobs || jobs.length === 0) {
        return [];
      }

      const uniqueJobNames = [...new Set(jobs.map((j) => j.job_name))];

      // Get stats for each job
      const stats = await Promise.all(
        uniqueJobNames.map((jobName) => this.getJobStats(jobName, timeRangeHours))
      );

      return stats;
    } catch (error) {
      console.error('Failed to get all job stats:', error);
      throw error;
    }
  }

  /**
   * Get recent executions for a job
   * 
   * @param jobName - Name of the cron job
   * @param limit - Maximum number of executions to return
   * @returns Array of recent executions
   */
  async getRecentExecutions(jobName: string, limit: number = 10): Promise<CronJobExecution[]> {
    try {
      const { data: executions, error } = await supabaseAdmin
        .from('cron_job_executions')
        .select('*')
        .eq('job_name', jobName)
        .order('started_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Failed to fetch recent executions:', error);
        throw error;
      }

      return (executions || []).map((e) => ({
        id: e.id,
        jobName: e.job_name,
        startedAt: new Date(e.started_at),
        completedAt: e.completed_at ? new Date(e.completed_at) : undefined,
        status: e.status,
        usersProcessed: e.users_processed,
        providersSync: e.providers_synced,
        successCount: e.success_count,
        failureCount: e.failure_count,
        errorMessage: e.error_message,
        durationMs: e.duration_ms,
        metadata: e.metadata,
      }));
    } catch (error) {
      console.error(`Failed to get recent executions for job ${jobName}:`, error);
      throw error;
    }
  }

  /**
   * Check for alerts and return any active alerts
   * 
   * @param timeRangeHours - Time range to analyze (default: 24 hours)
   * @returns Array of active alerts
   */
  async checkForAlerts(timeRangeHours: number = 24): Promise<CronJobAlert[]> {
    try {
      const alerts: CronJobAlert[] = [];
      const stats = await this.getAllJobStats(timeRangeHours);

      for (const stat of stats) {
        // Check for high failure rate
        if (
          stat.totalExecutions >= 5 &&
          stat.successRate < 1 - this.HIGH_FAILURE_RATE_THRESHOLD
        ) {
          alerts.push({
            jobName: stat.jobName,
            alertType: 'high_failure_rate',
            threshold: this.HIGH_FAILURE_RATE_THRESHOLD,
            currentValue: 1 - stat.successRate,
            message: `High failure rate detected: ${(stat.failureCount / stat.totalExecutions * 100).toFixed(1)}% (${stat.failureCount}/${stat.totalExecutions} executions failed)`,
            severity: 'error',
            triggeredAt: new Date(),
          });
        }

        // Check for consecutive failures
        if (stat.recentFailures >= this.CONSECUTIVE_FAILURES_THRESHOLD) {
          alerts.push({
            jobName: stat.jobName,
            alertType: 'consecutive_failures',
            threshold: this.CONSECUTIVE_FAILURES_THRESHOLD,
            currentValue: stat.recentFailures,
            message: `${stat.recentFailures} consecutive failures detected`,
            severity: 'error',
            triggeredAt: new Date(),
          });
        }

        // Check for long duration
        if (stat.averageDuration > this.LONG_DURATION_THRESHOLD_MS) {
          alerts.push({
            jobName: stat.jobName,
            alertType: 'long_duration',
            threshold: this.LONG_DURATION_THRESHOLD_MS,
            currentValue: stat.averageDuration,
            message: `Average execution time is high: ${(stat.averageDuration / 1000).toFixed(1)}s`,
            severity: 'warning',
            triggeredAt: new Date(),
          });
        }
      }

      // Log alerts
      if (alerts.length > 0) {
        console.warn(`🚨 ${alerts.length} cron job alerts detected:`, alerts);
        await this.logAlerts(alerts);
      }

      return alerts;
    } catch (error) {
      console.error('Failed to check for alerts:', error);
      throw error;
    }
  }

  /**
   * Log alerts for monitoring
   * 
   * @param alerts - Array of alerts to log
   */
  private async logAlerts(alerts: CronJobAlert[]): Promise<void> {
    try {
      // Log to console for now
      // In production, this could send to Sentry, Slack, email, etc.
      for (const alert of alerts) {
        console.warn(
          `🚨 [${alert.severity.toUpperCase()}] ${alert.jobName}: ${alert.message}`
        );
      }

      // Could store alerts in a separate table for historical tracking
      // For now, just console logging
    } catch (error) {
      console.error('Failed to log alerts:', error);
    }
  }

  /**
   * Get dashboard data for monitoring UI
   * 
   * @param timeRangeHours - Time range to analyze (default: 24 hours)
   * @returns Dashboard data with stats and alerts
   */
  async getDashboardData(timeRangeHours: number = 24) {
    try {
      const [stats, alerts] = await Promise.all([
        this.getAllJobStats(timeRangeHours),
        this.checkForAlerts(timeRangeHours),
      ]);

      // Get recent executions for each job
      const recentExecutions: Record<string, CronJobExecution[]> = {};
      for (const stat of stats) {
        recentExecutions[stat.jobName] = await this.getRecentExecutions(stat.jobName, 5);
      }

      return {
        stats,
        alerts,
        recentExecutions,
        timeRange: {
          hours: timeRangeHours,
          since: new Date(Date.now() - timeRangeHours * 60 * 60 * 1000),
        },
      };
    } catch (error) {
      console.error('Failed to get dashboard data:', error);
      throw error;
    }
  }

  /**
   * Clean up old execution logs
   * 
   * @param retentionDays - Number of days to retain logs (default: 30)
   * @returns Number of records deleted
   */
  async cleanupOldLogs(retentionDays: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

      const { data, error } = await supabaseAdmin
        .from('cron_job_executions')
        .delete()
        .lt('started_at', cutoffDate.toISOString())
        .select('id');

      if (error) {
        console.error('Failed to cleanup old logs:', error);
        throw error;
      }

      const deletedCount = data?.length || 0;
      console.log(`🧹 Cleaned up ${deletedCount} old cron job execution logs`);

      return deletedCount;
    } catch (error) {
      console.error('Failed to cleanup old logs:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const cronMonitoring = new CronMonitoringService();
