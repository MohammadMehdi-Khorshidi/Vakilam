'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Vazirmatn } from 'next/font/google';
import {
    Activity,
    BadgeCheck,
    CalendarClock,
    FileText,
    House,
    ShieldCheck,
    UsersRound,
    X,
} from 'lucide-react';

import photoSaidbar from '@/assets/images/photoSaidbar.svg';
import saidbar from '@/assets/images/saidbar.svg';
import LogoutButton from '@/features/auth/LogoutButton';
import { useAuthSession } from '@/hooks/useAuthenticatedUser';
import { getUserRoles } from '@/lib/api/auth';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700'],
});

export default function AdminSidebar({ mobileOpen, setMobileOpen }) {
    const pathname = usePathname();
    const { user } = useAuthSession();
    const isSuperAdmin = getUserRoles(user).includes('super_admin');

    const menuItems = [
        { href: '/admin', label: 'خانه مدیریت', icon: House },
        { href: '/admin/lawyersAdmin', label: 'بررسی وکلا', icon: BadgeCheck },
        { href: '/admin/usersAdmin', label: 'کاربران', icon: UsersRound },
        { href: '/admin/legal-requests', label: 'درخواست‌های حقوقی', icon: FileText },
        { href: '/admin/consultations', label: 'مشاوره‌ها', icon: CalendarClock },
        { href: '/admin/activity', label: 'لاگ مدیریتی', icon: Activity },
        ...(isSuperAdmin
            ? [{ href: '/admin/admins', label: 'مدیران سامانه', icon: ShieldCheck }]
            : []),
    ];

    const closeSidebar = () => setMobileOpen(false);

    return (
        <>
            {mobileOpen ? (
                <button
                    type="button"
                    aria-label="بستن منو"
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] lg:hidden"
                    onClick={closeSidebar}
                />
            ) : null}

            <aside
                dir="rtl"
                className={`${vazir.className} fixed right-0 top-0 z-50 flex h-screen w-[270px] flex-col overflow-hidden border-l border-white/[0.06] bg-[radial-gradient(circle_at_20%_0,#c5a35a2e,#0000_24%),linear-gradient(#174b42_0%,#0e332d_55%,#092620_100%)] text-white transition-transform duration-300 lg:sticky lg:z-30 lg:translate-x-0 ${
                    mobileOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                <div className="relative flex h-[92px] shrink-0 items-center justify-center border-b border-white/10">
                    <Link href="/admin" onClick={closeSidebar} className="flex items-center gap-2">
                        <Image src={saidbar} alt="وکیلم" width={105} height={48} className="h-[48px] w-auto" />
                        <Image src={photoSaidbar} alt="" width={32} height={42} className="h-[42px] w-auto" />
                    </Link>
                    <button type="button" aria-label="بستن منو" onClick={closeSidebar} className="absolute left-4 rounded-xl bg-white/10 p-2 lg:hidden">
                        <X size={19} />
                    </button>
                </div>

                <div className="mx-4 mt-4 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3">
                    <p className="text-xs text-white/55">سطح دسترسی</p>
                    <p className="mt-1 text-sm font-black text-[#e2c270]">
                        {isSuperAdmin ? 'سوپر ادمین' : 'ادمین'}
                    </p>
                </div>

                <nav className="sidebar-scrollbar flex-1 overflow-y-auto py-4">
                    <ul className="space-y-1 px-2">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const active =
                                pathname === item.href ||
                                (item.href !== '/admin' && pathname.startsWith(`${item.href}/`));

                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        onClick={closeSidebar}
                                        className={`group relative flex min-h-[48px] items-center gap-3 rounded-2xl px-4 pr-5 text-[14px] font-semibold transition ${
                                            active
                                                ? 'bg-[#405f4e] text-white'
                                                : 'text-white/75 hover:bg-[#405f4e] hover:text-white'
                                        }`}
                                    >
                                        <span className={`absolute right-2 h-8 w-[3px] rounded-full bg-[#c9a96e] ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                                        <span className={`flex h-9 w-9 items-center justify-center rounded-2xl ${active ? 'bg-[#c9a96e] text-black' : 'bg-white/[0.07] group-hover:bg-[#c9a96e] group-hover:text-black'}`}>
                                            <Icon size={19} />
                                        </span>
                                        <span>{item.label}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div className="shrink-0 px-4 pb-4">
                    <LogoutButton onLogout={closeSidebar} />
                </div>
            </aside>
        </>
    );
}
