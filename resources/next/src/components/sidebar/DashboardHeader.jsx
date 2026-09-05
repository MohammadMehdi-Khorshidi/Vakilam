'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { Vazirmatn } from 'next/font/google';

import {
    Bell,
    ChevronDown,
    Menu,
    UserRound,
    Scale,
    ShieldCheck,
} from 'lucide-react';

import { roleLabels } from '@/config/Navigation';
import useAuthenticatedUser, {
    getUserDisplayName,
    getUserInitial,
} from '@/hooks/useAuthenticatedUser';
import { getUserRoles } from '@/lib/api/auth';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700'],
});

const DashboardHeader = ({ mobileOpen, setMobileOpen }) => {
    const pathname = usePathname();
    const authenticatedUser = useAuthenticatedUser();

    const [roleMenuOpen, setRoleMenuOpen] = useState(false);
    const [notificationsOn, setNotificationsOn] = useState(true);

    // =========================
    // تشخیص نقش بر اساس URL
    // =========================
    const getRole = () => {
        if (pathname?.startsWith('/lawyer')) {
            return 'lawyer';
        }

        if (pathname?.startsWith('/admin')) {
            return 'admin';
        }

        return 'client';
    };

    const role = getRole();

    const currentRole = roleLabels?.[role] || 'موکل';

    const currentUser = {
        name: getUserDisplayName(authenticatedUser),
        initial: getUserInitial(authenticatedUser),
    };

    // =========================
    // نقش‌ها
    // =========================
    const roleOptions = [
        {
            key: 'client',
            label: 'موکل',
            description: 'داشبورد موکل',
            href: '/client',
            icon: UserRound,
        },
        {
            key: 'lawyer',
            label: 'وکیل',
            description: 'داشبورد وکیل',
            href: '/lawyer',
            icon: Scale,
        },
        {
            key: 'admin',
            label: 'مدیر سامانه',
            description: 'داشبورد مدیریت',
            href: '/admin',
            icon: ShieldCheck,
        },
    ];

    const userRoles = getUserRoles(authenticatedUser);
    const roles = roleOptions.filter(
        (item) =>
            userRoles.includes(item.key) ||
            (item.key === 'admin' && userRoles.includes('super_admin')),
    );
    const canSwitchRole = roles.length > 1;

    return (
        <header
            dir="rtl"
            className={`${vazir.className} fixed left-0 right-0 top-20 z-40 h-[80px] border-b border-[#e7ebe9] bg-white lg:right-[270px]`}
        >
            <div className="flex h-full w-full items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* ================= Right Side ================= */}
                <div className="flex items-center">
                    {/* Mobile Menu */}
                    <button
                        type="button"
                        onClick={() => setMobileOpen((prev) => !prev)}
                        className="mr-3 flex h-9 w-9 items-center justify-center rounded-lg border border-[#e4e9e6] text-[#123f37] transition hover:bg-[#f5f8f6] lg:hidden"
                    >
                        <Menu size={19} strokeWidth={1.8} />
                    </button>

                    {/* Role Selector */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => {
                                if (canSwitchRole) {
                                    setRoleMenuOpen((prev) => !prev);
                                }
                            }}
                            aria-expanded={canSwitchRole && roleMenuOpen}
                            className="inline-flex shrink-0 items-center gap-3 rounded-2xl bg-[#c9a96e] px-5 py-3 text-sm font-bold text-[#0d302a] transition-all duration-300 hover:-translate-y-1 hover:bg-[#d8bb82] hover:shadow-lg"
                        >
                            <div className="flex items-center gap-2 text-right leading-none">
                                <p className="font-medium text-black">
                                    نقش: {currentRole}
                                </p>

                                {canSwitchRole && (
                                    <ChevronDown
                                        size={16}
                                        strokeWidth={2}
                                        className={`text-[#123f37] transition-transform duration-200 ${
                                            roleMenuOpen ? 'rotate-180' : ''
                                        }`}
                                    />
                                )}
                            </div>
                        </button>

                        {/* Role Dropdown */}
                        {canSwitchRole && roleMenuOpen && (
                            <div className="absolute right-0 top-[calc(100%+12px)] z-50 w-[255px] overflow-hidden rounded-2xl border border-[#e3e9e5] bg-white p-2 shadow-[0_15px_45px_rgba(18,63,55,0.13)]">
                                <div className="px-3 pb-3 pt-2">
                                    <p className="text-[12px] font-bold text-[#123f37]">
                                        انتخاب نقش
                                    </p>

                                    <p className="mt-1 text-[10px] text-[#9aa49f]">
                                        داشبورد مورد نظر خود را انتخاب کنید
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    {roles.map((item) => {
                                        const Icon = item.icon;

                                        const isActive = role === item.key;

                                        return (
                                            <Link
                                                key={item.key}
                                                href={item.href}
                                                onClick={() =>
                                                    setRoleMenuOpen(false)
                                                }
                                                className={`flex items-center gap-3 rounded-xl p-2.5 transition-all duration-200 ${
                                                    isActive
                                                        ? 'bg-[#edf3ef]'
                                                        : 'hover:bg-[#f6f8f7]'
                                                }`}
                                            >
                                                <div
                                                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                                                        isActive
                                                            ? 'bg-[#d7e4dc] text-[#123f37]'
                                                            : 'bg-[#f1f4f2] text-[#78827d]'
                                                    }`}
                                                >
                                                    <Icon
                                                        size={17}
                                                        strokeWidth={1.8}
                                                    />
                                                </div>

                                                <div className="flex-1 text-right">
                                                    <p
                                                        className={`text-[11px] font-bold ${
                                                            isActive
                                                                ? 'text-[#123f37]'
                                                                : 'text-[#4d5752]'
                                                        }`}
                                                    >
                                                        {item.label}
                                                    </p>

                                                    <p className="mt-1 text-[9px] text-[#9da6a2]">
                                                        {item.description}
                                                    </p>
                                                </div>

                                                {isActive && (
                                                    <span className="h-1.5 w-1.5 rounded-full bg-[#c9a96e]" />
                                                )}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ================= Left Side ================= */}
                <div className="flex items-center gap-2">
                    {/* User */}
                    <button
                        type="button"
                        className="z-50 flex h-[42px] items-center gap-2 rounded-xl bg-[#c9a96e] px-2 text-[#0d302a] transition-all duration-300 hover:-translate-y-1 hover:bg-[#d8bb82] hover:shadow-lg"
                    >
                        {/* User Initial */}
                        <div className="flex h-[32px] w-[32px] items-center justify-center rounded-lg bg-[#edf2ef] text-[12px] font-bold text-[#123f37]">
                            {currentUser.initial}
                        </div>

                        {/* User Info */}
                        <div className="z-50 hidden min-w-[65px] text-right sm:block">
                            <p className="text-[8px] font-medium text-[#123f37]">
                                {currentRole}
                            </p>

                            <p className="z-50 mt-0.5 text-[10px] font-bold text-[#123f37]">
                                {currentUser.name}
                            </p>
                        </div>

                        <ChevronDown
                            size={12}
                            strokeWidth={1.8}
                            className="text-[#123f37]"
                        />
                    </button>

                    {/* Notifications */}
                    <button
                        type="button"
                        onClick={() => setNotificationsOn((prev) => !prev)}
                        className={`relative flex h-[38px] w-[38px] items-center justify-center rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                            notificationsOn
                                ? 'bg-[#c9a96e] text-[#0d302a] hover:bg-[#d8bb82]'
                                : 'bg-[#edf2ef] text-[#8a9690] hover:bg-[#e1e8e4]'
                        }`}
                    >
                        <Bell
                            size={18}
                            strokeWidth={1.8}
                            className={notificationsOn ? '' : 'opacity-50'}
                        />

                        <span
                            className={`absolute right-[7px] top-[6px] h-[6px] w-[6px] rounded-full ${
                                notificationsOn
                                    ? 'bg-[#123f37]'
                                    : 'bg-[#9aa49f]'
                            }`}
                        />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default DashboardHeader;
