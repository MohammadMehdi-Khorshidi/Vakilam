'use client';

import { Vazirmatn } from 'next/font/google';
import { ArrowLeft, Bell } from 'lucide-react';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

const SmartBox = () => {
    const items = [
        {
            title: 'پیشنهاد جدید از وکیل سعادت',
            subtitle: 'پیشنهاد · ۱۳ دقیقه پیش',
        },
        {
            title: 'دو مورد از خلاصه پرونده نیازمند تأیید شماست',
            subtitle: 'هوش مصنوعی · ۴۵ دقیقه پیش',
        },
        {
            title: 'یادآوری محرمانگی مدارک پرونده',
            subtitle: 'امنیت · دیروز',
        },
    ];

    return (
        <section
            dir="rtl"
            className={`${vazir.className} rounded-2xl border border-[#dfe8e3] bg-white p-5 shadow-[0_4px_20px_rgba(13,48,42,0.035)]`}
        >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#edf1ef] pb-4">
                <h2 className="font-bold text-[#173f37]">صندوق هوشمند</h2>

                <button
                    type="button"
                    className="text-xs font-bold text-[#315e52] transition hover:text-[#b28b43]"
                >
                    مشاهده همه
                </button>
            </div>

            {/* Notifications */}
            <div className="mt-2">
                {items.map((item) => (
                    <button
                        type="button"
                        key={item.title}
                        className="group flex w-full items-center gap-4 border-b border-[#f0f3f1] py-4 text-right last:border-b-0"
                    >
                        {/* Icon */}
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f6f1e5] text-[#173f37] transition group-hover:bg-[#eee6d3]">
                            <Bell size={18} strokeWidth={1.8} />
                        </div>

                        {/* Text */}
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-[#354741]">
                                {item.title}
                            </p>

                            <p className="mt-1 text-[11px] text-[#97a19e]">
                                {item.subtitle}
                            </p>
                        </div>

                        {/* Arrow */}
                        <ArrowLeft
                            size={16}
                            className="shrink-0 text-[#b28b43] transition group-hover:-translate-x-1"
                        />
                    </button>
                ))}
            </div>
        </section>
    );
};

export default SmartBox;
