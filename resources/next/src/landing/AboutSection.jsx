import Image from 'next/image';
import AboutImage from '@/assets/images/AboutPhoto.jpeg';
import { ArrowLeft } from 'lucide-react';
import { Vazirmatn } from 'next/font/google';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

const AboutSection = () => {
    return (
        <section
            dir="rtl"
            className={`${vazir.className} w-full bg-[#0d302a] px-6 py-16 text-white md:px-12 lg:px-20`}
        >
            <div className="mx-auto max-w-7xl">
                {/* گرید اصلی */}
                <div className="grid items-center gap-10 lg:grid-cols-2">
                    {/* سمت راست - متن */}
                    <div className="order-1">
                        <span className="block text-3xl font-bold text-[#c9a96e]">
                            درباره وکیلم
                        </span>

                        <h2 className="mt-1 text-3xl leading-tight font-bold md:text-4xl">
                            همراه شما در مسیر{' '}
                            <span className="text-[#c9a96e]">حقوقی</span>
                        </h2>
                        <h3 className="text-2xl leading-relaxed font-bold md:text-3xl">
                            تجربه، تخصص و همراهی{' '}
                            <span className="text-[#c9a96e]">در کنار شما</span>
                        </h3>

                        <p className="mt-3 text-sm leading-7 text-white/70 md:text-base">
                            ما با هدف ارائه خدمات حقوقی تخصصی و قابل اعتماد
                            فعالیت می‌کنیم. تلاش ما این است که با بررسی دقیق
                            شرایط هر پرونده و ارائه راهکارهای متناسب، مسیر
                            تصمیم‌گیری و پیگیری امور حقوقی را برای موکلان
                            ساده‌تر کنیم.
                        </p>

                        <p className="mt-2 text-sm leading-7 text-white/70 md:text-base">
                            حفظ محرمانگی اطلاعات، شفافیت در روند پرونده و پیگیری
                            مسئولانه امور، از اصول اصلی ما در ارائه خدمات حقوقی
                            است.
                        </p>

                        {/* دکمه */}
                        <button
                            type="button"
                            className="mx-auto mt-6 flex w-fit items-center gap-3 rounded-xl bg-[#c9a96e] px-6 py-3 text-sm font-bold text-[#0d302a] transition transition-all duration-300 ease-out hover:scale-[1.04] hover:shadow-md lg:mx-0"
                        >
                            همکاری با ما
                            <ArrowLeft className="h-4 w-4" />
                        </button>
                    </div>

                    {/* سمت چپ - عکس */}
                    <div className="order-2 hidden overflow-hidden rounded-3xl sm:block">
                        <Image
                            src={AboutImage}
                            alt="دفتر حقوقی"
                            width={900}
                            height={650}
                            className="h-[320px] w-full object-cover md:h-[420px]"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutSection;
