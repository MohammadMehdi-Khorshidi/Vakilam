import { ArrowLeft } from 'lucide-react';

import { Vazirmatn } from 'next/font/google';

const vazirmatn = Vazirmatn({
    subsets: ['arabic'],
    display: 'swap',
});

const CaseHeader = ({ caseData }) => {
    return (
        <section dir="rtl" className={`${vazirmatn.className} mb-6`}>
            <div className="flex items-end justify-between gap-6">
                <div>

                    <h1 className="mt-2 font-bold text-2xl tracking-tight text-[#123f37]">
                        {caseData?.title || 'مطالبه وجه چک'}
                    </h1>

                    <p className="mt-2 leading-7 text-[#7b8783]">
                        شناسه پرونده:{' '}
                        <span className="font-medium">
                            {caseData?.code || 'VK-1405-00128'}
                        </span>
                        {' · '}
                        {caseData?.status || 'در حال انتخاب وکیل'}
                    </p>
                </div>

                <button
                    type="button"
                    className="inline-flex shrink-0 items-center gap-2 rounded-[11px] bg-[#123f37] px-5 py-3 font-bold text-white shadow-[0_7px_18px_rgba(18,63,55,0.15)] transition hover:bg-[#0d302a]"
                >
                    مشاهده اقدام‌ها
                    <ArrowLeft size={16} />
                </button>
            </div>
        </section>
    );
};

export default CaseHeader;
