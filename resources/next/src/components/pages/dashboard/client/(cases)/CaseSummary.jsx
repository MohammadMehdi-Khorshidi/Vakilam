import { FilePenLine } from 'lucide-react';

import { Vazirmatn } from 'next/font/google';

const vazirmatn = Vazirmatn({
    subsets: ['arabic'],
    display: 'swap',
});

const CaseSummary = ({ summary }) => {
    return (
        <section
            dir="rtl"
            className={`${vazirmatn.className} rounded-[18px] border border-[#dfe7e4] bg-white p-5 shadow-[0_4px_18px_rgba(18,63,55,0.035)]`}
        >
            <h2 className="font-extrabold text-[#173f38]">خلاصه پرونده</h2>

            <div className="my-4 h-px bg-[#edf1ef]" />

            <p className="leading-8 text-[#62736e]">{summary}</p>

            <button
                type="button"
                className="mt-4 inline-flex items-center gap-2 font-bold text-[#176154] transition hover:text-[#123f37]"
            >
                <FilePenLine size={15} />
                مشاهده تاریخچه اصلاحات
            </button>
        </section>
    );
};

export default CaseSummary;
