'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardAuth({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  // DEMO MODE: Comment out authentication check for development
  // Uncomment these lines when OAuth is configured
  /*
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }
  */

  return <>{children}</>;
}

DashboardAuth.Header = function DashboardHeader() {
  const { data: session } = useSession();
  
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold mb-2 text-white">Welcome back, {session?.user?.name || 'Developer'}!</h1>
      <p className="text-gray-300">Here's your productivity overview</p>
    </div>
  );
};
