'use client';

import { Vazirmatn } from 'next/font/google';

import {
    BriefcaseBusiness,
    MapPin,
    Clock3,
    FileText,
    ArrowLeft,
} from 'lucide-react';

import CaseProgressChart from '@/components/chart/CaseProgressChart';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

const ActiveCase = () => {
    return (
        <section dir="ltr"
            className={`${vazir.className} relative overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#145447_0%,#0b322b_65%,#06251f_100%)] px-7 py-7 text-white shadow-sm`}
        >
            {/* Decorative */}
            <div className="pointer-events-none absolute -left-16 -top-20 h-64 w-64 rounded-full border border-[#c9a96e]/20" />

            <div className="pointer-events-none absolute -bottom-32 right-1/3 h-56 w-56 rounded-full bg-[#c9a96e]/5 blur-3xl" />

            <div className="relative grid gap-8 lg:grid-cols-[220px_1fr] lg:items-center">
                {/* =========================
                    Progress Chart
                ========================== */}
                <div className="flex flex-col items-center justify-center">
                    <CaseProgressChart />

                    <p className="mt-4 max-w-[190px] text-center text-xs leading-6 text-white/55">
                        این شاخص برای مدیریت فرآیند است و نتیجه حقوقی را
                        پیش‌بینی نمی‌کند.
                    </p>
                </div>

                {/* =========================
                    Content
                ========================== */}
                <div dir="rtl">
                    {/* Status */}
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#c9a96e]/40 bg-[#c9a96e]/10 px-4 py-2 text-xs font-bold text-[#e4c66f]">
                        <span className="h-2 w-2 rounded-full bg-[#c9a96e]" />
                        پرونده فعال
                    </div>

                    {/* Title */}
                    <h2 className="text-3xl font-bold leading-[1.7] md:text-4xl">
                        مطالبه وجه چک
                    </h2>

                    {/* Description */}
                    <p className="mt-3 text-sm leading-7 text-white/65">
                        پرونده قبلی شما تشکیل شده و اکنون سه پیشنهاد همکاری وکیل
                        برای مقایسه آماده است.
                    </p>

                    {/* Information */}
                    <div className="mt-5 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm">
                        <div className="flex items-center gap-2">
                            <FileText size={17} className="text-[#c9a96e]" />

                            <span className="text-white/55">شناسه</span>

                            <strong>VK-1405-00128</strong>
                        </div>

                        <div className="flex items-center gap-2">
                            <Clock3 size={17} className="text-[#c9a96e]" />

                            <span className="text-white/55">وضعیت</span>

                            <strong>در حال انتخاب وکیل</strong>
                        </div>

                        <div className="flex items-center gap-2">
                            <MapPin size={17} className="text-[#c9a96e]" />

                            <strong>تهران</strong>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="mt-6 flex flex-wrap gap-3">
                        <button
                            type="button"
                            className="inline-flex items-center gap-2 rounded-xl bg-[#c9a96e] px-5 py-3 text-sm font-bold text-[#102d27] transition hover:bg-[#d8bb82]"
                        >
                            مقایسه پیشنهادها
                            <ArrowLeft size={16} />
                        </button>

                        <button
                            type="button"
                            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold transition hover:bg-white/15"
                        >
                            مشاهده پرونده
                            <BriefcaseBusiness size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ActiveCase;
