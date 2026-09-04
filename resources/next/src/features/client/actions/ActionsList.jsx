'use client';

import { Vazirmatn } from 'next/font/google';
import { ArrowLeft } from 'lucide-react';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

const actions = [
    {
        title: 'مقایسه سه پیشنهاد همکاری',
        date: 'امروز',
        priority: 'زیاد',
        priorityType: 'high',
    },
    {
        title: 'تأیید خلاصه استخراج‌شده پرونده',
        date: 'امروز',
        priority: 'زیاد',
        priorityType: 'high',
    },
    {
        title: 'تکمیل مدارک گواهی عدم پرداخت',
        date: 'تا فردا',
        priority: 'متوسط',
        priorityType: 'medium',
    },
];

const ActionsList = () => {
    return (
        <section
            dir="ltr"
            className={`${vazir.className} overflow-hidden rounded-[20px] border border-[#dfe8e3] bg-white px-5 shadow-[0_4px_20px_rgba(13,48,42,0.035)]`}
        >
            {/* Header */}
            <div className="border-b border-[#edf1ef] py-5">
                <h2 className="text-right  font-extrabold text-[#173f37]">
                    اقدامات ضروری
                </h2>
            </div>

            {/* List */}
            <div>
                {actions.map((item, index) => {
                    const isHigh = item.priorityType === 'high';

                    return (
                        <button
                            key={item.title}
                            type="button"
                            className="group flex min-h-[82px] w-full items-center gap-5 border-b border-[#f0f3f1] text-right transition last:border-b-0 hover:bg-[#fbfcfb]"
                        >
                            {/* Priority */}
                            <div className="flex w-[70px] shrink-0 items-center justify-start gap-2">
                                <span
                                    className={`rounded-full border px-3 py-1 text-[10px] font-semibold ${
                                        isHigh
                                            ? 'border-[#f1cfd2] bg-[#fff6f6] text-[#b8424d]'
                                            : 'border-[#ead9b4] bg-[#fffaf0] text-[#a97822]'
                                    }`}
                                >
                                    {item.priority}
                                </span>

                                <ArrowLeft
                                    size={15}
                                    className="text-[#b28b43] transition group-hover:-translate-x-1"
                                />
                            </div>

                            {/* Content */}
                            <div className="flex flex-1 items-center justify-end gap-3">
                                {/* Text */}
                                <div className="min-w-0 text-right">
                                    <p className=" font-bold text-[#354741]">
                                        {item.title}
                                    </p>

                                    <p className="mt-1  text-[#97a19e]">
                                        {item.date}
                                    </p>
                                </div>

                                {/* Dot */}
                                <span
                                    className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                                        isHigh ? 'bg-[#b8424d]' : 'bg-[#b28b43]'
                                    }`}
                                />
                            </div>
                        </button>
                    );
                })}
            </div>
        </section>
    );
};

export default ActionsList;
