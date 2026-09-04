'use client';

import { Vazirmatn } from 'next/font/google';
import { Info } from 'lucide-react';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

const ContractNotice = () => {
    return (
        <section
            dir="rtl"
            className={`${vazir.className} rounded-[16px] border border-[#d5e8ef] bg-[#f1f9fc] p-4`}
        >
            <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#467687]">
                    <Info size={16} />
                </div>

                <div>
                    <h3 className="font-extrabold text-[#315765]">
                        نمونه نمایش
                    </h3>

                    <p className="mt-1 leading-6 text-[#718990]">
                        این بخش برای نمایش وضعیت قرارداد و پرداخت طراحی شده است.
                        پس از ثبت واقعی قرارداد، اطلاعات از پرونده شما نمایش
                        داده خواهد شد.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default ContractNotice;
