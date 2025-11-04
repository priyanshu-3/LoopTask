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
          className="w-full"
        >
          <div className="relative z-10 flex min-h-screen">
            <ProfessionalSidebar />
            {/* Add proper left padding for desktop to account for sidebar */}
            <div className="lg:pl-64 flex-1">
              <CommandPalette />
              {children}
            </div>
          </div>
        </WavyBackground>
      </ToastProvider>
    </ErrorBoundary>
  );
}
