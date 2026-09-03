'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { dashboardPathForUser } from '@/lib/api/client';

export default function AuthGuard({ children, roles = [] }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const allowed = user && (roles.length === 0 || roles.includes(user.role));

    useEffect(() => {
        if (loading) return;

        if (!user) {
            router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
            return;
        }

        if (!allowed) router.replace(dashboardPathForUser(user));
    }, [allowed, loading, pathname, router, user]);

    if (loading || !allowed) {
        return (
            <div className="grid min-h-[60vh] place-items-center" dir="rtl">
                <p className="text-sm font-bold text-[#123c35]">در حال بررسی حساب کاربری...</p>
            </div>
        );
    }

    return children;
}
