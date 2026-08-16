import Image from 'next/image';
import AboutImage from "@/assets/images/AboutPhoto.png"
import { Scale, ShieldCheck, Users, Award } from 'lucide-react';

import { Vazirmatn } from 'next/font/google';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});
const AboutSection = () => {
    return (
        <section
            dir="rtl"
            className={`${vazir.className} w-full bg-[#0d302a] px-6 py-20 text-white md:px-12 lg:px-20`}
        >
            <div className="mx-auto max-w-7xl">
                {/* عنوان بخش */}
                <div className="mb-14 text-center">
                    <span className="mb-3 inline-block text-sm font-medium text-[#c9a96e]">
                        درباره ما
                    </span>

                    <h2 className="text-3xl leading-relaxed font-bold md:text-4xl">
                        همراه شما در مسیر
                        <span className="text-[#c9a96e]"> حقوقی</span>
                    </h2>

                    <p className="mx-auto mt-4 max-w-2xl text-sm leading-8 text-white/70 md:text-base">
                        ارائه خدمات حقوقی تخصصی با رویکردی دقیق، شفاف و
                        مسئولانه؛ برای اینکه در مسیر پرونده خود تنها نباشید.
                    </p>
                </div>

                {/* محتوا */}
                <div className="grid items-center gap-12 lg:grid-cols-2">
                    {/* عکس */}
                    <div className="relative overflow-hidden rounded-3xl">
                        <Image
                            src={AboutImage}
                            alt="دفتر حقوقی"
                            width={900}
                            height={650}
                            className="h-[350px] w-full object-cover md:h-[450px]"
                        />

                        {/* لایه روی عکس */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0d302a]/70  via-transparent to-transparent" />

                        {/* کارت روی عکس */}
                        <div className="absolute right-5 bottom-5 left-5 rounded-2xl border border-white/10 bg-[#0d302a]/90 p-5 backdrop-blur-md">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#c9a96e]/15">
                                    <Scale className="h-6 w-6 text-[#c9a96e]" />
                                </div>

                                <div>
                                    <p className="font-bold">تخصص و اعتماد</p>
                                    <p className="mt-1 text-xs text-white/60">
                                        همراه شما در تمامی مراحل پرونده
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* متن */}
                    <div>
                        <span className="text-sm font-medium text-[#c9a96e]">
                            چرا ما؟
                        </span>

                        <h3 className="mt-3 text-2xl leading-relaxed font-bold md:text-3xl">
                            تجربه، تخصص و همراهی
                            <br />
                            در کنار شما
                        </h3>

                        <p className="mt-6 text-sm leading-8 text-white/70 md:text-base">
                            ما با هدف ارائه خدمات حقوقی تخصصی و قابل اعتماد
                            فعالیت می‌کنیم. تلاش ما این است که با بررسی دقیق
                            شرایط هر پرونده و ارائه راهکارهای متناسب، مسیر
                            تصمیم‌گیری و پیگیری امور حقوقی را برای موکلان
                            ساده‌تر کنیم.
                        </p>

                        <p className="mt-4 text-sm leading-8 text-white/70 md:text-base">
                            حفظ محرمانگی اطلاعات، شفافیت در روند پرونده و پیگیری
                            مسئولانه امور، از اصول اصلی ما در ارائه خدمات حقوقی
                            است.
                        </p>

                        {/* کارت‌ها */}
                        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:-translate-y-1 hover:bg-white/[0.07]">
                                <ShieldCheck className="mb-4 h-7 w-7 text-[#c9a96e]" />

                                <h4 className="text-sm font-bold">
                                    حفظ محرمانگی
                                </h4>

                                <p className="mt-2 text-xs leading-6 text-white/50">
                                    حفاظت از اطلاعات و حریم خصوصی موکلان
                                </p>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:-translate-y-1 hover:bg-white/[0.07]">
                                <Award className="mb-4 h-7 w-7 text-[#c9a96e]" />

                                <h4 className="text-sm font-bold">
                                    تخصص و تجربه
                                </h4>

                                <p className="mt-2 text-xs leading-6 text-white/50">
                                    بررسی دقیق و ارائه راهکارهای تخصصی
                                </p>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:-translate-y-1 hover:bg-white/[0.07]">
                                <Users className="mb-4 h-7 w-7 text-[#c9a96e]" />

                                <h4 className="text-sm font-bold">
                                    همراهی با شما
                                </h4>

                                <p className="mt-2 text-xs leading-6 text-white/50">
                                    همراه شما از مشاوره تا پیگیری پرونده
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutSection;
