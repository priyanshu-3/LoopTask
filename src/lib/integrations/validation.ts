/**
 * Input validation utilities for integration endpoints
 */

import { IntegrationProvider } from './oauth-manager';

/**
 * Validate OAuth callback parameters
 */
export function validateOAuthCallback(params: {
  code?: string | null;
  state?: string | null;
  error?: string | null;
}): { valid: boolean; error?: string } {
  // Check for OAuth error
  if (params.error) {
    return {
      valid: false,
      error: `OAuth error: ${sanitizeString(params.error)}`,
    };
  }

  // Validate code parameter
  if (!params.code || typeof params.code !== 'string') {
    return {
      valid: false,
      error: 'Missing or invalid authorization code',
    };
  }

  // Validate code format (alphanumeric, hyphens, underscores)
  if (!/^[a-zA-Z0-9_-]+$/.test(params.code)) {
    return {
      valid: false,
      error: 'Invalid authorization code format',
    };
  }

  // Validate state parameter
  if (!params.state || typeof params.state !== 'string') {
    return {
      valid: false,
      error: 'Missing or invalid state parameter',
    };
  }

  // Validate state format (hex string)
  if (!/^[a-f0-9]{64}$/.test(params.state)) {
    return {
      valid: false,
      error: 'Invalid state parameter format',
    };
  }

  return { valid: true };
}

/**
 * Validate provider parameter
 */
export function validateProvider(
  provider: string | undefined
): { valid: boolean; provider?: IntegrationProvider; error?: string } {
  if (!provider) {
    return {
      valid: false,
      error: 'Missing provider parameter',
    };
  }

  const validProviders: IntegrationProvider[] = [
    'github',
    'notion',
    'slack',
    'calendar',
  ];

  if (!validProviders.includes(provider as IntegrationProvider)) {
    return {
      valid: false,
      error: `Invalid provider: ${sanitizeString(provider)}`,
    };
  }

  return {
    valid: true,
    provider: provider as IntegrationProvider,
  };
}

/**
 * Validate date range parameters for summaries
 */
export function validateDateRange(params: {
  start?: string | null;
  end?: string | null;
}): {
  valid: boolean;
  start?: Date;
  end?: Date;
  error?: string;
} {
  let startDate: Date | undefined;
  let endDate: Date | undefined;

  // Validate start date
  if (params.start) {
    if (typeof params.start !== 'string') {
      return {
        valid: false,
        error: 'Invalid start date format',
      };
    }

    startDate = new Date(params.start);
    if (isNaN(startDate.getTime())) {
      return {
        valid: false,
        error: 'Invalid start date',
      };
    }
  }

  // Validate end date
  if (params.end) {
    if (typeof params.end !== 'string') {
      return {
        valid: false,
        error: 'Invalid end date format',
      };
    }

    endDate = new Date(params.end);
    if (isNaN(endDate.getTime())) {
      return {
        valid: false,
        error: 'Invalid end date',
      };
    }
  }

  // Validate date range logic
  if (startDate && endDate && startDate > endDate) {
    return {
      valid: false,
      error: 'Start date must be before end date',
    };
  }

  // Validate date range is not too far in the past (max 1 year)
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  if (startDate && startDate < oneYearAgo) {
    return {
      valid: false,
      error: 'Start date cannot be more than 1 year in the past',
    };
  }

  // Validate date range is not in the future
  const now = new Date();
  if (startDate && startDate > now) {
    return {
      valid: false,
      error: 'Start date cannot be in the future',
    };
  }

  if (endDate && endDate > now) {
    return {
      valid: false,
      error: 'End date cannot be in the future',
    };
  }

  return {
    valid: true,
    start: startDate,
    end: endDate,
  };
}

/**
 * Validate summary type parameter
 */
export function validateSummaryType(
  type: string | undefined
): {
  valid: boolean;
  type?: 'daily' | 'weekly' | 'monthly';
  error?: string;
} {
  if (!type) {
    // Default to daily if not specified
    return {
      valid: true,
      type: 'daily',
    };
  }

  const validTypes = ['daily', 'weekly', 'monthly'];

  if (!validTypes.includes(type)) {
    return {
      valid: false,
      error: `Invalid summary type: ${sanitizeString(type)}. Must be one of: ${validTypes.join(', ')}`,
    };
  }

  return {
    valid: true,
    type: type as 'daily' | 'weekly' | 'monthly',
  };
}

/**
 * Sanitize string input to prevent XSS and injection attacks
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  // Remove any HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '');

  // Remove any script tags and their content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Limit length to prevent DoS
  sanitized = sanitized.substring(0, 1000);

  // Trim whitespace
  sanitized = sanitized.trim();

  return sanitized;
}

/**
 * Validate pagination parameters
 */
export function validatePagination(params: {
  page?: string | null;
  limit?: string | null;
}): {
  valid: boolean;
  page?: number;
  limit?: number;
  error?: string;
} {
  let page = 1;
  let limit = 20;

  // Validate page parameter
  if (params.page) {
    const pageNum = parseInt(params.page, 10);
    if (isNaN(pageNum) || pageNum < 1) {
      return {
        valid: false,
        error: 'Invalid page parameter. Must be a positive integer.',
      };
    }
    if (pageNum > 1000) {
      return {
        valid: false,
        error: 'Page parameter too large. Maximum is 1000.',
      };
    }
    page = pageNum;
  }

  // Validate limit parameter
  if (params.limit) {
    const limitNum = parseInt(params.limit, 10);
    if (isNaN(limitNum) || limitNum < 1) {
      return {
        valid: false,
        error: 'Invalid limit parameter. Must be a positive integer.',
      };
    }
    if (limitNum > 100) {
      return {
        valid: false,
        error: 'Limit parameter too large. Maximum is 100.',
      };
    }
    limit = limitNum;
  }

  return {
    valid: true,
    page,
    limit,
  };
}

/**
 * Validate user ID format
 */
export function validateUserId(userId: string | undefined): {
  valid: boolean;
  error?: string;
} {
  if (!userId) {
    return {
      valid: false,
      error: 'Missing user ID',
    };
  }

  // UUID format validation
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (!uuidRegex.test(userId)) {
    return {
      valid: false,
      error: 'Invalid user ID format',
    };
  }

  return { valid: true };
}
