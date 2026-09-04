'use client';

import { Check, ShieldCheck } from 'lucide-react';
import { Vazirmatn } from 'next/font/google';

import { steps } from '@/lib/intake';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

export default function IntakeStepper({ step, setStep }) {
    return (
        <aside
            dir="rtl"
            className={`${vazir.className} hidden h-fit w-full rounded-[18px] border border-[#dce5e1] bg-white px-4 py-4 shadow-[0_4px_18px_rgba(18,63,55,0.035)] xl:block`}
        >
            <div className="mb-3 flex items-center justify-between border-b border-[#edf0ef] pb-4 text-[10px] text-[#71807b]">
                <span>مسیر تشکیل پرونده</span>

                <b className="text-[#496159]">
                    {step + 1} از {steps.length}
                </b>
            </div>

            <ol className="relative">
                {steps.map((item, index) => {
                    const completed = index < step;
                    const active = index === step;

                    return (
                        <li key={item} className="relative">
                            <button
                                type="button"
                                onClick={() => setStep(index)}
                                className={`relative flex min-h-[45px] w-full items-center gap-3 text-right text-[11px] font-bold transition-colors duration-200 ${
                                    active
                                        ? 'text-[#123f37]'
                                        : completed
                                          ? 'text-[#456c60]'
                                          : 'text-[#a2aaa7]'
                                }`}
                            >
                                {index < steps.length - 1 && (
                                    <span
                                        className={`absolute right-[13px] top-[30px] h-[25px] w-px ${
                                            completed
                                                ? 'bg-[#c7ddd5]'
                                                : 'bg-[#e7ecea]'
                                        }`}
                                    />
                                )}

                                <span
                                    className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px] text-[10px] font-black ${
                                        completed
                                            ? 'bg-[#287660] text-white'
                                            : active
                                              ? 'bg-[#d8bb68] text-white'
                                              : 'border border-[#e2e8e5] bg-white text-[#a4aeaa]'
                                    }`}
                                >
                                    {completed ? (
                                        <Check size={14} strokeWidth={3} />
                                    ) : (
                                        index + 1
                                    )}
                                </span>

                                <span className="truncate">{item}</span>
                            </button>
                        </li>
                    );
                })}
            </ol>

            <div className="mt-3 flex gap-2 border-t border-[#edf0ef] pt-4 text-[9px] leading-5 text-[#788580]">
                <ShieldCheck
                    size={18}
                    className="mt-0.5 shrink-0 text-[#536860]"
                />

                <p>
                    اطلاعات این مسیر محرمانه است و فقط برای همین پرونده استفاده
                    می‌شود.
                </p>
            </div>
        </aside>
    );
}
