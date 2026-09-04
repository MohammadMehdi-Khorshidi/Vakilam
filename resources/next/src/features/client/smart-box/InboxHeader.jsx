'use client';

import { Vazirmatn } from 'next/font/google';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

const InboxHeader = () => {
    return (
        <header dir="ltr" className={vazir.className}>
            <h1 className="mt-2 text-right font-extrabold leading-[1.7] text-[#103b34] md:text-[34px]">
                اتفاق‌های مهم یکجا
            </h1>

            <p className="mt-2 text-right leading-7 text-[#8a9994]">
                پیشنهادها، هشدارها، وضعیت پرداخت و خروجی‌های نیازمند تأیید در
                این بخش دیده می‌شوند.
            </p>
        </header>
    );
};

export default InboxHeader;
