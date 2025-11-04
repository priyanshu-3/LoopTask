import { useState, useCallback, useRef } from 'react';
import { useToast } from '@/components/Toast';

export interface OptimisticUpdate<T> {
  id: string;
  data: T;
  pending: boolean;
}

export interface UseOptimisticOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error, rollbackData: T) => void;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
}

/**
 * useOptimistic Hook
 * Implements optimistic UI updates with automatic rollback on failure
 */
export function useOptimistic<T extends { id?: string }>(
  initialData: T[],
  options: UseOptimisticOptions<T> = {}
) {
  const [data, setData] = useState<T[]>(initialData);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const rollbackRef = useRef<Map<string, T[]>>(new Map());
  const { showToast } = useToast();

  /**
   * Add item optimistically
   */
  const addOptimistic = useCallback(
    async (
      newItem: T,
      asyncFn: () => Promise<T>
    ): Promise<T | null> => {
      const tempId = newItem.id || `temp-${Date.now()}`;
      const itemWithId = { ...newItem, id: tempId } as T;

      // Save current state for rollback
      rollbackRef.current.set(tempId, [...data]);

      // Add item optimistically
      setData((prev) => [itemWithId, ...prev]);
      setPendingIds((prev) => new Set(prev).add(tempId));

      try {
        // Execute async operation
        const result = await asyncFn();

        // Replace temp item with real item
        setData((prev) =>
          prev.map((item) =>
            (item as any).id === tempId ? result : item
          )
        );

        // Remove from pending
        setPendingIds((prev) => {
          const next = new Set(prev);
          next.delete(tempId);
          return next;
        });

        // Clear rollback data
        rollbackRef.current.delete(tempId);

        // Show success toast
        if (options.showSuccessToast) {
          showToast({
            type: 'success',
            title: 'Success',
            message: 'Item created successfully',
          });
        }

        // Call success callback
        if (options.onSuccess) {
          options.onSuccess(result);
        }

        return result;
      } catch (error) {
        // Rollback on error
        const rollbackData = rollbackRef.current.get(tempId);
        if (rollbackData) {
          setData(rollbackData);
        }

        // Remove from pending
        setPendingIds((prev) => {
          const next = new Set(prev);
          next.delete(tempId);
          return next;
        });

        // Clear rollback data
        rollbackRef.current.delete(tempId);

        // Show error toast
        if (options.showErrorToast) {
          showToast({
            type: 'error',
            title: 'Error',
            message: error instanceof Error ? error.message : 'Failed to create item',
          });
        }

        // Call error callback
        if (options.onError) {
          options.onError(error as Error, itemWithId);
        }

        return null;
      }
    },
    [data, options, showToast]
  );

  /**
   * Update item optimistically
   */
  const updateOptimistic = useCallback(
    async (
      id: string,
      updates: Partial<T>,
      asyncFn: () => Promise<T>
    ): Promise<T | null> => {
      // Save current state for rollback
      rollbackRef.current.set(id, [...data]);

      // Update item optimistically
      setData((prev) =>
        prev.map((item) =>
          (item as any).id === id ? { ...item, ...updates } : item
        )
      );
      setPendingIds((prev) => new Set(prev).add(id));

      try {
        // Execute async operation
        const result = await asyncFn();

        // Update with real data
        setData((prev) =>
          prev.map((item) =>
            (item as any).id === id ? result : item
          )
        );

        // Remove from pending
        setPendingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });

        // Clear rollback data
        rollbackRef.current.delete(id);

        // Show success toast
        if (options.showSuccessToast) {
          showToast({
            type: 'success',
            title: 'Success',
            message: 'Item updated successfully',
          });
        }

        // Call success callback
        if (options.onSuccess) {
          options.onSuccess(result);
        }

        return result;
      } catch (error) {
        // Rollback on error
        const rollbackData = rollbackRef.current.get(id);
        if (rollbackData) {
          setData(rollbackData);
        }

        // Remove from pending
        setPendingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });

        // Clear rollback data
        rollbackRef.current.delete(id);

        // Show error toast
        if (options.showErrorToast) {
          showToast({
            type: 'error',
            title: 'Error',
            message: error instanceof Error ? error.message : 'Failed to update item',
          });
        }

        // Call error callback
        if (options.onError && rollbackData) {
          const originalItem = rollbackData.find((item) => (item as any).id === id);
          if (originalItem) {
            options.onError(error as Error, originalItem);
          }
        }

        return null;
      }
    },
    [data, options, showToast]
  );

  /**
   * Delete item optimistically
   */
  const deleteOptimistic = useCallback(
    async (
      id: string,
      asyncFn: () => Promise<void>
    ): Promise<boolean> => {
      // Save current state for rollback
      rollbackRef.current.set(id, [...data]);

      // Find the item to delete
      const itemToDelete = data.find((item) => (item as any).id === id);

      // Delete item optimistically
      setData((prev) => prev.filter((item) => (item as any).id !== id));
      setPendingIds((prev) => new Set(prev).add(id));

      try {
        // Execute async operation
        await asyncFn();

        // Remove from pending
        setPendingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });

        // Clear rollback data
        rollbackRef.current.delete(id);

        // Show success toast with undo option
        if (options.showSuccessToast) {
          showToast({
            type: 'success',
            title: 'Deleted',
            message: 'Item deleted successfully',
          });
        }

        return true;
      } catch (error) {
        // Rollback on error
        const rollbackData = rollbackRef.current.get(id);
        if (rollbackData) {
          setData(rollbackData);
        }

        // Remove from pending
        setPendingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });

        // Clear rollback data
        rollbackRef.current.delete(id);

        // Show error toast
        if (options.showErrorToast) {
          showToast({
            type: 'error',
            title: 'Error',
            message: error instanceof Error ? error.message : 'Failed to delete item',
          });
        }

        // Call error callback
        if (options.onError && itemToDelete) {
          options.onError(error as Error, itemToDelete);
        }

        return false;
      }
    },
    [data, options, showToast]
  );

  /**
   * Check if item is pending
   */
  const isPending = useCallback(
    (id: string) => {
      return pendingIds.has(id);
    },
    [pendingIds]
  );

  /**
   * Sync with server data
   */
  const sync = useCallback((serverData: T[]) => {
    setData(serverData);
    setPendingIds(new Set());
    rollbackRef.current.clear();
  }, []);

  return {
    data,
    addOptimistic,
    updateOptimistic,
    deleteOptimistic,
    isPending,
    sync,
    hasPending: pendingIds.size > 0,
  };
}

export default useOptimistic;
