/**
 * Error Types and Hierarchy
 * Comprehensive error handling system for the application
 */

export enum ErrorType {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  NOT_FOUND = 'not_found',
  SERVER = 'server',
  UNKNOWN = 'unknown',
}

export interface ErrorContext {
  feature?: string;
  action?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

/**
 * Base Application Error
 */
export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly userMessage: string;
  public readonly statusCode?: number;
  public readonly details?: any;
  public readonly timestamp: Date;
  public readonly context?: ErrorContext;

  constructor(
    type: ErrorType,
    message: string,
    userMessage: string,
    statusCode?: number,
    details?: any,
    context?: ErrorContext
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.userMessage = userMessage;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date();
    this.context = context;

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Network Errors
 */
export class NetworkError extends AppError {
  constructor(message: string, userMessage?: string, details?: any, context?: ErrorContext) {
    super(
      ErrorType.NETWORK,
      message,
      userMessage || 'Network error occurred. Please check your connection.',
      0,
      details,
      context
    );
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends NetworkError {
  constructor(message: string = 'Request timeout', details?: any, context?: ErrorContext) {
    super(
      message,
      'The request took too long. Please try again.',
      details,
      context
    );
    this.name = 'TimeoutError';
  }
}

export class ConnectionError extends NetworkError {
  constructor(message: string = 'Connection failed', details?: any, context?: ErrorContext) {
    super(
      message,
      'Unable to connect to the server. Please check your internet connection.',
      details,
      context
    );
    this.name = 'ConnectionError';
  }
}

export class OfflineError extends NetworkError {
  constructor(message: string = 'No internet connection', details?: any, context?: ErrorContext) {
    super(
      message,
      'You appear to be offline. Please check your internet connection.',
      details,
      context
    );
    this.name = 'OfflineError';
  }
}

/**
 * Authentication Errors
 */
export class AuthenticationError extends AppError {
  constructor(message: string, userMessage?: string, details?: any, context?: ErrorContext) {
    super(
      ErrorType.AUTHENTICATION,
      message,
      userMessage || 'Authentication failed. Please log in again.',
      401,
      details,
      context
    );
    this.name = 'AuthenticationError';
  }
}

export class InvalidCredentialsError extends AuthenticationError {
  constructor(message: string = 'Invalid credentials', details?: any, context?: ErrorContext) {
    super(
      message,
      'Invalid email or password. Please try again.',
      details,
      context
    );
    this.name = 'InvalidCredentialsError';
  }
}

export class SessionExpiredError extends AuthenticationError {
  constructor(message: string = 'Session expired', details?: any, context?: ErrorContext) {
    super(
      message,
      'Your session has expired. Please log in again.',
      details,
      context
    );
    this.name = 'SessionExpiredError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized', userMessage?: string, details?: any, context?: ErrorContext) {
    super(
      ErrorType.AUTHORIZATION,
      message,
      userMessage || 'You do not have permission to perform this action.',
      403,
      details,
      context
    );
    this.name = 'UnauthorizedError';
  }
}

/**
 * Validation Errors
 */
export class ValidationError extends AppError {
  constructor(message: string, userMessage?: string, details?: any, context?: ErrorContext) {
    super(
      ErrorType.VALIDATION,
      message,
      userMessage || 'Invalid input. Please check your data and try again.',
      400,
      details,
      context
    );
    this.name = 'ValidationError';
  }
}

export class InvalidInputError extends ValidationError {
  constructor(field: string, message?: string, details?: any, context?: ErrorContext) {
    super(
      `Invalid input for field: ${field}`,
      message || `Please provide a valid ${field}.`,
      details,
      context
    );
    this.name = 'InvalidInputError';
  }
}

export class MissingFieldError extends ValidationError {
  constructor(field: string, details?: any, context?: ErrorContext) {
    super(
      `Missing required field: ${field}`,
      `${field} is required.`,
      details,
      context
    );
    this.name = 'MissingFieldError';
  }
}

/**
 * Not Found Error
 */
export class NotFoundError extends AppError {
  constructor(resource: string, details?: any, context?: ErrorContext) {
    super(
      ErrorType.NOT_FOUND,
      `${resource} not found`,
      `The requested ${resource.toLowerCase()} could not be found.`,
      404,
      details,
      context
    );
    this.name = 'NotFoundError';
  }
}

/**
 * Server Errors
 */
export class ServerError extends AppError {
  constructor(message: string, userMessage?: string, details?: any, context?: ErrorContext) {
    super(
      ErrorType.SERVER,
      message,
      userMessage || 'An unexpected error occurred. Please try again later.',
      500,
      details,
      context
    );
    this.name = 'ServerError';
  }
}

export class DatabaseError extends ServerError {
  constructor(message: string, details?: any, context?: ErrorContext) {
    super(
      message,
      'A database error occurred. Please try again later.',
      details,
      context
    );
    this.name = 'DatabaseError';
  }
}

export class ExternalAPIError extends ServerError {
  constructor(service: string, message: string, details?: any, context?: ErrorContext) {
    super(
      `${service} API error: ${message}`,
      `Unable to connect to ${service}. Please try again later.`,
      details,
      context
    );
    this.name = 'ExternalAPIError';
  }
}

/**
 * Integration Errors
 */
export class IntegrationError extends AppError {
  public readonly provider: string;
  public readonly code: string;
  public readonly retryable: boolean;

  constructor(
    message: string,
    provider: string,
    code: string,
    retryable: boolean = false,
    details?: any,
    context?: ErrorContext
  ) {
    super(
      ErrorType.SERVER,
      message,
      `Integration error with ${provider}. ${retryable ? 'Please try again.' : 'Please reconnect your account.'}`,
      500,
      details,
      context
    );
    this.name = 'IntegrationError';
    this.provider = provider;
    this.code = code;
    this.retryable = retryable;
  }
}

/**
 * Error Recovery Strategy
 */
export interface ErrorRecoveryStrategy {
  retry?: {
    maxAttempts: number;
    backoff: 'linear' | 'exponential';
    delay: number;
  };
  fallback?: () => any;
  redirect?: string;
  showToast?: boolean;
  logToSentry?: boolean;
}

export const errorStrategies: Record<ErrorType, ErrorRecoveryStrategy> = {
  [ErrorType.NETWORK]: {
    retry: { maxAttempts: 3, backoff: 'exponential', delay: 1000 },
    showToast: true,
    logToSentry: false,
  },
  [ErrorType.AUTHENTICATION]: {
    redirect: '/login',
    showToast: true,
    logToSentry: false,
  },
  [ErrorType.AUTHORIZATION]: {
    showToast: true,
    logToSentry: false,
  },
  [ErrorType.VALIDATION]: {
    showToast: true,
    logToSentry: false,
  },
  [ErrorType.NOT_FOUND]: {
    showToast: true,
    logToSentry: false,
  },
  [ErrorType.SERVER]: {
    retry: { maxAttempts: 1, backoff: 'linear', delay: 2000 },
    showToast: true,
    logToSentry: true,
  },
  [ErrorType.UNKNOWN]: {
    showToast: true,
    logToSentry: true,
  },
};

/**
 * Helper function to create appropriate error from HTTP response
 */
export function createErrorFromResponse(response: Response, defaultMessage?: string): AppError {
  const status = response.status;
  const message = defaultMessage || response.statusText;

  if (status === 401) {
    return new AuthenticationError(message);
  } else if (status === 403) {
    return new UnauthorizedError(message);
  } else if (status === 404) {
    return new NotFoundError('Resource', { url: response.url });
  } else if (status === 400) {
    return new ValidationError(message);
  } else if (status >= 500) {
    return new ServerError(message);
  } else {
    return new AppError(ErrorType.UNKNOWN, message, 'An unexpected error occurred', status);
  }
}

/**
 * Helper function to check if error is of specific type
 */
export function isErrorType(error: any, type: ErrorType): boolean {
  return error instanceof AppError && error.type === type;
}
