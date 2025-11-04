'use client';

import { SessionProvider } from 'next-auth/react';
import { useEffect } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize monitoring services on client side (optional)
    if (typeof window !== 'undefined') {
      // Delay monitoring initialization to avoid blocking render
      setTimeout(() => {
        try {
          import('@/lib/services/monitoring').then(({ monitoring }) => {
            monitoring.init();
          }).catch(() => {
            // Silently fail - monitoring is optional
          });

          import('@/lib/utils/performance').then(({ startPerformanceMonitoring }) => {
            startPerformanceMonitoring();
          }).catch(() => {
            // Silently fail - performance monitoring is optional
          });
        } catch (error) {
          // Silently fail - monitoring is optional
        }
      }, 1000);
    }
  }, []);

  return <SessionProvider>{children}</SessionProvider>;
}
