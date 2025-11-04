'use client';

import ProfessionalSidebar from '@/components/ProfessionalSidebar';
import CommandPalette from '@/components/CommandPalette';
import { ToastProvider } from '@/components/Toast';
import ErrorBoundary from '@/components/features/ErrorBoundary';
import { WavyBackground } from '@/components/ui/wavy-background';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <WavyBackground 
          containerClassName="min-h-screen relative w-full"
          className="w-full min-h-screen"
        >
          <div className="relative z-10 min-h-screen">
            <ProfessionalSidebar />
            {/* Main content area with left padding for sidebar */}
            <div className="pl-64 w-full overflow-y-auto">
              <CommandPalette />
              {children}
            </div>
          </div>
        </WavyBackground>
      </ToastProvider>
    </ErrorBoundary>
  );
}
