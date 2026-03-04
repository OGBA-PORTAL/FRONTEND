'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/lib/types';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: UserRole[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading, hasRole } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return;

        if (!isAuthenticated) {
            router.replace('/login');
            return;
        }

        if (allowedRoles && !hasRole(...allowedRoles)) {
            // Redirect to the appropriate dashboard based on role
            if (hasRole('SYSTEM_ADMIN', 'ASSOCIATION_OFFICER')) {
                router.replace('/dashboard/admin');
            } else if (hasRole('CHURCH_ADMIN')) {
                router.replace('/dashboard/church-admin');
            } else {
                router.replace('/dashboard/student');
            }
        }
    }, [isAuthenticated, isLoading, allowedRoles, hasRole, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center gradient-blue">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-white/80 text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) return null;
    if (allowedRoles && !hasRole(...allowedRoles)) return null;

    return <>{children}</>;
}
