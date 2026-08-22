'use client';


import { useRouter } from 'next/navigation';
import { Vazirmatn } from 'next/font/google';
import HeroChart from '@/components/chart/ProgressChart';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});
const Hero = () => {
    const router = useRouter();

    return (
        <section dir="ltr" className={`${vazir.className} w-full bg-[#f8faf9]`}>
            <div className="mx-auto max-w-[1400px] px-4 lg:px-8">
                <div className="flex min-h-[650px] flex-col items-center gap-14 lg:grid lg:min-h-[700px] lg:grid-cols-[1fr_1.2fr] lg:gap-16">
                    <div className="order-1 w-full text-right lg:order-2">
                        <h1 className="text-[34px] font-extrabold leading-[1.7] text-[#0d3831] sm:text-[40px] md:text-[46px] lg:text-[58px]">
                            مسئله حقوقی‌تان را ساده مطرح کنید؛ مسیر همکاری را
                            منظم پیش ببرید.
                        </h1>

                        <p className="mt-6 max-w-[689px] text-[15px] leading-8 text-[#60706d] sm:text-[16px]">
                            وکیلام به شما کمک می‌کند تا انتخاب وکیل، قرارداد،
                            پرداخت و مدیریت همکاری را در کنار شما ساده و منظم
                            پیش ببرید.
                        </p>

                        <div
                            dir="rtl"
                            className="mt-8 flex flex-col gap-3 sm:flex-row"
                        >
                            <button
                                type="button"
                                onClick={() => router.push('/dashboard/client')}
                                className="w-full rounded-lg border border-[#c5a35a] bg-white px-7 py-3.5 text-sm font-bold text-[#123f37] transition-all duration-300 ease-out hover:scale-[1.04] hover:border-[#c5a35a] hover:bg-[#faf6ed] hover:text-[#123f37] hover:shadow-md active:scale-[0.98] sm:w-auto"
                            >
                                موضوع حقوقی‌ام را توضیح می‌دهم
                            </button>
                        </div>

                        <div
                            dir="rtl"
                            className="mt-7 flex flex-wrap gap-x-6 gap-y-2 font-semibold text-[#1c554a]"
                        >
                            <span>✓ محرمانگی مدارک و پیام</span>
                            <span>✓ وکلای دارای احراز هویت</span>
                            <span>✓ پرداخت و قرارداد مرحله‌بندی‌شده</span>
                        </div>
                    </div>

                    <div className="order-2 flex w-full justify-center lg:order-1 lg:justify-start">
                        <HeroChart />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
