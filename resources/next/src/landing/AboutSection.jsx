import Image from 'next/image';
import { Vazirmatn } from 'next/font/google';
import { ArrowLeft } from 'lucide-react';

import AboutImage from '@/assets/images/AboutPhoto.jpeg';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

const AboutSection = () => {
    return (
        <section
            dir="rtl"
            className={`${vazir.className}  w-full bg-[#0d302a] px-6 py-16 text-white md:px-12 lg:px-20`}
        >
            <div className="mx-auto max-w-7xl">
                <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
                    <div className="order-1 text-right lg:order-1">
                        <span className="mb-4 inline-block text-2xl font-bold text-[#b08b4f]">
                            درباره وکیلم
                        </span>

                        <h2 className="max-w-xl text-3xl font-extrabold leading-[1.5] text-[#ffff] md:text-4xl lg:text-5xl">
                            همراه شما برای
                            <span className="text-[#b08b4f]">
                                {' '}
                                یک مسیر حقوقی مطمئن
                            </span>
                        </h2>

                        <p className="mt-6 max-w-xl text-base leading-8 text-white md:text-lg">
                            در وکیلم تلاش می‌کنیم مسیر دریافت خدمات حقوقی را
                            ساده‌تر، شفاف‌تر و مطمئن‌تر کنیم. هدف ما این است که
                            شما در هر مرحله از پرونده، اطلاعات کافی و پشتیبانی
                            حرفه‌ای داشته باشید.
                        </p>

                        <p className="mt-4 max-w-xl text-base leading-8 text-white">
                            تیم ما با تکیه بر دانش حقوقی، تجربه و رویکردی
                            مسئولانه، در کنار شماست تا بهترین مسیر ممکن را برای
                            حل مسائل حقوقی پیدا کنید.
                        </p>

                        <button
                            type="button"
                            className="mt-8 inline-flex items-center gap-3 rounded-xl bg-[#c9a96e] px-7 py-3.5 text-sm font-bold text-[#0d302a] transition-all duration-300 hover:shadow-lg"
                        >
                            بیشتر درباره ما
                            <ArrowLeft className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="order-2 lg:order-2">
                        <div className="relative mx-auto w-full max-w-xl">
                            <div className="absolute -bottom-5 -left-5 h-full w-full rounded-3xl border border-[#b08b4f]/30" />

                            <div className="relative overflow-hidden rounded-3xl">
                                <Image
                                    src={AboutImage}
                                    alt="دفتر حقوقی"
                                    width={900}
                                    height={650}
                                    className="h-[350px] w-full object-cover md:h-[450px]"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutSection;
