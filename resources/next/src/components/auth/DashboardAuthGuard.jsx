'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useAuthSession } from '@/hooks/useAuthenticatedUser';
import { dashboardForUser, getUserRoles } from '@/lib/api/auth';

export default function DashboardAuthGuard({ children, requiredRole }) {
    const pathname = usePathname();
    const router = useRouter();
    const { authenticated, ready, user } = useAuthSession();

    const roles = getUserRoles(user);
    const hasRequiredRole =
        !requiredRole ||
        roles.includes(requiredRole) ||
        (requiredRole === 'admin' && roles.includes('super_admin'));

    useEffect(() => {
        if (!ready) return;

        if (!authenticated) {
            const redirect = pathname ? `?redirect=${encodeURIComponent(pathname)}` : '';
            router.replace(`/login${redirect}`);
            return;
        }

        if (user && !hasRequiredRole) {
            router.replace(dashboardForUser(user));
        }
    }, [authenticated, hasRequiredRole, pathname, ready, router, user]);

    if (!ready || !authenticated || (user && !hasRequiredRole)) {
        return (
            <div
                dir="rtl"
                className="flex min-h-screen items-center justify-center bg-[#f8faf9] text-sm font-semibold text-[#56706a]"
            >
                در حال بازیابی حساب کاربری...
            </div>
        );
    }

    return children;
}
