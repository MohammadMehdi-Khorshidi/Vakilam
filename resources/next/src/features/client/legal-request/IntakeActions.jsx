'use client';

import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Vazirmatn } from 'next/font/google';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

export default function IntakeActions({
    step,
    totalSteps,
    onBack,
    onNext,
    onSubmit,
    disabled = false,
    isSubmitting = false,
}) {
    const isLast = step === totalSteps - 1;

    return (
        <div
            dir="rtl"
            className={`${vazir.className} mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[#e4e9e7] pt-5`}
        >
            <button
                type="button"
                onClick={onBack}
                disabled={step === 0 || isSubmitting}
                className="flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
                <ArrowRight size={18} />
                بازگشت
            </button>

            {!isLast ? (
                <button
                    type="button"
                    onClick={onNext}
                    disabled={disabled}
                    className="flex items-center gap-2 rounded-xl bg-[#0b4138] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#08362f] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {step === 0 ? 'ادامه با توضیح فعلی' : 'ذخیره و ادامه'}
                    <ArrowLeft size={18} />
                </button>
            ) : (
                <button
                    type="button"
                    onClick={onSubmit}
                    disabled={disabled}
                    className="rounded-xl bg-[#0b4138] px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isSubmitting ? 'در حال ثبت...' : 'ثبت و ادامه مسیر'}
                </button>
            )}
        </div>
    );
}
