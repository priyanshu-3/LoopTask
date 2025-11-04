'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import Button from './Button';

export default function Navbar() {
    const { data: session } = useSession();

    return (
        <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xl">L</span>
                        </div>
                        <span className="text-xl font-bold text-white">LoopTask</span>
                    </Link>

                    <div className="flex items-center space-x-4">
                        {/* DEMO MODE: Always show dashboard link */}
                        <Link href="/dashboard">
                            <Button variant="outline" size="sm">Dashboard</Button>
                        </Link>
                        
                        {session ? (
                            <div className="flex items-center space-x-3">
                                <span className="text-gray-300 text-sm">{session.user?.name}</span>
                                <Button variant="secondary" size="sm" onClick={() => signOut()}>
                                    Sign Out
                                </Button>
                            </div>
                        ) : (
                            <Link href="/login">
                                <Button variant="primary" size="sm">Sign In</Button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
