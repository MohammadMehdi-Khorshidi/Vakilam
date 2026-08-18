'use client';

import { Vazirmatn } from 'next/font/google';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

const AboutPage = () => {
    const principles = [
        {
            number: '۰۱',
            title: 'تخصص',
            description:
                'استفاده از دانش و تخصص حقوقی برای بررسی دقیق مسائل و انتخاب مسیر مناسب.',
        },
        {
            number: '۰۲',
            title: 'شفافیت',
            description:
                'ارائه اطلاعات روشن و قابل فهم تا بتوانید با آگاهی بیشتری تصمیم بگیرید.',
        },
        {
            number: '۰۳',
            title: 'همراهی',
            description:
                'در کنار شما هستیم تا مسیر رسیدگی به مسائل حقوقی ساده‌تر و قابل پیگیری باشد.',
        },
    ];

    const router = useRouter();

    return (
        <main
            dir="rtl"
            className={`${vazir.className} min-h-screen w-full bg-[#e8f1ee] text-[#0d302a]`}
        >
            {/* ================= Hero ================= */}
            <section className="relative overflow-hidden bg-[#163f38] px-6 pt-14 pb-20 text-white md:px-12 md:pt-20 md:pb-24 lg:px-20">
                {/* خط طلایی */}
                <div className="absolute top-0 right-0 h-1 w-full bg-[#c9a96e]" />

                <div className="mx-auto max-w-7xl">
                    <span className="text-3xl font-bold text-[#c9a96e] md:text-4xl">
                        درباره وکیلم
                    </span>

                    <h1 className="mt-5 max-w-4xl text-3xl leading-[1.8] font-bold md:text-5xl lg:text-6xl">
                        حقوقی،
                        <span className="text-[#c9a96e]">
                            {' '}
                            ساده‌تر و شفاف‌تر
                        </span>
                    </h1>

                    <p className="mt-6 max-w-2xl text-sm leading-8 text-white/65 md:text-base md:leading-9">
                        وکیلم با هدف ساده‌تر کردن مسیر دسترسی به خدمات و مشاوره
                        حقوقی شکل گرفته است؛ جایی که بتوانید مسئله خود را با
                        اطمینان مطرح کنید، مسیر مناسب را بشناسید و با آگاهی
                        تصمیم بگیرید.
                    </p>
                </div>

                {/* تزئین پایین */}
                <div className="absolute -bottom-12 left-1/2 h-24 w-[120%] -translate-x-1/2 rounded-[50%] bg-[#e8f1ee]" />
            </section>

            {/* ================= Why Vakilam ================= */}
            <section className="px-6 py-16 md:px-12 md:py-20 lg:px-20">
                <div className="mx-auto max-w-7xl">
                    <div className="max-w-3xl">
                        <span className="text-sm font-semibold text-[#c9a96e]">
                            چرا وکیلم؟
                        </span>

                        <h2 className="mt-3 text-2xl leading-relaxed font-bold md:text-4xl">
                            مسائل حقوقی پیچیده‌اند،
                            <span className="text-[#c9a96e]">
                                {' '}
                                اما مسیر رسیدگی نباید پیچیده باشد.
                            </span>
                        </h2>

                        <p className="mt-6 text-sm leading-8 text-[#0d302a]/65 md:text-base md:leading-9">
                            بسیاری از افراد هنگام مواجهه با یک مسئله حقوقی
                            نمی‌دانند از کجا شروع کنند، چه اطلاعاتی نیاز دارند و
                            چگونه باید مسیر مناسب را انتخاب کنند. ما تلاش
                            می‌کنیم این مسیر را ساده‌تر، منظم‌تر و شفاف‌تر کنیم.
                        </p>
                    </div>
                </div>
            </section>

            {/* ================= Principles ================= */}
            <section className="px-6 pb-16 md:px-12 md:pb-20 lg:px-20">
                <div className="mx-auto max-w-7xl">
                    <div className="border-y border-[#0d302a]/15">
                        {principles.map((item, index) => (
                            <div
                                key={item.number}
                                className={`flex flex-col gap-5 py-8 md:flex-row md:items-center md:gap-10 ${index !== principles.length - 1 ? 'border-b border-[#0d302a]/15' : ''} `}
                            >
                                {/* شماره */}
                                <span className="text-sm font-semibold text-[#c9a96e] md:w-16">
                                    {item.number}
                                </span>

                                {/* عنوان */}
                                <h3 className="text-2xl font-bold text-[#0d302a] md:w-48 md:text-3xl">
                                    {item.title}
                                </h3>

                                {/* توضیحات */}
                                <p className="max-w-2xl text-sm leading-8 text-[#0d302a]/60 md:text-base">
                                    {item.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ================= Our Path ================= */}
            <section className="px-6 pb-20 md:px-12 lg:px-20">
                <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-20">
                    <div>
                        <span className="text-sm font-semibold text-[#c9a96e]">
                            مسیر ما
                        </span>

                        <h2 className="mt-3 text-2xl font-bold text-[#0d302a] md:text-4xl">
                            برای چه چیزی ساخته شدیم؟
                        </h2>
                    </div>

                    <div>
                        <p className="text-sm leading-8 text-[#0d302a]/65 md:text-base md:leading-9">
                            هدف ما ایجاد تجربه‌ای متفاوت در مواجهه با مسائل
                            حقوقی است؛ تجربه‌ای که در آن اطلاعات قابل فهم باشد،
                            مسیر روشن باشد و افراد بتوانند با اطمینان بیشتری
                            تصمیم بگیرند.
                        </p>

                        <p className="mt-5 text-sm leading-8 text-[#0d302a]/65 md:text-base md:leading-9">
                            وکیلم تلاش می‌کند با ایجاد ارتباط میان افراد،
                            متخصصان و خدمات حقوقی، دسترسی به مشاوره مناسب را
                            ساده‌تر و فرآیند رسیدگی را منظم‌تر کند.
                        </p>
                    </div>
                </div>
            </section>

            {/* ================= Bottom CTA ================= */}
            <section className="relative overflow-hidden bg-[#163f38] px-6 py-16 text-white md:px-12 md:py-20 lg:px-20">
                {/* خط طلایی */}
                <div className="absolute top-0 right-0 h-1 w-full bg-[#c9a96e]" />

                <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 md:flex-row md:items-center">
                    <div>
                        <span className="text-sm font-semibold text-[#c9a96e]">
                            همراه شما
                        </span>

                        <h2 className="mt-3 text-2xl font-bold md:text-4xl">
                            یک مسئله حقوقی دارید؟
                        </h2>

                        <p className="mt-3 text-sm leading-7 text-white/60 md:text-base">
                            اولین قدم، دریافت یک مشاوره درست است.
                        </p>
                    </div>

                    <button
                        onClick={() => router.push('/contact')}
                        type="button"
                        className="inline-flex items-center gap-3 rounded-xl bg-[#c9a96e] px-7 py-3.5 text-sm font-bold text-[#0d302a] transition-all duration-300 hover:-translate-y-1 hover:bg-[#d8bb82] hover:shadow-lg"
                    >
                        دریافت مشاوره
                        <ArrowLeft className="h-4 w-4" />
                    </button>
                </div>
            </section>
        </main>
    );
};

export default AboutPage;
