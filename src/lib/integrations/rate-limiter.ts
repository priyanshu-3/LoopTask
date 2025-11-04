/**
 * Rate limiting utilities for API endpoints
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limits (in production, use Redis)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

/**
 * Rate limiter class
 */
export class RateLimiter {
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  /**
   * Check if request is allowed under rate limit
   * @param key - Unique identifier for the rate limit (e.g., userId + endpoint)
   * @returns Rate limit result
   */
  check(key: string): RateLimitResult {
    const now = Date.now();
    const entry = rateLimitStore.get(key);

    if (!entry || now > entry.resetTime) {
      // Reset or initialize rate limit
      const resetTime = now + this.config.windowMs;
      rateLimitStore.set(key, {
        count: 1,
        resetTime,
      });

      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime,
      };
    }

    if (entry.count >= this.config.maxRequests) {
      // Rate limit exceeded
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);

      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        retryAfter,
      };
    }

    // Increment count
    entry.count++;

    return {
      allowed: true,
      remaining: this.config.maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  }

  /**
   * Reset rate limit for a key
   * @param key - Unique identifier for the rate limit
   */
  reset(key: string): void {
    rateLimitStore.delete(key);
  }

  /**
   * Get current rate limit status without incrementing
   * @param key - Unique identifier for the rate limit
   * @returns Current status
   */
  getStatus(key: string): {
    count: number;
    remaining: number;
    resetTime: number;
  } {
    const now = Date.now();
    const entry = rateLimitStore.get(key);

    if (!entry || now > entry.resetTime) {
      return {
        count: 0,
        remaining: this.config.maxRequests,
        resetTime: now + this.config.windowMs,
      };
    }

    return {
      count: entry.count,
      remaining: Math.max(0, this.config.maxRequests - entry.count),
      resetTime: entry.resetTime,
    };
  }
}

/**
 * Pre-configured rate limiters for different endpoints
 */

// Sync endpoints: 10 requests per minute per user
export const syncRateLimiter = new RateLimiter({
  maxRequests: 10,
  windowMs: 60 * 1000, // 1 minute
});

// Summary endpoints: 20 requests per minute per user
export const summaryRateLimiter = new RateLimiter({
  maxRequests: 20,
  windowMs: 60 * 1000, // 1 minute
});

// General API endpoints: 100 requests per minute per user
export const generalRateLimiter = new RateLimiter({
  maxRequests: 100,
  windowMs: 60 * 1000, // 1 minute
});

/**
 * Helper function to create rate limit response headers
 */
export function createRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': String(result.remaining + (result.allowed ? 1 : 0)),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.floor(result.resetTime / 1000)),
  };

  if (result.retryAfter) {
    headers['Retry-After'] = String(result.retryAfter);
  }

  return headers;
}

/**
 * Helper function to create rate limit error response
 */
export function createRateLimitError(result: RateLimitResult) {
  return {
    error: 'Rate limit exceeded',
    message: `Too many requests. Please try again in ${result.retryAfter} seconds.`,
    retryAfter: result.retryAfter,
  };
}
