import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  AppError,
  ErrorType,
  ErrorContext,
  errorStrategies,
  isErrorType,
  createErrorFromResponse,
} from '@/types/errors';
import { errorTracking } from '@/lib/services/monitoring';
import { useToast } from '@/components/Toast';

export interface UseErrorHandlerReturn {
  error: AppError | null;
  handleError: (error: Error | AppError, context?: ErrorContext) => void;
  clearError: () => void;
  isLoading: boolean;
}

/**
 * useErrorHandler Hook
 * Centralized error handling with automatic categorization and recovery
 */
export function useErrorHandler(): UseErrorHandlerReturn {
  const [error, setError] = useState<AppError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  const handleError = useCallback(
    (error: Error | AppError, context?: ErrorContext) => {
      // Convert to AppError if needed
      let appError: AppError;
      if (error instanceof AppError) {
        // Create new error with merged context
        appError = new AppError(
          error.type,
          error.message,
          error.userMessage,
          error.statusCode,
          error.details,
          context ? { ...error.context, ...context } : error.context
        );
      } else {
        // Categorize generic errors
        appError = categorizeError(error, context);
      }

      // Set error state
      setError(appError);

      // Get recovery strategy
      const strategy = errorStrategies[appError.type];

      // Log to Sentry if needed
      if (strategy.logToSentry) {
        errorTracking.captureException(appError, {
          ...appError.context,
          errorType: appError.type,
          userMessage: appError.userMessage,
        });
      }

      // Show toast notification
      if (strategy.showToast) {
        showToast({
          type: 'error',
          title: getErrorTitle(appError.type),
          message: appError.userMessage,
        });
      }

      // Handle redirect
      if (strategy.redirect) {
        router.push(strategy.redirect);
      }

      // Handle retry (would need to be implemented with the original action)
      // This is handled at the component level

      console.error('Error handled:', appError);
    },
    [router, showToast]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError,
    isLoading,
  };
}

/**
 * Categorize generic errors into AppError types
 */
function categorizeError(error: Error, context?: ErrorContext): AppError {
  const message = error.message.toLowerCase();

  // Network errors
  if (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('connection')
  ) {
    return new AppError(
      ErrorType.NETWORK,
      error.message,
      'Network error occurred. Please check your connection.',
      0,
      { originalError: error.name },
      context
    );
  }

  // Authentication errors
  if (
    message.includes('unauthorized') ||
    message.includes('authentication') ||
    message.includes('token')
  ) {
    return new AppError(
      ErrorType.AUTHENTICATION,
      error.message,
      'Authentication failed. Please log in again.',
      401,
      { originalError: error.name },
      context
    );
  }

  // Validation errors
  if (message.includes('invalid') || message.includes('validation')) {
    return new AppError(
      ErrorType.VALIDATION,
      error.message,
      'Invalid input. Please check your data.',
      400,
      { originalError: error.name },
      context
    );
  }

  // Default to unknown error
  return new AppError(
    ErrorType.UNKNOWN,
    error.message,
    'An unexpected error occurred. Please try again.',
    500,
    { originalError: error.name },
    context
  );
}

/**
 * Get user-friendly error title
 */
function getErrorTitle(type: ErrorType): string {
  switch (type) {
    case ErrorType.NETWORK:
      return 'Connection Error';
    case ErrorType.AUTHENTICATION:
      return 'Authentication Error';
    case ErrorType.AUTHORIZATION:
      return 'Permission Denied';
    case ErrorType.VALIDATION:
      return 'Validation Error';
    case ErrorType.NOT_FOUND:
      return 'Not Found';
    case ErrorType.SERVER:
      return 'Server Error';
    default:
      return 'Error';
  }
}

/**
 * Hook for handling async operations with error handling
 */
export function useAsyncError() {
  const { handleError } = useErrorHandler();
  const [isLoading, setIsLoading] = useState(false);

  const execute = useCallback(
    async <T>(
      asyncFn: () => Promise<T>,
      context?: ErrorContext
    ): Promise<T | null> => {
      setIsLoading(true);
      try {
        const result = await asyncFn();
        return result;
      } catch (error) {
        handleError(error as Error, context);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [handleError]
  );

  return { execute, isLoading };
}

/**
 * Hook for retrying failed operations
 */
export function useRetry() {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const retry = useCallback(
    async <T>(
      fn: () => Promise<T>,
      maxAttempts: number = 3,
      delay: number = 1000,
      backoff: 'linear' | 'exponential' = 'exponential'
    ): Promise<T> => {
      setIsRetrying(true);
      let lastError: Error | null = null;

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
          const result = await fn();
          setRetryCount(0);
          setIsRetrying(false);
          return result;
        } catch (error) {
          lastError = error as Error;
          setRetryCount(attempt + 1);

          if (attempt < maxAttempts - 1) {
            const waitTime =
              backoff === 'exponential' ? delay * Math.pow(2, attempt) : delay * (attempt + 1);
            await new Promise((resolve) => setTimeout(resolve, waitTime));
          }
        }
      }

      setIsRetrying(false);
      throw lastError;
    },
    []
  );

  return { retry, retryCount, isRetrying };
}
