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

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700'],
});

const DashboardHeader = ({ mobileOpen, setMobileOpen }) => {
    const pathname = usePathname();

    const [roleMenuOpen, setRoleMenuOpen] = useState(false);



    const getRole = () => {
        if (
            pathname?.startsWith('/dashboard/lawyer') ||
            pathname?.startsWith('/lawyer')
        ) {
            return 'lawyer';
        }

        if (
            pathname?.startsWith('/dashboard/admin') ||
            pathname?.startsWith('/admin')
        ) {
            return 'admin';
        }

        return 'client';
    };

    const role = getRole();

    const currentRole = roleLabels?.[role] || 'موکل';



    const roles = [
        {
            key: 'client',
            label: 'موکل',
            description: 'داشبورد موکل',
            href: '/dashboard/client',
            icon: UserRound,
        },
        {
            key: 'lawyer',
            label: 'وکیل',
            description: 'داشبورد وکیل',
            href: '/dashboard/lawyer',
            icon: Scale,
        },
        {
            key: 'admin',
            label: 'مدیر سامانه',
            description: 'داشبورد مدیریت',
            href: '/dashboard/admin',
            icon: ShieldCheck,
        },
    ];

    const [modeMenuOpen, setModeMenuOpen] = useState(false);
    const [currentMode, setCurrentMode] = useState('عادی');

    const modes = [
        {
            key: 'normal',
            label: 'عادی',
            description: 'استفاده معمولی از سامانه',
        },
        {
            key: 'test',
            label: 'آزمایشی',
            description: 'محیط تست سامانه',
        },
        {
            key: 'preview',
            label: 'نمایش',
            description: 'فقط مشاهده و بررسی',
        },
    ];
    return (
        <header
            dir="rtl"
            className={`${vazir.className} sticky top-0 z-40 h-[80px] w-full border-b border-[#e7ebe9] bg-white`}
        >
            <div className="flex h-full w-full items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center">
                    <button
                        type="button"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="mr-3 flex h-9 w-9 items-center justify-center rounded-lg border border-[#e4e9e6] text-[#123f37] transition hover:bg-[#f5f8f6] lg:hidden"
                    >
                        <Menu size={19} strokeWidth={1.8} />
                    </button>

                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                            className="inline-flex shrink-0 items-center gap-3 rounded-2xl bg-[#c9a96e] px-5 py-3 text-sm font-bold text-[#0d302a] transition-all duration-300 hover:-translate-y-1 hover:bg-[#d8bb82] hover:shadow-lg"
                        >
                            <div className="flex items-center gap-2 text-right leading-none">
                                <p className="font-medium text-black">
                                    نقش: {currentRole}
                                </p>

                                <ChevronDown
                                    size={16}
                                    strokeWidth={2}
                                    className={`text-[#123f37] transition-transform duration-200 ${
                                        roleMenuOpen ? 'rotate-180' : ''
                                    }`}
                                />
                            </div>
                        </button>

                        {roleMenuOpen && (
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
                                                } `}
                                            >
                                                <div
                                                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                                                        isActive
                                                            ? 'bg-[#d7e4dc] text-[#123f37]'
                                                            : 'bg-[#f1f4f2] text-[#78827d]'
                                                    } `}
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
                                                        } `}
                                                    >
                                                        {item.label}
                                                    </p>

                                                    <p className="mt-1 text-[9px] text-[#9da6a2]">
                                                        {item.description}
                                                    </p>
                                                </div>

                                                {/* Active Dot */}

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

                <div className="flex items-center gap-2">
                    <div className="relative hidden sm:block">
                        <button
                            type="button"
                            onClick={() => setModeMenuOpen(!modeMenuOpen)}
                            className="inline-flex shrink-0 items-center gap-3 rounded-2xl bg-[#c9a96e] px-5 py-3 text-sm font-bold text-[#0d302a] transition-all duration-300 hover:-translate-y-1 hover:bg-[#d8bb82] hover:shadow-lg"
                        >
                            <span className="h-[7px] w-[7px] rounded-full bg-[#0d302a]" />

                            <span className="text-[10px] font-medium text-black">
                                حالت آزمایشی
                            </span>

                            <span className="mr-1 text-[10px] text-black">
                                {currentMode}
                            </span>

                            <ChevronDown
                                size={12}
                                strokeWidth={1.8}
                                className={`text-black transition-transform ${
                                    modeMenuOpen ? 'rotate-180' : ''
                                }`}
                            />
                        </button>

                        {modeMenuOpen && (
                            <div className="absolute left-0 top-[calc(100%+10px)] z-50 w-[220px] overflow-hidden rounded-2xl border border-[#e3e9e5] bg-white p-2 shadow-[0_15px_45px_rgba(18,63,55,0.13)]">
                                <div className="px-3 pb-2 pt-2">
                                    <p className="text-[11px] font-bold text-[#123f37]">
                                        حالت سامانه
                                    </p>

                                    <p className="mt-1 text-[9px] text-[#9aa49f]">
                                        حالت مورد نظر خود را انتخاب کنید
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    {modes.map((mode) => {
                                        const isActive =
                                            currentMode === mode.label;

                                        return (
                                            <button
                                                key={mode.key}
                                                type="button"
                                                onClick={() => {
                                                    setCurrentMode(mode.label);
                                                    setModeMenuOpen(false);
                                                }}
                                                className={`flex w-full items-center gap-3 rounded-xl p-2.5 text-right transition ${
                                                    isActive
                                                        ? 'bg-[#edf3ef]'
                                                        : 'hover:bg-[#f6f8f7]'
                                                }`}
                                            >
                                                <span
                                                    className={`h-2 w-2 shrink-0 rounded-full ${
                                                        isActive
                                                            ? 'bg-[#6d9a78]'
                                                            : 'bg-[#cbd2ce]'
                                                    }`}
                                                />

                                                <div className="flex-1">
                                                    <p
                                                        className={`text-[10px] font-bold ${
                                                            isActive
                                                                ? 'text-[#123f37]'
                                                                : 'text-[#4d5752]'
                                                        }`}
                                                    >
                                                        {mode.label}
                                                    </p>

                                                    <p className="mt-1 text-[9px] text-[#9da6a2]">
                                                        {mode.description}
                                                    </p>
                                                </div>

                                                {isActive && (
                                                    <span className="h-1.5 w-1.5 rounded-full bg-[#c9a96e]" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        type="button"
                        className="relative flex h-[38px] w-[38px] items-center justify-center rounded-xl bg-[#c9a96e] text-[#0d302a] transition-all duration-300 hover:-translate-y-1 hover:bg-[#d8bb82] hover:shadow-lg"
                    >
                        <Bell size={18} strokeWidth={1.8} />

                        <span className="absolute right-[8px] top-[7px] h-[6px] w-[6px] rounded-full bg-[#123f37]" />
                    </button>

                    <button
                        type="button"
                        className="flex h-[42px] items-center gap-2 rounded-xl bg-[#c9a96e] px-2 text-[#0d302a] transition-all duration-300 hover:-translate-y-1 hover:bg-[#d8bb82] hover:shadow-lg"
                    >
                        <div className="flex h-[32px] w-[32px] items-center justify-center rounded-lg bg-[#edf2ef] text-[12px] font-bold text-[#123f37]">
                            ف
                        </div>

                        <div className="hidden min-w-[65px] text-right sm:block">
                            <p className="text-[8px] font-medium text-[#123f37]">
                                {currentRole}
                            </p>

                            <p className="mt-0.5 text-[10px] font-bold text-[#123f37]">
                                فرزام نفعی
                            </p>
                        </div>

                        <ChevronDown
                            size={12}
                            strokeWidth={1.8}
                            className="text-[#123f37]"
                        />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default DashboardHeader;
