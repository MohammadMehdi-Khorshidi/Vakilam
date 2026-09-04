'use client';

import { Vazirmatn } from 'next/font/google';
import { Check } from 'lucide-react';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

const steps = [
    {
        number: '۱',
        title: 'پرداخت پیش‌پرداخت به وکیلم',
        description: 'وجه ابتدا در حساب وکیلم ثبت می‌شود.',
    },
    {
        number: '۲',
        title: 'ثبت قرارداد در سامانه عدل ایران',
        description: 'وکیل وضعیت ثبت را اعلام می‌کند.',
    },
    {
        number: '۳',
        title: 'بارگذاری قرارداد ثبت‌شده',
        description: 'نسخه ثبت‌شده داخل پرونده قرار می‌گیرد.',
    },
    {
        number: '۴',
        title: 'تأیید موکل',
        description: 'موکل نسخه را بررسی و تأیید می‌کند.',
    },
    {
        number: '۵',
        title: 'فعال شدن همکاری',
        description: 'پس از تأیید قرارداد، همکاری در پرونده فعال می‌شود.',
    },
];

const CooperationSteps = () => {
    return (
        <section
            dir="rtl"
            className={`${vazir.className} rounded-[20px] border border-[#dfe8e3] bg-white p-5 shadow-[0_4px_20px_rgba(13,48,42,0.035)]`}
        >
            <div className="border-b border-[#edf1ef] pb-4">
                <h2 className=" font-extrabold text-[#173f37]">
                    روند فعال شدن همکاری
                </h2>
            </div>

            <div className="mt-3">
                {steps.map((step, index) => (
                    <div
                        key={step.number}
                        className="relative flex items-start gap-4 py-3"
                    >
                        {/* خط بین مراحل */}
                        {index !== steps.length - 1 && (
                            <span className="absolute right-[14px] top-[42px] h-[28px] w-px bg-[#dfe5e2]" />
                        )}

                        {/* شماره */}
                        <div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#c9a96e] font-bold text-[#173f37]">
                            {step.number}
                        </div>

                        {/* محتوا */}
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h3 className=" font-bold text-[#354741]">
                                    {step.title}
                                </h3>

                                {index === 0 && (
                                    <span className="rounded-full bg-[#f6f1e5] px-2 py-1  font-bold text-[#9b783d]">
                                        مرحله فعلی
                                    </span>
                                )}
                            </div>

                            <p className="mt-1  leading-6 text-[#97a19e]">
                                {step.description}
                            </p>
                        </div>

                        {index === 0 && (
                            <Check size={16} className="mt-1 text-[#b28b43]" />
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
};

export default CooperationSteps;
