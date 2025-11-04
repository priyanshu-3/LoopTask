/**
 * Performance Monitoring Utilities
 * Track and report performance metrics
 */

import { analytics } from '@/lib/services/monitoring';

/**
 * Measure performance of a function
 */
export function measurePerformance<T>(
  name: string,
  fn: () => T,
  threshold: number = 1000
): T {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;

  // Log to analytics
  analytics.track('performance_metric', {
    name,
    duration,
    timestamp: Date.now(),
  });

  // Warn if slow
  if (duration > threshold) {
    console.warn(`Slow operation: ${name} took ${duration.toFixed(2)}ms`);
  }

  return result;
}

/**
 * Measure async performance
 */
export async function measureAsyncPerformance<T>(
  name: string,
  fn: () => Promise<T>,
  threshold: number = 1000
): Promise<T> {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;

  // Log to analytics
  analytics.track('performance_metric', {
    name,
    duration,
    timestamp: Date.now(),
  });

  // Warn if slow
  if (duration > threshold) {
    console.warn(`Slow async operation: ${name} took ${duration.toFixed(2)}ms`);
  }

  return result;
}

/**
 * Performance mark
 */
export function mark(name: string): void {
  if (typeof window !== 'undefined' && window.performance) {
    performance.mark(name);
  }
}

/**
 * Performance measure
 */
export function measure(name: string, startMark: string, endMark: string): number | null {
  if (typeof window !== 'undefined' && window.performance) {
    try {
      performance.measure(name, startMark, endMark);
      const measures = performance.getEntriesByName(name, 'measure');
      if (measures.length > 0) {
        const duration = measures[0].duration;

        // Log to analytics
        analytics.track('performance_measure', {
          name,
          duration,
          startMark,
          endMark,
        });

        return duration;
      }
    } catch (error) {
      console.error('Performance measure error:', error);
    }
  }
  return null;
}

/**
 * Clear performance marks and measures
 */
export function clearPerformance(name?: string): void {
  if (typeof window !== 'undefined' && window.performance) {
    if (name) {
      performance.clearMarks(name);
      performance.clearMeasures(name);
    } else {
      performance.clearMarks();
      performance.clearMeasures();
    }
  }
}

/**
 * Web Vitals tracking
 */
export interface WebVital {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

/**
 * Report Web Vital to analytics
 */
function reportWebVital(metric: WebVital): void {
  analytics.track('web_vital', {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
  });

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Web Vital] ${metric.name}:`, {
      value: `${metric.value.toFixed(2)}ms`,
      rating: metric.rating,
    });
  }
}

/**
 * Initialize Web Vitals tracking
 */
export function initWebVitals(): void {
  if (typeof window === 'undefined') return;

  // Dynamically import web-vitals to avoid SSR issues
  import('web-vitals').then(({ onCLS, onFCP, onLCP, onTTFB, onINP }) => {
    onCLS(reportWebVital);
    onFCP(reportWebVital);
    onLCP(reportWebVital);
    onTTFB(reportWebVital);
    onINP(reportWebVital);
  }).catch((error) => {
    console.error('Failed to load web-vitals:', error);
  });
}

/**
 * Track page load performance
 */
export function trackPageLoad(): void {
  if (typeof window === 'undefined') return;

  window.addEventListener('load', () => {
    const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    if (perfData) {
      const metrics = {
        dns: perfData.domainLookupEnd - perfData.domainLookupStart,
        tcp: perfData.connectEnd - perfData.connectStart,
        request: perfData.responseStart - perfData.requestStart,
        response: perfData.responseEnd - perfData.responseStart,
        dom: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        load: perfData.loadEventEnd - perfData.loadEventStart,
        total: perfData.loadEventEnd - perfData.fetchStart,
      };

      analytics.track('page_load', metrics);

      if (process.env.NODE_ENV === 'development') {
        console.log('[Page Load Metrics]', metrics);
      }
    }
  });
}

/**
 * Track resource loading
 */
export function trackResourceLoading(): void {
  if (typeof window === 'undefined') return;

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'resource') {
        const resource = entry as PerformanceResourceTiming;

        // Only track slow resources
        if (resource.duration > 1000) {
          analytics.track('slow_resource', {
            name: resource.name,
            duration: resource.duration,
            size: resource.transferSize,
            type: resource.initiatorType,
          });

          console.warn(`Slow resource: ${resource.name} (${resource.duration.toFixed(2)}ms)`);
        }
      }
    }
  });

  observer.observe({ entryTypes: ['resource'] });
}

/**
 * Performance decorator for class methods
 */
export function performanceMonitor(threshold: number = 1000) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const start = performance.now();
      const result = await originalMethod.apply(this, args);
      const duration = performance.now() - start;

      if (duration > threshold) {
        console.warn(
          `[Performance] ${target.constructor.name}.${propertyKey} took ${duration.toFixed(2)}ms`
        );

        analytics.track('slow_method', {
          class: target.constructor.name,
          method: propertyKey,
          duration,
        });
      }

      return result;
    };

    return descriptor;
  };
}

/**
 * Get current performance metrics
 */
export function getPerformanceMetrics(): {
  memory?: MemoryInfo;
  navigation?: PerformanceNavigationTiming;
  resources: PerformanceResourceTiming[];
} {
  if (typeof window === 'undefined') {
    return { resources: [] };
  }

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

  return {
    memory: (performance as any).memory,
    navigation,
    resources,
  };
}

/**
 * Memory usage tracking
 */
export function trackMemoryUsage(): void {
  if (typeof window === 'undefined') return;

  const memory = (performance as any).memory;
  if (memory) {
    const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;

    analytics.track('memory_usage', {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      limit: memory.jsHeapSizeLimit,
      usagePercent,
    });

    // Warn if memory usage is high
    if (usagePercent > 90) {
      console.warn(`High memory usage: ${usagePercent.toFixed(2)}%`);
    }
  }
}

/**
 * Start performance monitoring
 */
export function startPerformanceMonitoring(): void {
  if (typeof window === 'undefined') return;

  // Initialize Web Vitals
  initWebVitals();

  // Track page load
  trackPageLoad();

  // Track resource loading
  trackResourceLoading();

  // Track memory usage periodically
  setInterval(trackMemoryUsage, 60000); // Every minute
}

// Memory info interface
interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}
