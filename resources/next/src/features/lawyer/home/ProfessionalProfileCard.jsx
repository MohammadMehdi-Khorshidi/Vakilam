import { BriefcaseBusiness, Clock3, ShieldCheck } from 'lucide-react';

import TrustScoreChart from './TrustScoreChart';

export default function ProfessionalProfileCard() {
    return (
        <section
            dir="ltr"
            className="relative overflow-hidden rounded-[28px] bg-[#0d443a] px-6 py-8 text-white shadow-[0_24px_50px_rgba(13,68,58,0.12)] sm:px-9 lg:px-12 lg:py-9"
        >
            <div className="pointer-events-none absolute -left-16 -top-24 size-80 rounded-full border border-[#b9994e]/30" />

            <div className="relative z-10 flex flex-col-reverse items-center gap-9 lg:flex-row lg:justify-between">
                <div className="shrink-0">
                    <TrustScoreChart value={92} />
                </div>

                <div className="w-full text-right lg:max-w-[820px]">
                    <div className="mb-5 flex justify-start lg:justify-end">
                        <span className="inline-flex items-center gap-2 rounded-full border border-[#b89242]/50 bg-white/5 px-4 py-2 text-sm font-bold text-[#ecd596]">
                            <ShieldCheck size={17} />
                            وکیل تأییدشده
                        </span>
                    </div>

                    <h2 className="text-2xl font-black leading-tight sm:text-3xl lg:text-[38px]">
                        پروفایل حرفه‌ای شما فعال است
                    </h2>

                    <p className="mt-4 text-sm leading-7 text-[#b9cbc6]">
                        می‌توانید پرونده‌های متناسب را بررسی کنید، پیشنهاد
                        همکاری بفرستید و همکاری‌های جاری را مدیریت کنید.
                    </p>

                    <div className="mt-7 flex flex-wrap justify-end items-center gap-x-7 gap-y-4 text-sm">
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={17} className="text-[#d4ae59]" />

                            <span className="text-[#b9cbc6]">پروانه</span>
                            <strong>تأییدشده</strong>
                        </div>

                        <div className="flex items-center gap-2">
                            <Clock3 size={17} className="text-[#d4ae59]" />

                            <span className="text-[#b9cbc6]">پاسخگویی</span>
                            <strong>کمتر از ۲ ساعت</strong>
                        </div>

                        <div className="flex items-center gap-2">
                            <BriefcaseBusiness
                                size={17}
                                className="text-[#d4ae59]"
                            />

                            <span className="text-[#b9cbc6]">ظرفیت</span>
                            <strong>۲ پرونده جدید</strong>
                        </div>
                    </div>

                    <div className="mt-7 flex justify-end flex-wrap gap-3">
                        <button
                            type="button"
                            className="cursor-pointer rounded-xl bg-[#c9a96e] px-6 py-3 text-sm font-black text-[#17342e] shadow-[0_10px_25px_rgba(212,174,89,0.22)] transition hover:bg-[#dfbd70]"
                        >
                            مشاهده پرونده‌های پیشنهادی
                        </button>

                        <button
                            type="button"
                            className="cursor-pointer rounded-xl border border-white/30 bg-white/5 px-6 py-3 text-sm font-bold transition hover:bg-white/10"
                        >
                            مرکز اقدامات
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
