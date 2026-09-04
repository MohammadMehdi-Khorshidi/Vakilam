'use client';

import { CheckCircle2 } from 'lucide-react';

export default function TrustScoreChart({
    value = 92,
    title = 'امتیاز اعتماد',
}) {
    const normalizedValue = Math.min(Math.max(value, 0), 100);
    const progressDegree = normalizedValue * 3.6;

    return (
        <div className="text-center" dir="rtl">
            <div className="relative mx-auto flex size-[190px] items-center justify-center">
                <div
                    className="absolute inset-0 rounded-full"
                    style={{
                        background: `conic-gradient(
              #d3ad58 0deg,
              #d3ad58 ${progressDegree}deg,
              rgba(255, 255, 255, 0.12) ${progressDegree}deg,
              rgba(255, 255, 255, 0.12) 360deg
            )`,
                    }}
                />

                <div className="absolute inset-[14px] rounded-full bg-[#294137]" />

                <div className="relative z-10 flex flex-col items-center">
                    <div className="flex items-center text-[#e7cf94]">
                        <strong className="text-3xl font-black">
                            {normalizedValue}
                        </strong>

                        <span className="mr-1 text-xl font-bold">٪</span>
                    </div>

                    <span className="mt-2 text-sm text-[#c9d4d0]">{title}</span>

                    <CheckCircle2 size={18} className="mt-2 text-[#d4ae59]" />
                </div>
            </div>

            <p className="mx-auto mt-3 max-w-[260px] text-sm leading-7 text-[#b9cbc6]">
                این شاخص برای مدیریت فرآیند است و نتیجه حقوقی را پیش‌بینی
                نمی‌کند.
            </p>
        </div>
    );
}
