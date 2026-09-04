'use client';

import { Vazirmatn } from 'next/font/google';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

const FinancialSummary = () => {
    const items = [
        {
            title: 'حق‌الوکاله',
            value: '۴۸,۰۰۰,۰۰۰ تومان',
        },
        {
            title: 'پیش‌پرداخت',
            value: '۱۸,۰۰۰,۰۰۰ تومان',
        },
        {
            title: 'باقی‌مانده',
            value: '۳۰,۰۰۰,۰۰۰ تومان',
        },
    ];

    return (
        <section
            dir="rtl"
            className={`${vazir.className} rounded-[20px] border border-[#dfe8e3] bg-white p-5 shadow-[0_4px_20px_rgba(13,48,42,0.035)]`}
        >
            <div className="border-b border-[#edf1ef] pb-4">
                <h2 className=" font-extrabold text-[#173f37]">
                    خلاصه مالی
                </h2>
            </div>

            <div className="mt-2">
                {items.map((item) => (
                    <div
                        key={item.title}
                        className="flex items-center justify-between border-b border-[#edf1ef] py-4 last:border-b-0"
                    >
                        <span className="text-[#7f8d88]">
                            {item.title}
                        </span>

                        <strong className=" font-bold text-[#173f37]">
                            {item.value}
                        </strong>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default FinancialSummary;
