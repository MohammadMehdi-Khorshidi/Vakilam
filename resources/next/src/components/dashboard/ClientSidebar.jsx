'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
    Home,
    ListChecks,
    BellRing,
    Scale,
    FilePlus2,
    BriefcaseBusiness,
    Users,
    MessageSquare,
    CalendarDays,
    FileText,
    FileSignature,
    LogOut,
    X,
} from 'lucide-react';

const menuItems = [
    {
        href: '/client',
        label: 'خانه',
        icon: Home,
    },
    {
        href: '/client/actions',
        label: 'مرکز اقدامات',
        icon: ListChecks,
    },
    {
        href: '/client/smart-box',
        label: 'صندوق هوشمند',
        icon: BellRing,
    },
    {
        href: '/client/legal-assistant',
        label: 'دستیار حقوقی',
        icon: Scale,
    },
    {
        href: '/client/new-case',
        label: 'شرح مسئله جدید',
        icon: FilePlus2,
    },
    {
        href: '/client/cases',
        label: 'پرونده‌های من',
        icon: BriefcaseBusiness,
    },
    {
        href: '/client/lawyers',
        label: 'همه وکلا',
        icon: Users,
    },
    {
        href: '/client/suggestions',
        label: 'پیشنهادها',
        icon: FileText,
    },
    {
        href: '/client/messages',
        label: 'پیام‌ها و تماس‌ها',
        icon: MessageSquare,
    },
    {
        href: '/client/sessions',
        label: 'جلسات',
        icon: CalendarDays,
    },
    {
        href: '/client/documents',
        label: 'اسناد',
        icon: FileText,
    },
    {
        href: '/client/contracts',
        label: 'قرارداد و پرداخت',
        icon: FileSignature,
    },
];

const ClientSidebar = ({ mobileOpen, setMobileOpen }) => {
    const pathname = usePathname();

    return (
        <>
            {/* ================= Mobile Overlay ================= */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/40 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* ================= Sidebar ================= */}
            <aside
                className={`
                    fixed inset-y-0 right-0 z-50
                    flex w-[280px] flex-col
                    bg-[#073b33] text-white shadow-2xl
                    transition-transform duration-300 ease-in-out

                    lg:translate-x-0
                    ${
                    mobileOpen
                        ? 'translate-x-0'
                        : 'translate-x-full'
                }
                `}
            >
                {/* ================= Logo ================= */}
                <div className="flex h-[92px] items-center justify-between border-b border-white/10 px-5">
                    <Link
                        href="/"
                        className="text-3xl font-black tracking-tight"
                        onClick={() => setMobileOpen(false)}
                    >
                        وکیـل<span className="text-[#c5a35a]">م</span>
                    </Link>

                    {/* Close button - Mobile */}
                    <button
                        type="button"
                        onClick={() => setMobileOpen(false)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white transition hover:bg-white/15 lg:hidden"
                    >
                        <X size={19} />
                    </button>
                </div>

                {/* ================= Role ================= */}
                <div className="border-b border-white/10 px-5 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] text-white/40">
                                نقش فعلی
                            </p>

                            <p className="mt-1 text-sm font-bold">
                                موکل
                            </p>
                        </div>

                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 font-bold text-[#c5a35a]">
                            م
                        </div>
                    </div>
                </div>

                {/* ================= Menu ================= */}
                <nav className="flex-1 overflow-y-auto px-3 py-4">
                    <div className="space-y-1">
                        {menuItems.map((item) => {
                            const Icon = item.icon;

                            const active =
                                pathname === item.href ||
                                (item.href !== '/client' &&
                                    pathname.startsWith(item.href));

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() =>
                                        setMobileOpen(false)
                                    }
                                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                                        active
                                            ? 'bg-[#c5a35a] text-[#123f37]'
                                            : 'text-white/75 hover:bg-white/10 hover:text-white'
                                    }`}
                                >
                                    <span
                                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                                            active
                                                ? 'bg-[#e8d39a]'
                                                : 'bg-white/5'
                                        }`}
                                    >
                                        <Icon
                                            size={17}
                                            strokeWidth={1.8}
                                        />
                                    </span>

                                    <span className="flex-1">
                                        {item.label}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* ================= Privacy ================= */}
                <div className="px-4 pb-3">
                    <div className="rounded-xl border border-[#c5a35a]/30 bg-white/5 p-4">
                        <p className="text-xs font-bold text-[#e6d29a]">
                            حریم خصوصی
                        </p>

                        <p className="mt-2 text-[10px] leading-5 text-white/50">
                            داده‌های پرونده‌ها برای آموزش عمومی هوش مصنوعی
                            استفاده نمی‌شوند.
                        </p>
                    </div>
                </div>

                {/* ================= Logout ================= */}
                <div className="border-t border-white/10 px-4 py-4">
                    <button
                        type="button"
                        className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-sm text-white/70 hover:bg-white/10 hover:text-white"
                    >
                        <span>خروج از نمایش</span>

                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
                            <LogOut size={17} />
                        </span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default ClientSidebar;
