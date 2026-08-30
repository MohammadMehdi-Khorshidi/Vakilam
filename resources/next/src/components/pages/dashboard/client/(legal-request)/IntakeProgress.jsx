'use client';

import { Check } from 'lucide-react';
import { Vazirmatn } from 'next/font/google';
import { steps } from '@/lib/intake';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

export default function IntakeProgress({ step, setStep }) {
    const progressSteps = steps.slice(0, 5);

    return (
        <section
            dir="rtl"
            className={`${vazir.className} mb-5 rounded-[18px] border border-[#dce5e1] bg-white px-4 py-4 shadow-[0_4px_18px_rgba(18,63,55,0.035)]`}
        >
            <div className="mb-4 flex items-center justify-between gap-4">
                <button
                    type="button"
                    className="shrink-0 rounded-[10px] border border-[#a9c2b9] bg-white px-3 py-[7px] text-[11px] font-bold text-[#365f54] transition hover:border-[#123f37] hover:bg-[#f7faf8]"
                >
                    پنهان‌کردن مراحل جزئی
                </button>

                <div className="text-right">
                    <p className="text-[11px] font-semibold text-[#60736d]">
                        مسیر کوتاه تشکیل پرونده
                    </p>

                    <p className="mt-1 text-[13px] font-black text-[#29463d]">
                        ۵ بخش کوتاه؛ همه اطلاعات تکمیلی اختیاری‌اند
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
                {progressSteps.map((item, index) => {
                    const isActive = step === index;
                    const isDone = step > index;

                    return (
                        <button
                            key={item}
                            type="button"
                            onClick={() => setStep(index)}
                            className={`flex min-h-[45px] items-center justify-center gap-2 rounded-[11px] border px-3 text-[11px] font-bold transition-all duration-200 ${
                                isActive
                                    ? 'border-[#7eafa1] bg-[#eef8f5] text-[#123f37]'
                                    : isDone
                                      ? 'border-[#cce5dc] bg-[#f1faf6] text-[#287a63]'
                                      : 'border-[#e3e9e6] bg-white text-[#7f8b87] hover:border-[#cbd8d3]'
                            }`}
                        >
                            <span
                                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-black ${
                                    isDone
                                        ? 'bg-[#287a63] text-white'
                                        : isActive
                                          ? 'bg-[#123f37] text-white'
                                          : 'bg-[#eef3f1] text-[#788580]'
                                }`}
                            >
                                {isDone ? (
                                    <Check size={13} strokeWidth={3} />
                                ) : (
                                    index + 1
                                )}
                            </span>

                            <span className="truncate">{item}</span>
                        </button>
                    );
                })}
            </div>
        </section>
    );
}
