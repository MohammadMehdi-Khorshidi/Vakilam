'use client';

import { Vazirmatn } from 'next/font/google';
import { ListTodo, Bell, MessageSquareText, ArrowLeft } from 'lucide-react';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

const actions = [
    {
        title: 'اقدام‌های امروز',
        description: 'کارهای ضروری را به‌ترتیب انجام دهید',
        icon: ListTodo,
    },
    {
        title: 'صندوق هوشمند',
        description: 'پیام‌ها و هشدارهای مهم یکجا',
        icon: Bell,
    },
    {
        title: 'پیام و تماس داخل وکیلم',
        description: 'ارتباط کنترل‌شده بدون نمایش اطلاعات تماس',
        icon: MessageSquareText,
    },
];

const QuickActions = () => {
    return (
        <section
            dir="rtl"
            className={`${vazir.className} grid grid-cols-1 gap-3 lg:grid-cols-3`}
        >
            {actions.map((item) => {
                const Icon = item.icon;

                return (
                    <button
                        type="button"
                        key={item.title}
                        className="group flex min-h-[88px] items-center justify-between rounded-2xl border border-[#dfe8e3] bg-white px-5 text-right transition hover:-translate-y-0.5 hover:border-[#c9a96e]/50 hover:shadow-md"
                    >
                        <div>
                            <h3 className="font-bold text-[#173f37]">
                                {item.title}
                            </h3>

                            <p className="mt-2 text-xs text-[#899792]">
                                {item.description}
                            </p>
                        </div>

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f6f1e5] text-[#173f37]">
                            <Icon size={20} strokeWidth={1.8} />
                        </div>

                        <ArrowLeft
                            size={17}
                            className="text-[#b28b43] transition group-hover:-translate-x-1"
                        />
                    </button>
                );
            })}
        </section>
    );
};

export default QuickActions;
