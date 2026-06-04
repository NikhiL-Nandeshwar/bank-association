'use client'
import { ReactNode, useEffect } from 'react';
import { ROUTES } from '@/constants/routes.constants';
import { useAuth } from '@/lib/useAuth';
import { useRouter } from 'next/navigation';

type AdminGuardProps = {
    children: ReactNode;
};

/**
 * Higher-order component that guards admin routes by checking user authentication and role.
 * Redirects to login page if user is not authenticated or does not have admin role.
 * @param param0 
 * @returns 
 */
export function AdminGuard({ children }: AdminGuardProps) {
    const { user, status } = useAuth();
    console.log('user', user)
    const router = useRouter();

    console.log('USER:', user);
    console.log('ROLE:', user?.role);

    useEffect(() => {
        if (status === 'loading') return;

        if (status === 'unauthenticated' || user?.role !== 'ADMIN') {
            router.replace(ROUTES.login);
        }
    }, [status, user, router]);

    if (status === 'loading') return null;
    if (!user || user.role !== 'ADMIN') return null;

    return <>{children}</>;
}