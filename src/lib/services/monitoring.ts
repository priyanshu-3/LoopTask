/**
 * Monitoring Service
 * Centralized service for error tracking and analytics
 */

import * as Sentry from '@sentry/nextjs';
import posthog from 'posthog-js';

// Error tracking with Sentry
export const errorTracking = {
  /**
   * Initialize Sentry error tracking
   * Note: This is called from the client-side providers
   * The actual Sentry.init is in sentry.client.config.ts
   */
  init() {
    // Sentry is initialized via sentry.client.config.ts
    // This method is kept for consistency with the monitoring interface
  },

  /**
   * Capture an exception
   */
  captureException(error: Error, context?: Record<string, any>) {
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      Sentry.captureException(error, {
        extra: context,
      });
    } else {
      console.error('Error:', error, context);
    }
  },

  /**
   * Capture a message
   */
  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      Sentry.captureMessage(message, level);
    } else {
      console.log(`[${level}]`, message);
    }
  },

  /**
   * Set user context
   */
  setUser(user: { id: string; email?: string; username?: string } | null) {
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      Sentry.setUser(user);
    }
  },

  /**
   * Add breadcrumb for debugging
   */
  addBreadcrumb(message: string, category: string, data?: Record<string, any>) {
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      Sentry.addBreadcrumb({
        message,
        category,
        data,
        level: 'info',
      });
    }
  },
};

// Analytics with PostHog
export const analytics = {
  /**
   * Initialize PostHog analytics
   */
  init() {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
        loaded: (posthog) => {
          if (process.env.NODE_ENV === 'development') {
            posthog.opt_out_capturing();
          }
        },
        capture_pageview: false, // We'll manually capture pageviews
        capture_pageleave: true,
      });
    }
  },

  /**
   * Track an event
   */
  track(event: string, properties?: Record<string, any>) {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.capture(event, properties);
    } else {
      console.log('Analytics event:', event, properties);
    }
  },

  /**
   * Identify a user
   */
  identify(userId: string, traits?: Record<string, any>) {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.identify(userId, traits);
    }
  },

  /**
   * Track a page view
   */
  page(name: string, properties?: Record<string, any>) {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.capture('$pageview', {
        page: name,
        ...properties,
      });
    }
  },

  /**
   * Reset user identity (on logout)
   */
  reset() {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.reset();
    }
  },
};

// Combined monitoring service
export const monitoring = {
  /**
   * Initialize all monitoring services
   */
  init() {
    errorTracking.init();
    analytics.init();
  },

  /**
   * Track an error with both error tracking and analytics
   */
  trackError(error: Error, context?: Record<string, any>) {
    errorTracking.captureException(error, context);
    analytics.track('error_occurred', {
      error_message: error.message,
      error_name: error.name,
      ...context,
    });
  },
};
