'use client';

import { Vazirmatn } from 'next/font/google';
import { ArrowLeft } from 'lucide-react';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

const ContractHeader = () => {
    return (
        <header
            dir="rtl"
            className={`${vazir.className} flex flex-col mt-10 gap-5 lg:flex-row lg:items-end lg:justify-between`}
        >
            <div>
                <h1 className="mt-2 text-right text-[28px] font-extrabold leading-[1.7] text-[#103b34] md:text-[34px]">
                    مرور شرایط پیش از پرداخت
                </h1>

                <p className="mt-1 text-right  leading-7 text-[#8a9994]">
                    رابطه همکاری از پرونده جداست و همه وضعیت‌های آن در سوابق
                    نگهداری می‌شود.
                </p>
            </div>

            <button
                type="button"
                className="inline-flex w-fit items-center gap-2 rounded-2xl bg-[#0d4a3e] px-5 py-3 font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#123f37]"
            >
                تأیید و پرداخت پیش‌پرداخت
                <ArrowLeft size={15} />
            </button>
        </header>
    );
};

export default ContractHeader;
