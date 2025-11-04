import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import Skeleton from '@/components/Skeleton';
import EmptyState from '@/components/EmptyState';
import Button from '@/components/Button';

export interface LoadingStateProps {
  loading: boolean;
  error?: Error | null;
  empty?: boolean;
  emptyState?: React.ReactNode;
  skeleton?: React.ReactNode;
  errorRetry?: () => void;
  children: React.ReactNode;
}

/**
 * LoadingState Component
 * Unified component for handling loading, error, and empty states
 */
export function LoadingState({
  loading,
  error,
  empty,
  emptyState,
  skeleton,
  errorRetry,
  children,
}: LoadingStateProps) {
  // Show skeleton while loading
  if (loading) {
    return <>{skeleton || <DefaultSkeleton />}</>;
  }

  // Show error state if error
  if (error) {
    return (
      <ErrorState
        error={error}
        onRetry={errorRetry}
      />
    );
  }

  // Show empty state if no data
  if (empty) {
    return <>{emptyState || <DefaultEmptyState />}</>;
  }

  // Show children when loaded
  return <>{children}</>;
}

/**
 * Default Skeleton Loader
 */
function DefaultSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
      <Skeleton className="h-64" />
    </div>
  );
}

/**
 * Default Empty State
 */
function DefaultEmptyState() {
  return (
    <EmptyState
      icon={AlertCircle}
      title="No data available"
      description="There's nothing to show here yet."
    />
  );
}

/**
 * Error State Component
 */
function ErrorState({ error, onRetry }: { error: Error; onRetry?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-12 px-4"
    >
      <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <h3 className="text-xl font-semibold mb-2">Something went wrong</h3>
      <p className="text-gray-400 text-center mb-6 max-w-md">
        {error.message || 'An unexpected error occurred'}
      </p>
      {onRetry && (
        <Button variant="primary" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </motion.div>
  );
}

/**
 * Pre-built Skeleton Variants
 */

export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <Skeleton className="h-12 w-12 rounded-lg mb-4" />
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-gray-800">
        <Skeleton className="h-6 w-48" />
      </div>
      <div className="divide-y divide-gray-800">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <Skeleton className="h-6 w-48 mb-6" />
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => {
          const heights = [
            Math.random() * 80 + 20,
            Math.random() * 80 + 20,
            Math.random() * 80 + 20,
          ];
          return (
            <div key={i} className="flex items-end gap-2" style={{ height: '120px' }}>
              <div className="flex-1" style={{ height: `${heights[0]}%` }}>
                <Skeleton className="h-full" />
              </div>
              <div className="flex-1" style={{ height: `${heights[1]}%` }}>
                <Skeleton className="h-full" />
              </div>
              <div className="flex-1" style={{ height: `${heights[2]}%` }}>
                <Skeleton className="h-full" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-4"
        >
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-8 w-24" />
        </div>
      ))}
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-6">
      <Skeleton className="h-8 w-48 mb-6" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="flex gap-3 pt-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}

export default LoadingState;
