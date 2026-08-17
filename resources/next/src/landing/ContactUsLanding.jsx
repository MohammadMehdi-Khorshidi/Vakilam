'use client';

import { Vazirmatn } from 'next/font/google';
import { Phone } from 'lucide-react';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

const ContactPage = () => {
    const steps = [
        {
            number: '۱',
            title: 'ثبت هوشمند مسئله',
            description: 'سؤال‌های مرحله‌ای و جمع‌آوری اطلاعات لازم',
        },
        {
            number: '۲',
            title: 'انتخاب وکیل مناسب',
            description: 'مشاهده، دریافت پیشنهاد و مقایسه شفاف',
        },
        {
            number: '۳',
            title: 'قرارداد و پرداخت',
            description: 'پیش‌پرداخت، ثبت قرارداد و شروع همکاری',
        },
        {
            number: '۴',
            title: 'مدیریت همکاری',
            description: 'پیام‌ها، جلسات، اسناد، کارها و بازخورد',
        },
    ];

    return (
        <main
            dir="rtl"
            className={`${vazir.className} w-full bg-[#e8f1ee] text-[#0d302a]`}
        >
            {/* ================= Hero ================= */}
            <section className="px-6 py-5 md:px-12 lg:px-20">
                <div className="mx-auto max-w-7xl text-center"></div>
            </section>

            {/* ================= Steps ================= */}
            <section className="px-6 md:px-12 lg:px-20">
                <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
                    {/* Text - Right */}
                    <div className="text-right">
                        <span className="mb-3 inline-block text-4xl font-bold text-[#c9a96e]">
                            ارتباط با ما
                        </span>

                        <h1 className="text-xl leading-relaxed font-bold text-[#0d302a] md:text-3xl">
                            در کنار شما،
                            <span className="text-[#c9a96e]">
                                {' '}
                                برای حل مسائل حقوقی
                            </span>
                        </h1>

                        <p className="mx-auto mt-5 max-w-2xl text-sm leading-8 text-[#0d302a]/75 md:text-base">
                            اگر برای پرونده یا موضوع حقوقی خود نیاز به مشاوره،
                            راهنمایی یا پیگیری دارید، با ما در ارتباط باشید.
                            درخواست شما با دقت بررسی خواهد شد.
                        </p>
                        <h2 className="text-2xl font-bold text-[#0d302a] md:text-3xl">
                            برای شروع، با ما در ارتباط باشید
                        </h2>

                        <p className="mt-4 text-sm leading-7 text-gray-500">
                            اولین قدم برای حل یک مسئله حقوقی، دریافت اطلاعات و
                            مشاوره درست است.
                        </p>

                        <button
                            type="button"
                            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#c9a96e] px-7 py-3.5 text-sm font-bold text-white transition transition-all duration-300 ease-out hover:scale-[1.04] hover:shadow-md"
                        >
                            <Phone className="h-4 w-4" />
                            ارتباط با ما
                        </button>
                    </div>

                    {/* Cards - Left */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        {steps.map((step) => (
                            <div
                                key={step.number}
                                className="min-h-[190px] rounded-[20px] border border-[#0d302a]/15 bg-[#163f38] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#c9a96e]/60 hover:shadow-lg"
                            >
                                {/* Number */}
                                <div className="mb-5 flex justify-start">
                                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#c9a96e] text-sm font-bold text-[#0d302a]">
                                        {step.number}
                                    </span>
                                </div>

                                {/* Title */}
                                <h3 className="text-base font-bold text-white">
                                    {step.title}
                                </h3>

                                {/* Description */}
                                <p className="mt-3 text-sm leading-7 text-white/65">
                                    {step.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ================= Bottom CTA ================= */}
            <section className="px-6 py-16 text-center">
                <div className="mx-auto max-w-3xl"></div>
            </section>
        </main>
    );
};

export default ContactPage;
