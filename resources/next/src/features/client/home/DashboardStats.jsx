'use client';

import { Vazirmatn } from 'next/font/google';

import {
    BriefcaseBusiness,
    ListTodo,
    FileText,
    Bell,
    ArrowLeft,
} from 'lucide-react';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

const stats = [
    {
        title: 'پرونده فعال',
        value: '۱',
        description: 'در حال انتخاب وکیل',
        icon: BriefcaseBusiness,
    },
    {
        title: 'اقدام در انتظار',
        value: '۳',
        description: 'یک مورد فوری',
        icon: ListTodo,
    },
    {
        title: 'پیشنهاد جدید',
        value: '۳',
        description: 'آماده مقایسه',
        icon: FileText,
    },
    {
        title: 'پیام خوانده نشده',
        value: '۲',
        description: 'در صندوق هوشمند',
        icon: Bell,
    },
];

const DashboardStats = () => {
    return (
        <section
            dir="rtl"
            className={`${vazir.className} grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4`}
        >
            {stats.map((item) => {
                const Icon = item.icon;

                return (
                    <div
                        key={item.title}
                        className="group relative overflow-hidden rounded-2xl border border-[#dfe8e3] bg-white px-5 py-5 shadow-[0_4px_20px_rgba(13,48,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-[#60736d]">
                                    {item.title}
                                </p>

                                <div className="mt-2 text-2xl font-bold text-[#0d302a]">
                                    {item.value}
                                </div>

                                <p className="mt-1 text-xs text-[#8b9995]">
                                    {item.description}
                                </p>
                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f4f0e5] text-[#0d302a]">
                                <Icon size={20} strokeWidth={1.8} />
                            </div>
                        </div>

                        <ArrowLeft
                            size={17}
                            className="absolute bottom-5 left-5 text-[#b28b43] transition group-hover:-translate-x-1"
                        />
                    </div>
                );
            })}
        </section>
    );
};

export default DashboardStats;
