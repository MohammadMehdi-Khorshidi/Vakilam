'use client';

import { Vazirmatn } from 'next/font/google';
import Link from 'next/link';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

const AssistantHeader = () => {
    return (
        <header dir="rtl" className={vazir.className}>
            <div className="mt-12 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <h1 className="text-right text-[28px] font-extrabold leading-[1.7] text-[#103b34] md:text-[34px]">
                        راهنمای مرحله‌به‌مرحله برای پرونده شما
                    </h1>

                    <p className="mt-2 text-right leading-7 text-[#8a9994]">
                        سؤال خود را ساده بپرسید؛ پاسخ‌ها راهنمای اولیه‌اند و
                        اقدام حقوقی نهایی محسوب نمی‌شوند.
                    </p>
                </div>

                <Link
                    href="/client/lawyers"
                    className="w-fit rounded-xl border border-[#c9a96e] bg-white px-5 py-3 font-bold text-[#315e52] transition hover:bg-[#faf7ee]"
                >
                    در صورت نیاز، مشاهده وکلا
                </Link>
            </div>
        </header>
    );
};

export default AssistantHeader;
