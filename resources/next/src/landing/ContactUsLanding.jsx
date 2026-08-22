'use client';

import { Vazirmatn } from 'next/font/google';

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
            <section className="hidden px-6 py-12 md:hidden lg:block lg:px-20">
                <div className="mx-auto grid max-w-7xl grid-cols-2 items-center gap-20">
                    {/* Steps */}
                    <div className="relative">
                        <div className="flex flex-col items-center">
                            {steps.map((step, index) => (
                                <div
                                    key={step.number}
                                    className="relative flex w-full flex-col items-center"
                                >
                                    <div className="relative z-10 flex min-h-[120px] w-full items-center rounded-[20px] border border-[#0d302a]/20 bg-[#163f38] px-6 py-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#c9a96e]/70 hover:shadow-lg">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#c9a96e] text-lg font-bold text-[#0d302a]">
                                            {step.number}
                                        </div>

                                        <div className="mr-5 text-right">
                                            <h3 className="text-base font-bold text-white">
                                                {step.title}
                                            </h3>

                                            <p className="mt-2 text-sm leading-7 text-white/65">
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>

                                    {index !== steps.length - 1 && (
                                        <div className="relative z-0 h-7 w-[2px] bg-[#c9a96e]" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

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

                        <p className="mt-5 max-w-2xl text-sm leading-8 text-[#0d302a]/75 md:text-base">
                            اگر برای پرونده یا موضوع حقوقی خود نیاز به مشاوره،
                            راهنمایی یا پیگیری دارید، با ما در ارتباط باشید.
                            درخواست شما با دقت بررسی خواهد شد.
                        </p>

                        <h2 className="mt-7 text-2xl font-bold text-[#0d302a] md:text-3xl">
                            برای شروع، با ما در ارتباط باشید
                        </h2>

                        <p className="mt-4 text-sm leading-7 text-gray-500">
                            اولین قدم برای حل یک مسئله حقوقی، دریافت اطلاعات و
                            مشاوره درست است.
                        </p>

                        <button
                            type="button"
                            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#c9a96e] px-7 py-3.5 text-sm font-bold text-[#0d302a] transition-all duration-300 hover:scale-[1.04] hover:shadow-md"
                        >
                            ارتباط با ما
                        </button>
                    </div>
                </div>
            </section>

            <section className="block px-6 py-10 md:px-12 lg:hidden">
                <div className="mb-10 text-right">
                    <span className="mb-3 inline-block text-3xl font-bold text-[#c9a96e] md:text-4xl">
                        ارتباط با ما
                    </span>

                    <h1 className="text-xl leading-relaxed font-bold text-[#0d302a] md:text-3xl">
                        در کنار شما،
                        <span className="text-[#c9a96e]">
                            {' '}
                            برای حل مسائل حقوقی
                        </span>
                    </h1>

                    <p className="mt-5 max-w-2xl text-sm leading-8 text-[#0d302a]/75 md:text-base">
                        اگر برای پرونده یا موضوع حقوقی خود نیاز به مشاوره،
                        راهنمایی یا پیگیری دارید، با ما در ارتباط باشید. درخواست
                        شما با دقت بررسی خواهد شد.
                    </p>
                </div>

                <div className="grid grid-cols-2 overflow-hidden rounded-[24px] border border-[#0d302a]/15 bg-[#163f38]">
                    {steps.map((step, index) => (
                        <div
                            key={step.number}
                            className={`min-h-[170px] p-5 transition-all duration-300 hover:bg-[#1b4a42] ${index % 2 === 0 ? 'border-l border-[#c9a96e]/50' : ''} ${index < 2 ? 'border-b border-[#c9a96e]/50' : ''} `}
                        >
                            <div className="mb-5 flex justify-start">
                                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c9a96e] text-sm font-bold text-[#0d302a]">
                                    {step.number}
                                </span>
                            </div>

                            <h3 className="text-sm font-bold text-white md:text-base">
                                {step.title}
                            </h3>

                            <p className="mt-2 text-xs leading-6 text-white/65 md:text-sm">
                                {step.description}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="mt-10 text-right">
                    <h2 className="text-2xl font-bold text-[#0d302a] md:text-3xl">
                        برای شروع، با ما در ارتباط باشید
                    </h2>

                    <p className="mt-4 text-sm leading-7 text-gray-500">
                        اولین قدم برای حل یک مسئله حقوقی، دریافت اطلاعات و
                        مشاوره درست است.
                    </p>

                    <button
                        type="button"
                        className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#c9a96e] px-7 py-3.5 text-sm font-bold text-[#0d302a] transition-all duration-300 hover:scale-[1.04] hover:shadow-md"
                    >
                        ارتباط با ما
                    </button>
                </div>
            </section>
        </main>
    );
};

export default ContactPage;
