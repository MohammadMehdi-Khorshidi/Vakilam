import { Sparkles } from 'lucide-react';

import { Vazirmatn } from 'next/font/google';

const vazirmatn = Vazirmatn({
    subsets: ['arabic'],
    display: 'swap',
});

const LawyersSummary = () => {
    return (
        <section
            dir="rtl"
            className={`${vazirmatn.className} mb-4 rounded-[16px] border border-[#e2c982] bg-[#fffdf8] px-5 py-3.5`}
        >
            <div className="flex items-center justify-between gap-5">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#c9a96e] text-[#173f38]">
                        <Sparkles size={18} strokeWidth={2} />
                    </div>

                    <div className="text-right">
                        <p className="text-[#71817c]">مبنای تطبیق نمایش</p>

                        <h2 className="mt-0.5 font-extrabold text-[#173f38]">
                            حقوقی و مالی · فوریت
                        </h2>
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                    <span className="rounded-full border border-[#cce9dc] bg-[#effaf4] px-3 py-1.5 font-bold text-[#27805a]">
                        احراز تأییدشده
                    </span>

                    <span className="rounded-full border border-[#e2e8e5] bg-white px-3 py-1.5 font-bold text-[#63736e]">
                        تخصص مرتبط
                    </span>

                    <span className="rounded-full border border-[#e2e8e5] bg-white px-3 py-1.5 font-bold text-[#63736e]">
                        ظرفیت پاسخ‌گویی
                    </span>
                </div>
            </div>
        </section>
    );
};

export default LawyersSummary;
