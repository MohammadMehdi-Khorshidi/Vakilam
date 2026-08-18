'use client';

import { Vazirmatn } from 'next/font/google';
import { ArrowLeft } from 'lucide-react';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

const TeamSection = () => {
    return (
        <section
            dir="rtl"
            className={`${vazir.className} w-full bg-white px-6 py-20 md:px-12 lg:px-20`}
        >
            <div className="mx-auto max-w-7xl">
                {/* ================= Header ================= */}
                <div className="max-w-3xl">
                    <span className="mb-4 inline-block text-3xl font-bold text-[#c9a96e] md:text-4xl">
                        تیم ما
                    </span>

                    <h2 className="text-2xl leading-relaxed font-bold text-[#0d302a] md:text-4xl lg:text-5xl">
                        تخصص‌های متفاوت،
                        <span className="text-[#c9a96e]"> یک هدف مشترک</span>
                    </h2>

                    <p className="mt-6 max-w-2xl text-sm leading-8 text-[#0d302a]/70 md:text-base">
                        ما با تکیه بر دانش حقوقی، تجربه و همکاری تخصص‌های مختلف،
                        تلاش می‌کنیم مسیر رسیدگی به مسائل حقوقی را برای شما
                        ساده‌تر، شفاف‌تر و مطمئن‌تر کنیم.
                    </p>
                </div>

                {/* ================= Divider ================= */}
                <div className="my-12 h-px w-full bg-[#0d302a]/15" />

                {/* ================= Values ================= */}
                <div className="grid grid-cols-1 md:grid-cols-3">
                    {/* Item 1 */}
                    <div className="border-b border-[#0d302a]/15 py-7 md:border-b-0 md:border-l md:px-8 md:py-4 first:md:pr-0">
                        <h3 className="mt-3 text-xl font-bold text-[#0d302a] md:text-2xl">
                            تخصص حقوقی
                        </h3>

                        <p className="mt-3 text-sm leading-7 text-[#0d302a]/60">
                            استفاده از دانش و تخصص برای بررسی دقیق مسائل و
                            انتخاب بهترین مسیر حقوقی.
                        </p>
                    </div>

                    {/* Item 2 */}
                    <div className="border-b border-[#0d302a]/15 py-7 md:border-b-0 md:border-l md:px-8 md:py-4">
                        <h3 className="mt-3 text-xl font-bold text-[#0d302a] md:text-2xl">
                            تجربه و دقت
                        </h3>

                        <p className="mt-3 text-sm leading-7 text-[#0d302a]/60">
                            هر مسئله با دقت بررسی می‌شود تا تصمیم‌گیری بر پایه
                            اطلاعات درست و قابل اعتماد انجام شود.
                        </p>
                    </div>

                    {/* Item 3 */}
                    <div className="py-7 md:px-8 md:py-4">
                        <h3 className="mt-3 text-xl font-bold text-[#0d302a] md:text-2xl">
                            همراهی مستمر
                        </h3>

                        <p className="mt-3 text-sm leading-7 text-[#0d302a]/60">
                            از اولین مشاوره تا ادامه مسیر، در کنار شما هستیم تا
                            روند کار شفاف و قابل پیگیری باشد.
                        </p>
                    </div>
                </div>

                {/* ================= Bottom CTA ================= */}
                <div className="mt-12 overflow-hidden rounded-[24px] bg-[#163f38]">
                    <div className="flex flex-col items-start justify-between gap-8 px-7 py-8 md:flex-row md:items-center md:px-10 md:py-9">
                        {/* Text */}
                        <div>
                            <span className="text-xs font-semibold text-[#c9a96e]">
                                همراه شما
                            </span>

                            <h3 className="mt-2 text-xl font-bold text-white md:text-2xl">
                                برای شروع، با ما مشورت کنید
                            </h3>

                            <p className="mt-2 text-sm text-white/55">
                                اولین قدم، دریافت یک مشاوره درست است.
                            </p>
                        </div>

                        {/* Button */}
                        <button
                            type="button"
                            className="inline-flex shrink-0 items-center gap-3 rounded-xl bg-[#c9a96e] px-7 py-3.5 text-sm font-bold text-[#0d302a] transition-all duration-300 hover:-translate-y-1 hover:bg-[#d8bb82] hover:shadow-lg"
                        >
                            دریافت مشاوره
                            <ArrowLeft className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TeamSection;
