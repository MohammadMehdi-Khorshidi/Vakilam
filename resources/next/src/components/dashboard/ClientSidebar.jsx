'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';


import {
    House,
    ListTodo,
    Bell,
    Bot,
    FilePlus2,
    BriefcaseBusiness,
    UsersRound,
    ClipboardList,
    MessageSquareText,
    CalendarDays,
    Files,
    FilePenLine,
    LogOut,
    X,
} from 'lucide-react';

import photoSaidbar from '@/assets/images/photoSaidbar.svg';
import saidbar from '@/assets/images/saidbar.svg';
import { Vazirmatn } from 'next/font/google';

const menuItems = [
    {
        href: '/client',
        label: 'خانه',
        icon: House,
    },
    {
        href: '/client/actions',
        label: 'مرکز اقدامات',
        icon: ListTodo,
    },
    {
        href: '/client/smart-box',
        label: 'صندوق هوشمند',
        icon: Bell,
    },
    {
        href: '/client/legal-assistant',
        label: 'دستیار حقوقی',
        icon: Bot,
    },
    {
        href: '/client/legal-request',
        label: 'شرح مسئله جدید',
        icon: FilePlus2,
    },
    {
        href: '/client/cases',
        label: 'پرونده‌های من',
        icon: BriefcaseBusiness,
    },
    {
        href: '/client/lawyersAdmin',
        label: 'همه وکلا',
        icon: UsersRound,
    },
    {
        href: '/client/suggestions',
        label: 'پیشنهادها',
        icon: ClipboardList,
    },
    {
        href: '/client/messages',
        label: 'پیام‌ها و تماس‌ها',
        icon: MessageSquareText,
    },
    {
        href: '/client/sessions',
        label: 'جلسات',
        icon: CalendarDays,
    },
    {
        href: '/client/documents',
        label: 'اسناد',
        icon: Files,
    },
    {
        href: '/client/contracts',
        label: 'قرارداد و پرداخت',
        icon: FilePenLine,
    },
];
const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700'],
});
const ClientSidebar = ({ mobileOpen, setMobileOpen }) => {
    const pathname = usePathname();

    const closeSidebar = () => {
        setMobileOpen(false);
    };

    return (
        <>
            {/* ================= Mobile Overlay ================= */}
            {mobileOpen && (
                <button
                    type="button"
                    aria-label="بستن منو"
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] lg:hidden"
                    onClick={closeSidebar}
                />
            )}

            {/* ================= Sidebar ================= */}
            <aside
                dir="rtl"
                className={`${vazir.className} fixed right-0 top-[80px] z-40 flex h-[calc(100vh-80px)] w-[270px] flex-col overflow-hidden border-l border-white/[0.06] bg-[radial-gradient(circle_at_20%_0,#c5a35a2e,#0000_24%),linear-gradient(#174b42_0%,#0e332d_55%,#092620_100%)] text-white shadow-[-8px_0_35px_#08231f14] transition-transform duration-300 ease-in-out lg:sticky lg:top-0 lg:z-30 lg:h-[calc(100vh-80px)] lg:translate-x-0 lg:self-start ${
                    mobileOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                {/* ================= Logo ================= */}
                <div className="relative flex h-[92px] shrink-0 items-center justify-center border-b border-white/10">
                    <Link
                        href="/"
                        onClick={closeSidebar}
                        className="flex items-center justify-center gap-2"
                        aria-label="وکیلم"
                    >
                        <Image
                            src={saidbar}
                            alt="وکیلم"
                            width={105}
                            height={48}
                            priority
                            className="h-[48px] w-auto object-contain"
                        />

                        <Image
                            src={photoSaidbar}
                            alt=""
                            width={32}
                            height={42}
                            priority
                            className="h-[42px] w-auto object-contain"
                        />
                    </Link>

                    {/* Mobile Close */}
                    <button
                        type="button"
                        aria-label="بستن منو"
                        onClick={() => setMobileOpen(false)}
                        className="absolute left-4 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl bg-white/10 transition hover:bg-white/15 lg:hidden"
                    >
                        <X size={19} strokeWidth={1.8} />
                    </button>
                </div>

                {/* ================= Menu ================= */}
                <nav className="sidebar-scrollbar flex-1 overflow-y-auto py-5">
                    <ul className="space-y-1">
                        {menuItems.map((item) => {
                            const Icon = item.icon;

                            const active =
                                pathname === item.href ||
                                (item.href !== '/client' &&
                                    pathname.startsWith(`${item.href}/`));

                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        onClick={closeSidebar}
                                        aria-current={
                                            active ? 'page' : undefined
                                        }
                                        className={`group relative flex min-h-[48px] items-center gap-3 rounded-2xl px-4 pr-5 text-[14px] font-semibold transition-all duration-200 ${
                                            active
                                                ? 'bg-[#405f4e] text-white'
                                                : 'text-white/75 hover:bg-[#405f4e] hover:text-white'
                                        } `}
                                    >
                                        {/* خط طلایی سمت راست */}
                                        <span
                                            className={`absolute right-2 top-1/2 h-[32px] w-[3px] -translate-y-1/2 rounded-b-full bg-[#c9a96e] transition-all duration-200 ${
                                                active
                                                    ? 'opacity-100'
                                                    : 'opacity-0 group-hover:opacity-100'
                                            } `}
                                        />

                                        {/* Icon Box */}
                                        <span
                                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl transition-all duration-200 ${
                                                active
                                                    ? `border border-[#c9a96e] bg-[#c9a96e] text-black shadow-[0_4px_12px_rgba(201,169,110,0.22)]`
                                                    : `border border-transparent bg-white/[0.07] text-black group-hover:border-[#c9a96e] group-hover:bg-[#c9a96e] group-hover:text-black group-hover:shadow-[0_4px_12px_rgba(201,169,110,0.18)]`
                                            } `}
                                        >
                                            <Icon size={19} strokeWidth={1.8} />
                                        </span>

                                        {/* Label */}
                                        <span className="flex-1">
                                            {item.label}
                                        </span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* ================= Privacy ================= */}
                <div className="shrink-0 px-4 pb-3 pt-2">
                    <div className="rounded-2xl border border-[#a5822e]/55 bg-white/[0.035] px-4 py-5 text-center">
                        <p className="text-[14px] font-bold text-[#e4c66f]">
                            حریم خصوصی
                        </p>

                        <p className="mt-2 text-[11px] leading-6 text-white/55">
                            داده خصوصی پرونده‌ها برای آموزش عمومی هوش مصنوعی
                            استفاده نمی‌شود.
                        </p>
                    </div>
                </div>

                {/* ================= Logout ================= */}
                <div className="shrink-0 px-4 pb-4">
                    <button
                        type="button"
                        className="group flex min-h-[48px] w-full items-center gap-3 rounded-xl px-3 text-[14px] font-semibold text-white/70 transition-colors duration-200 hover:bg-white/[0.06] hover:text-white"
                    >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.07] text-black transition-all duration-200 group-hover:border group-hover:border-[#c9a96e] group-hover:bg-[#c9a96e] group-hover:text-black">
                            <LogOut size={19} strokeWidth={1.8} />
                        </span>

                        <span>خروج نمایشی</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default ClientSidebar;
