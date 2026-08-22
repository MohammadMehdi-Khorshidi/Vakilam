'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
    LayoutDashboard,
    Users,
    BriefcaseBusiness,
    ShieldCheck,
    FileText,
    BarChart3,
    Settings,
} from 'lucide-react';

const menuItems = [
    {
        title: 'داشبورد',
        href: '/dashboard/admin',
        icon: LayoutDashboard,
    },
    {
        title: 'مدیریت کاربران',
        href: '/dashboard/admin/users',
        icon: Users,
    },
    {
        title: 'مدیریت وکلا',
        href: '/dashboard/admin/lawyers',
        icon: BriefcaseBusiness,
    },
    {
        title: 'مدیریت پرونده‌ها',
        href: '/dashboard/admin/cases',
        icon: FileText,
    },
    {
        title: 'گزارش‌ها',
        href: '/dashboard/admin/reports',
        icon: BarChart3,
    },
    {
        title: 'امنیت',
        href: '/dashboard/admin/security',
        icon: ShieldCheck,
    },
    {
        title: 'تنظیمات',
        href: '/dashboard/admin/settings',
        icon: Settings,
    },
];

export default function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed right-0 top-0 z-40 hidden h-screen w-[280px] border-l border-[#e3e8e5] bg-white lg:block">
            <div className="flex h-full flex-col">
                <div className="flex h-[76px] items-center border-b border-[#e3e8e5] px-6">
                    <h2 className="text-xl font-extrabold text-[#123f37]">
                        وکیلم
                    </h2>
                </div>

                <div className="mx-4 mt-5 rounded-xl bg-[#f3f7f5] px-4 py-3">
                    <p className="text-xs text-gray-500">پنل مدیریت</p>

                    <p className="mt-1 font-bold text-[#123f37]">ادمین</p>
                </div>

                <nav className="mt-5 flex-1 space-y-1 px-4">
                    {menuItems.map((item) => {
                        const Icon = item.icon;

                        const active =
                            pathname === item.href ||
                            pathname.startsWith(`${item.href}/`);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                                    active
                                        ? 'bg-[#123f37] text-white'
                                        : 'text-[#123f37] hover:bg-[#f3f7f5]'
                                }`}
                            >
                                <Icon size={19} strokeWidth={1.8} />

                                <span>{item.title}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </aside>
    );
}
