'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const LogoutButton = ({ onLogout }) => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleLogout = async () => {
        const token = localStorage.getItem('token');

        // اگر توکن نداشتیم، مستقیم می‌رویم صفحه ورود
        if (!token) {
            localStorage.removeItem('token');
            router.push('/login');
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                'http://127.0.0.1:8000/api/auth/logout',
                {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            const data = await response.json();

            console.log('Logout Response:', data);

            if (!response.ok) {
                console.error('Logout failed:', data);
                return;
            }

            // حذف توکن
            localStorage.removeItem('token');

            // اگر Sidebar نیاز داشت بسته شود
            if (onLogout) {
                onLogout();
            }

            // رفتن به صفحه ورود
            router.push('/login');
        } catch (error) {
            console.error('Logout Error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handleLogout}
            disabled={loading}
            className="group flex min-h-[48px] w-full items-center gap-3 rounded-xl px-3 text-[14px] font-semibold text-white/70 transition-colors duration-200 hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.07] text-black transition-all duration-200 group-hover:border group-hover:border-[#c9a96e] group-hover:bg-[#c9a96e] group-hover:text-black">
                <LogOut size={19} strokeWidth={1.8} />
            </span>

            <span>{loading ? 'در حال خروج...' : 'خروج از حساب'}</span>
        </button>
    );
};

export default LogoutButton;
