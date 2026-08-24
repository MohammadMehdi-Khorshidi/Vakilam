'use client';

import { Vazirmatn } from 'next/font/google';
import { LockKeyhole, Sparkles } from 'lucide-react';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

const steps = [
    'شرح مسئله با زبان خودتان',
    'گفت‌وگو و راهنمایی اولیه',
    'دریافت برنامه اقدام پیشنهادی',
    'تکمیل و تأیید پرونده',
    'در صورت نیاز مشاهده وکیل',
];

const LegalProblemBox = () => {
    return (
        <section
            dir="ltr"
            className={`${vazir.className} relative mb-6 overflow-hidden rounded-[26px] bg-[#0d4a40] p-5 lg:p-8`}
        >
            {/* Decorative circle */}
            <div className="pointer-events-none absolute -left-[100px] -top-[120px] h-[320px] w-[320px] rounded-full border border-[#c9a96e]/20" />

            <div className="pointer-events-none absolute -bottom-32 right-1/3 h-56 w-56 rounded-full bg-[#c9a96e]/5 blur-3xl" />

            <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
                {/* =========================
                    LEFT BOX - STEPS
                ========================== */}
                <div className="order-2 min-h-[360px] rounded-[20px] border border-white/15 bg-white/[0.06] p-6 lg:order-1">
                    <div className="flex h-full flex-col justify-center gap-4">
                        {steps.map((step, index) => (
                            <div
                                key={step}
                                className="flex items-center justify-end gap-4"
                            >
                                <span className="text-[13px] font-semibold text-white/85">
                                    {step}
                                </span>

                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#d8b45c] text-[12px] font-bold text-[#173b34]">
                                    {index + 1}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* =========================
                    RIGHT BOX - PROBLEM
                ========================== */}
                <div className="order-1 lg:order-2">
                    {/* Label */}
                    <div className="mb-4 flex items-center justify-end gap-2 text-[13px] font-bold text-[#d8b45c]">
                        <span>شروع ساده و انسانی</span>

                        <Sparkles size={15} strokeWidth={2} />
                    </div>

                    {/* Title */}
                    <h2 className="text-right text-[26px] font-extrabold leading-[1.7] text-white lg:text-[32px]">
                        مشکل حقوقی‌ات را بنویس؛
                        <br />
                        وکیلم کمکت می‌کند مسیر درست را پیدا کنی.
                    </h2>

                    {/* Description */}
                    <p className="mt-3 text-right text-[13px] leading-7 text-white/65">
                        لازم نیست اصطلاح حقوقی بلد باشی؛ مسئله را همان‌طور که
                        برای یک فرد قابل اعتماد تعریف می‌کنی بنویس.
                    </p>

                    {/* Input box */}
                    <div className="mt-5 rounded-[18px] bg-white p-4">
                        <textarea
                            rows={5}
                            placeholder="مثلاً یک چک دارم که در موعد پرداخت نشده و نمی‌دانم از کجا باید شروع کنم..."
                            className="w-full resize-none bg-transparent px-2 py-1 text-right text-[13px] leading-7 text-[#173b34] outline-none placeholder:text-[#9ca5a2]"
                        />

                        <div className="mt-2 flex items-center justify-between border-t border-[#e7ebe9] pt-3">
                            {/* Privacy */}
                            <div className="flex items-center gap-1.5 text-[11px] text-[#7b8581]">
                                <LockKeyhole size={13} />

                                <span>اطلاعات شما محرمانه است.</span>
                            </div>

                            {/* Button */}
                            <button
                                type="button"
                                className="rounded-xl bg-[#dfc58f] px-5 py-3 text-[12px] font-bold text-[#365046] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#e7d2a5]"
                            >
                                شروع راهنمایی مرحله‌به‌مرحله
                            </button>
                        </div>
                    </div>

                    {/* Bottom text */}
                    <p className="mt-3 text-right text-[11px] leading-6 text-white/55">
                        دستیار وکیلم سؤال می‌پرسد، اقدام‌های اولیه و مسیرهای
                        احتمالی را توضیح می‌دهد؛ تصمیم حقوقی نهایی و هر اقدام
                        اثرگذار نیازمند تأیید شما و وکیل است.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default LegalProblemBox;
