'use client';

import { useRouter } from 'next/navigation';
import { Vazirmatn } from 'next/font/google';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700'],
});

const ProposalActions = () => {
    const router = useRouter();

    return (
        <div
            dir="rtl"
            className={`${vazir.className} mt-7 flex flex-col-reverse gap-3 border-t border-[#edf0ee] pt-5 sm:flex-row sm:items-center sm:justify-between`}
        >
            <button
                type="button"
                onClick={() => router.back()}
                className="rounded-xl border border-[#dce5e0] bg-white px-6 py-3 font-bold text-[#40564f] transition hover:bg-[#f7faf8]"
            >
                انصراف
            </button>

            <button
                type="button"
                onClick={() => router.push('/lawyer/proposals')}
                className="rounded-xl bg-[#123f37] px-6 py-3 font-bold text-white shadow-[0_8px_20px_rgba(18,63,55,0.12)] transition hover:-translate-y-1 hover:bg-[#1d5147]"
            >
                ارسال پیشنهاد نمایشی
            </button>
        </div>
    );
};

export default ProposalActions;
