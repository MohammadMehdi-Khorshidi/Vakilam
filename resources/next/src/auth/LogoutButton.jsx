'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/auth/AuthProvider';

const LogoutButton = ({ onLogout }) => {
    const router = useRouter();
    const { logout } = useAuth();
    const [loading, setLoading] = useState(false);

    async function handleLogout() {
        if (loading) return;
        setLoading(true);
        try {
            await logout();
            onLogout?.();
            router.replace('/');
            router.refresh();
        } finally {
            setLoading(false);
        }
    }

    return (
        <button
            type="button"
            onClick={handleLogout}
            disabled={loading}
            className="group flex min-h-[48px] w-full items-center gap-3 rounded-xl px-3 text-[14px] font-semibold text-white/70 transition-colors duration-200 hover:bg-white/[0.06] hover:text-white disabled:cursor-wait disabled:opacity-60"
        >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.07] text-black transition-all duration-200 group-hover:border group-hover:border-[#c9a96e] group-hover:bg-[#c9a96e] group-hover:text-black">
                <LogOut size={19} strokeWidth={1.8} />
            </span>
            <span>{loading ? 'در حال خروج...' : 'خروج از حساب'}</span>
        </button>
    );
};

export default LogoutButton;
