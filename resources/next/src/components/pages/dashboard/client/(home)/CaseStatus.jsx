'use client';

import { Vazirmatn } from 'next/font/google';

import CaseStatusChart from '@/components/chart/CaseStatusChart';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

const CaseStatus = () => {
    return (
        <section
            dir="rtl"
            className={`${vazir.className} rounded-2xl border border-[#dfe8e3] bg-white p-5 shadow-[0_4px_20px_rgba(13,48,42,0.035)]`}
        >
            {/* Header */}
            <div className="border-b border-[#edf1ef] pb-4">
                <h2 className="font-bold text-[#173f37]">وضعیت تکمیل پرونده</h2>

                <p className="mt-1 text-xs text-[#8a9994]">
                    مدارک، اقدام‌ها و پیگیری
                </p>
            </div>

            {/* Content */}
            <div className="mt-6 flex items-center gap-7">
                {/* Chart */}
                <CaseStatusChart />

                {/* Information */}
                <div>
                    <h3 className="font-bold text-[#173f37]">وضعیت خوب</h3>

                    <p className="mt-2 text-sm leading-7 text-[#7d8b87]">
                        یک مورد مدرک ناقص دارید و دو اقدام در انتظار انجام است.
                    </p>

                    <p className="mt-2 text-xs text-[#9aa6a2]">
                        این شاخص احتمال موفقیت پرونده را نشان نمی‌دهد.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default CaseStatus;
