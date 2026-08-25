'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Vazirmatn } from 'next/font/google';

const vazirmatn = Vazirmatn({
    subsets: ['arabic'],
    display: 'swap',
});

const tabs = [
    {
        id: 'overview',
        label: 'نمای کلی',
        href: '/client/case',
    },
    {
        id: 'messages',
        label: 'پیام‌ها و تماس‌ها',
        href: '/client/case/messages',
    },
    {
        id: 'meetings',
        label: 'جلسات',
        href: '/client/case/meetings',
    },
    {
        id: 'tasks',
        label: 'کارها',
        href: '/client/case/tasks',
    },
    {
        id: 'documents',
        label: 'اسناد',
        href: '/client/case/documents',
    },
    {
        id: 'contract',
        label: 'قرارداد',
        href: '/client/case/contract',
    },
    {
        id: 'collaboration',
        label: 'وضعیت همکاری',
        href: '/client/case/collaboration',
    },
];

const CaseTabs = () => {
    const pathname = usePathname();

    return (
        <nav
            dir="ltr"
            className={`${vazirmatn.className} mb-5 overflow-x-auto rounded-[17px] border border-[#dfe7e4] bg-white p-1.5 shadow-[0_3px_15px_rgba(18,63,55,0.035)]`}
        >
            <div className="flex min-w-max items-center justify-end gap-1">
                {tabs.map((tab) => {
                    const active =
                        tab.id === 'overview'
                            ? pathname === '/client/case'
                            : pathname.startsWith(tab.href);

                    return (
                        <Link
                            key={tab.id}
                            href={tab.href}
                            className={`rounded-[12px] px-5 py-2.5 font-bold transition-all ${
                                active
                                    ? 'bg-[#123f37] text-white shadow-[0_5px_14px_rgba(18,63,55,0.16)]'
                                    : 'text-[#52645f] hover:bg-[#f1f5f3] hover:text-[#123f37]'
                            }`}
                        >
                            {tab.label}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};

export default CaseTabs;
