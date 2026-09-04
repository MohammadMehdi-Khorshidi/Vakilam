'use client';

import { Vazirmatn } from 'next/font/google';
import { useAuth } from '@/auth/AuthProvider';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});
const HomeIntro = () => {
    const { user } = useAuth();
    const fullName = [user?.name, user?.last_name].filter(Boolean).join(' ').trim();

    return (
        <div className={`${vazir.className} mt-10 text-right`}>


            {/* Greeting */}
            <h1 className="text-[28px] font-bold leading-[1.5] text-[#0d302a] lg:text-[34px]">
                سلام{fullName ? ` ${fullName}` : ''}
            </h1>

            {/* Description */}
            <p className="mt-2 text-[13px]  leading-7 text-[#7a8581] lg:text-[14px]">
                از شرح ساده مسئله شروع کنید؛ دستیار وکیلم ابتدا شما را راهنمایی
                می‌کند، سپس در صورت نیاز پرونده و وکیل مناسب پیشنهاد می‌شود.
            </p>
        </div>
    );
};

export default HomeIntro;
