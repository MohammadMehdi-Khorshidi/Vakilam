'use client';

import { Vazirmatn } from 'next/font/google';
import { ArrowLeft, Info } from 'lucide-react';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

const NextSteps = () => {
    return (
        <section
            dir="rtl"
            className={`${vazir.className} rounded-2xl border border-[#dfe8e3] bg-white p-5 shadow-[0_4px_20px_rgba(13,48,42,0.035)]`}
        >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#edf1ef] pb-4">
                <div>
                    <h2 className="font-bold text-[#173f37]">
                        اقدامات بعدی پیشنهادی
                    </h2>

                    <p className="mt-1 text-xs text-[#8a9994]">
                        براساس وضعیت فعلی پرونده
                    </p>
                </div>
            </div>

            {/* Steps */}
            <div className="mt-5 flex flex-col gap-4">
                {/* Step 1 */}
                <div className="flex items-center gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#c9a96e] text-sm font-bold text-[#173f37]">
                        ۱
                    </span>

                    <div className="flex-1">
                        <p className="text-sm font-bold text-[#263e39]">
                            مقایسه سه پیشنهاد وکلا
                        </p>

                        <p className="mt-1 text-xs leading-6 text-[#8a9994]">
                            سه پیشنهاد معتبر دریافت شده و امکان ورود به مرحله
                            انتخاب وکیل فراهم است.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="hidden rounded-xl bg-[#0d4a3e] px-4 py-3 text-xs font-bold text-white transition hover:bg-[#123f37] sm:block"
                    >
                        مقایسه پیشنهادها
                    </button>

                    <ArrowLeft
                        size={17}
                        className="shrink-0 text-[#b28b43] sm:hidden"
                    />
                </div>

                {/* AI Info */}
                <div className="flex items-start gap-3 rounded-xl border border-[#d8e8ee] bg-[#f0f8fb] px-4 py-4">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-[#246478]">
                        <Info size={16} />
                    </div>

                    <div>
                        <p className="text-xs font-bold text-[#24444d]">
                            نقش هوش مصنوعی
                        </p>

                        <p className="mt-1 text-xs leading-6 text-[#698087]">
                            این پیشنهاد صرفاً برای نظم‌دهی مسیر است و جایگزین
                            تصمیم حقوقی یا انتخاب وکیل شما نیست.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default NextSteps;
