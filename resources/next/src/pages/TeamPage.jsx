'use client';

import Image from 'next/image';
import { Vazirmatn } from 'next/font/google';
import {
    Scale,
    BriefcaseBusiness,
    Users,
    ArrowLeft,
    BadgeCheck,
} from 'lucide-react';

import TeamsPhoto from "@/assets/images/teamsPhoto.jpeg"

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

const TeamPage = () => {


    return (
        <main
            dir="rtl"
            className={`${vazir.className} overflow-hidden bg-[#f8faf9]`}
        >
            {/* Hero */}
            <section className="relative bg-[#0D302A] py-24">
                <div className="mx-auto max-w-7xl px-6 text-center lg:px-8">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#C9A96E]/20">
                        <Users className="h-8 w-8 text-[#C9A96E]" />
                    </div>

                    <h1 className="mt-6 text-3xl font-extrabold text-white md:text-5xl">
                        تیم ما
                    </h1>

                    <p className="mx-auto mt-5 max-w-2xl text-sm leading-8 text-gray-300 md:text-base">
                        در وکیلم، مجموعه‌ای از وکلا و مشاوران متخصص در کنار هم
                        تلاش می‌کنند تا مسیر مسائل حقوقی شما را با دقت، تعهد و
                        شفافیت همراهی کنند.
                    </p>
                </div>
            </section>

            {/* معرفی */}
            <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
                <div className="grid items-center gap-12 lg:grid-cols-2">
                    <div>
                        <span className="inline-block rounded-full bg-[#C9A96E]/15 px-4 py-2 text-sm font-bold text-[#0D302A]">
                            درباره اعضای وکیلم
                        </span>

                        <h2 className="mt-5 text-3xl font-extrabold leading-relaxed text-[#163832] md:text-4xl">
                            تخصص در کنار تعهد
                        </h2>

                        <p className="mt-6 leading-9 text-gray-600">
                            تیم وکیلم از متخصصان حقوقی با تجربه در حوزه‌های
                            مختلف تشکیل شده است تا کاربران بتوانند با اطمینان
                            بیشتری مسیر پرونده‌های حقوقی خود را دنبال کنند.
                        </p>

                        <div className="mt-8 grid gap-4 sm:grid-cols-2">
                            <div className="flex items-center gap-3">
                                <BadgeCheck className="h-5 w-5 text-[#C9A96E]" />
                                <span className="font-semibold text-[#163832]">
                                    پاسخگویی مسئولانه
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                <BadgeCheck className="h-5 w-5 text-[#C9A96E]" />
                                <span className="font-semibold text-[#163832]">
                                    مشاوره تخصصی
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                <BadgeCheck className="h-5 w-5 text-[#C9A96E]" />
                                <span className="font-semibold text-[#163832]">
                                    حفظ محرمانگی
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                <BadgeCheck className="h-5 w-5 text-[#C9A96E]" />
                                <span className="font-semibold text-[#163832]">
                                    همراهی تا پایان مسیر
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="relative mx-auto w-full max-w-xl">
                        {/* حاشیه‌ی پشت عکس */}
                        <div className="absolute -bottom-5 -left-5 h-full w-full rounded-3xl border border-[#b08b4f]/30" />

                        {/* خود عکس */}
                        <div className="relative overflow-hidden rounded-3xl">
                            <Image
                                src={TeamsPhoto}
                                alt="تیم وکیلم"
                                className="h-[420px] w-full rounded-3xl object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* ارزش‌ها */}
            <section className="bg-[#F3F6F4] py-20">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="grid gap-8 md:grid-cols-3">
                        <div className="rounded-2xl bg-white p-8 shadow-sm">
                            <Scale className="h-10 w-10 text-[#C9A96E]" />

                            <h3 className="mt-5 text-xl font-bold text-[#163832]">
                                عدالت
                            </h3>

                            <p className="mt-3 leading-8 text-gray-500">
                                پایبندی به اصول حرفه‌ای و تلاش برای ارائه بهترین
                                راهکارهای حقوقی به هر پرونده.
                            </p>
                        </div>

                        <div className="rounded-2xl bg-white p-8 shadow-sm">
                            <BriefcaseBusiness className="h-10 w-10 text-[#C9A96E]" />

                            <h3 className="mt-5 text-xl font-bold text-[#163832]">
                                تخصص
                            </h3>

                            <p className="mt-3 leading-8 text-gray-500">
                                استفاده از دانش و تجربه متخصصان حقوقی در
                                حوزه‌های مختلف برای تصمیم‌گیری دقیق‌تر.
                            </p>
                        </div>

                        <div className="rounded-2xl bg-white p-8 shadow-sm">
                            <Users className="h-10 w-10 text-[#C9A96E]" />

                            <h3 className="mt-5 text-xl font-bold text-[#163832]">
                                همراهی
                            </h3>

                            <p className="mt-3 leading-8 text-gray-500">
                                در تمام مراحل مسیر حقوقی، کاربران و موکلین تنها
                                نیستند و تیم وکیلم در کنار آن‌ها خواهد بود.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-[#0D302A] py-20">
                <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
                    <h2 className="text-3xl font-extrabold text-white md:text-4xl">
                        به یک تیم حقوقی قابل اعتماد نیاز دارید؟
                    </h2>

                    <p className="mx-auto mt-5 max-w-2xl leading-8 text-gray-300">
                        برای دریافت مشاوره و شروع مسیر حل مسئله حقوقی خود، با
                        تیم وکیلم در ارتباط باشید.
                    </p>

                    <button className="mt-8 inline-flex items-center gap-3 rounded-xl bg-[#C9A96E] px-7 py-3 font-bold text-[#0D302A] transition hover:bg-[#D8BB82]">
                        ارتباط با ما
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                </div>
            </section>
        </main>
    );
};

export default TeamPage;
