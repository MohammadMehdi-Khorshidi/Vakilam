'use client';

import { LogOut } from 'lucide-react';

const LogoutButton = () => {
    return (
        <button
            type="button"
            className="group flex min-h-[48px] w-full items-center gap-3 rounded-xl px-3 text-[14px] font-semibold text-white/70 transition-colors duration-200 hover:bg-white/[0.06] hover:text-white"
        >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.07] text-black transition-all duration-200 group-hover:border group-hover:border-[#c9a96e] group-hover:bg-[#c9a96e] group-hover:text-black">
                <LogOut size={19} strokeWidth={1.8} />
            </span>

            <span>خروج از حساب</span>
        </button>
    );
};

export default LogoutButton;
