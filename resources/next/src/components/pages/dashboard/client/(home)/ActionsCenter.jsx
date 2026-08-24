'use client';

import { Vazirmatn } from 'next/font/google';
import { ArrowLeft, Circle } from 'lucide-react';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

const ActionsCenter = () => {
    const actions = [
        {
            title: 'مقایسه سه پیشنهاد همکاری',
            time: 'امروز',
        },
        {
            title: 'تأیید خلاصه استخراج‌شده پرونده',
            time: 'امروز',
        },
    ];

    return (
        <section
            dir="rtl"
            className={`${vazir.className} rounded-2xl border border-[#dfe8e3] bg-white p-5 shadow-[0_4px_20px_rgba(13,48,42,0.035)]`}
        >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#edf1ef] pb-4">
                <h2 className="font-bold text-[#173f37]">مرکز اقدامات</h2>

                <button
                    type="button"
                    className="text-xs font-bold text-[#315e52] transition hover:text-[#b28b43]"
                >
                    مشاهده همه
                </button>
            </div>

            {/* Actions */}
            <div className="mt-2">
                {actions.map((item) => (
                    <button
                        type="button"
                        key={item.title}
                        className="group flex w-full items-center gap-4 border-b border-[#f0f3f1] py-5 text-right last:border-b-0"
                    >
                        {/* Priority Dot */}
                        <Circle
                            size={10}
                            fill="#b8424d"
                            strokeWidth={0}
                            className="shrink-0"
                        />

                        {/* Content */}
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-[#354741]">
                                {item.title}
                            </p>

                            <p className="mt-1 text-[11px] text-[#97a19e]">
                                {item.time}
                            </p>
                        </div>

                        {/* Priority */}
                        <span className="rounded-full border border-[#f1cfd2] bg-[#fff6f6] px-3 py-1 text-[10px] text-[#b8424d]">
                            زیاد
                        </span>

                        {/* Arrow */}
                        <ArrowLeft
                            size={16}
                            className="text-[#b28b43] transition group-hover:-translate-x-1"
                        />
                    </button>
                ))}
            </div>
        </section>
    );
};

export default ActionsCenter;
