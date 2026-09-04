'use client';

import { Vazirmatn } from 'next/font/google';
import { Check } from 'lucide-react';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

const actions = [
    {
        number: '۱',
        title: 'تکمیل مدارک',
        description: 'چک، گواهی و قرارداد پایه',
    },
    {
        number: '۲',
        title: 'کنترل اطلاعات استخراج‌شده',
        description: 'مبلغ، تاریخ و نام طرفین',
    },
    {
        number: '۳',
        title: 'پیگیری اقدام‌های باقی‌مانده',
        description: 'مرکز اقدامات پرونده',
    },
];

const ActionPlan = () => {
    return (
        <section
            dir="rtl"
            className={`${vazir.className} rounded-[20px] border border-[#dfe8e3] bg-white p-5 shadow-[0_4px_20px_rgba(13,48,42,0.035)]`}
        >
            {/* Header */}
            <div className="border-b border-[#edf1ef] pb-4">
                <h2 className=" font-extrabold text-[#173f37]">
                    برنامه اقدام فعلی
                </h2>
            </div>

            {/* Steps */}
            <div className="mt-3 flex flex-col gap-2">
                {actions.map((item) => (
                    <div
                        key={item.number}
                        className="flex items-center gap-3 rounded-xl border border-[#e0e8e4] bg-white px-3 py-3 transition hover:border-[#c9a96e]/50 hover:bg-[#fcfcfa]"
                    >
                        {/* Number */}
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f6f1e5] text-[12px] font-bold text-[#173f37]">
                            {item.number}
                        </div>

                        {/* Text */}
                        <div className="min-w-0 flex-1">
                            <p className="text-[12px] font-bold text-[#354741]">
                                {item.title}
                            </p>

                            <p className="mt-1  text-[#97a19e]">
                                {item.description}
                            </p>
                        </div>

                        <Check size={15} className="text-[#8ca39a]" />
                    </div>
                ))}
            </div>
        </section>
    );
};

export default ActionPlan;
