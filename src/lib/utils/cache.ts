/**
 * Cache Manager
 * In-memory caching with TTL and stale-while-revalidate support
 */

export interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  staleWhileRevalidate?: boolean;
  key: string;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  staleWhileRevalidate: boolean;
}

class CacheManager {
  private cache: Map<string, CacheEntry<any>>;
  private revalidating: Set<string>;

  constructor() {
    this.cache = new Map();
    this.revalidating = new Set();
  }

  /**
   * Get cached data
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    const now = Date.now();
    const age = now - entry.timestamp;

    // Data is fresh
    if (age < entry.ttl) {
      return entry.data;
    }

    // Data is stale but can be returned while revalidating
    if (entry.staleWhileRevalidate) {
      return entry.data;
    }

    // Data is stale and should not be returned
    this.cache.delete(key);
    return null;
  }

  /**
   * Set cached data
   */
  set<T>(key: string, value: T, config: CacheConfig): void {
    this.cache.set(key, {
      data: value,
      timestamp: Date.now(),
      ttl: config.ttl,
      staleWhileRevalidate: config.staleWhileRevalidate || false,
    });
  }

  /**
   * Check if data is stale
   */
  isStale(key: string): boolean {
    const entry = this.cache.get(key);

    if (!entry) {
      return true;
    }

    const now = Date.now();
    const age = now - entry.timestamp;

    return age >= entry.ttl;
  }

  /**
   * Invalidate cached data
   */
  invalidate(key: string): void {
    this.cache.delete(key);
    this.revalidating.delete(key);
  }

  /**
   * Invalidate all cached data matching pattern
   */
  invalidatePattern(pattern: string | RegExp): void {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        this.revalidating.delete(key);
      }
    }
  }

  /**
   * Clear all cached data
   */
  clear(): void {
    this.cache.clear();
    this.revalidating.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Check if key is being revalidated
   */
  isRevalidating(key: string): boolean {
    return this.revalidating.has(key);
  }

  /**
   * Mark key as revalidating
   */
  setRevalidating(key: string): void {
    this.revalidating.add(key);
  }

  /**
   * Remove revalidating flag
   */
  clearRevalidating(key: string): void {
    this.revalidating.delete(key);
  }

  /**
   * Get all cache keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get cache stats
   */
  stats(): {
    size: number;
    keys: string[];
    revalidating: string[];
  } {
    return {
      size: this.cache.size,
      keys: this.keys(),
      revalidating: Array.from(this.revalidating),
    };
  }
}

// Export singleton instance
export const cache = new CacheManager();

/**
 * Cache decorator for async functions
 */
export function cached<T>(
  config: Omit<CacheConfig, 'key'>,
  keyFn?: (...args: any[]) => string
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const key = keyFn ? keyFn(...args) : `${propertyKey}:${JSON.stringify(args)}`;

      // Check cache
      const cachedData = cache.get<T>(key);
      if (cachedData !== null && !cache.isStale(key)) {
        return cachedData;
      }

      // If stale and stale-while-revalidate, return stale data and revalidate
      if (cachedData !== null && config.staleWhileRevalidate && !cache.isRevalidating(key)) {
        cache.setRevalidating(key);

        // Revalidate in background
        originalMethod.apply(this, args).then((result: T) => {
          cache.set(key, result, { ...config, key });
          cache.clearRevalidating(key);
        });

        return cachedData;
      }

      // Fetch fresh data
      const result = await originalMethod.apply(this, args);
      cache.set(key, result, { ...config, key });

      return result;
    };

    return descriptor;
  };
}

/**
 * Hook for using cache in React components
 */
export function useCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  config: Omit<CacheConfig, 'key'> = { ttl: 5 * 60 * 1000 }
): {
  data: T | null;
  isLoading: boolean;
  isStale: boolean;
  revalidate: () => Promise<void>;
} {
  const [data, setData] = React.useState<T | null>(cache.get(key));
  const [isLoading, setIsLoading] = React.useState(false);
  const [isStale, setIsStale] = React.useState(cache.isStale(key));

  const revalidate = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await fetcher();
      cache.set(key, result, { ...config, key });
      setData(result);
      setIsStale(false);
    } catch (error) {
      console.error('Failed to revalidate:', error);
    } finally {
      setIsLoading(false);
    }
  }, [key, fetcher, config]);

  React.useEffect(() => {
    const cachedData = cache.get<T>(key);

    if (cachedData !== null) {
      setData(cachedData);
      setIsStale(cache.isStale(key));

      // Revalidate if stale and stale-while-revalidate is enabled
      if (cache.isStale(key) && config.staleWhileRevalidate) {
        revalidate();
      }
    } else {
      revalidate();
    }
  }, [key, revalidate, config.staleWhileRevalidate]);

  return {
    data,
    isLoading,
    isStale,
    revalidate,
  };
}

// Import React for the hook
import React from 'react';

export default cache;
