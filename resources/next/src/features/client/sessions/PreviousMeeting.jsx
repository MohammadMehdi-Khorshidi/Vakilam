import { CheckCircle2, Eye } from 'lucide-react';

import { Vazirmatn } from 'next/font/google';

const vazirmatn = Vazirmatn({
    subsets: ['arabic'],
    display: 'swap',
});

const PreviousMeeting = () => {
    return (
        <article
            dir="rtl"
            className={`${vazirmatn.className} rounded-[18px] border border-[#dfe7e3] bg-white p-5 shadow-[0_5px_20px_rgba(18,63,55,0.035)]`}
        >
            <div className="flex items-center justify-between">
                <h2 className="font-extrabold text-[#173f38]">جلسه قبلی</h2>

                <CheckCircle2 size={19} className="text-[#2b8a63]" />
            </div>

            <div className="my-4 h-px bg-[#e8eeeb]" />

            <p className="leading-8 text-[#667772]">
                خلاصه جلسه توسط دستیار آماده شده و پس از اصلاح و تأیید وکیل و
                کاربران مجاز در پرونده ثبت شده است.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#cce5d9] bg-[#f0f8f4] px-3 py-1.5 font-bold text-[#287857]">
                    <CheckCircle2 size={13} />
                    خلاصه تأییدشده
                </span>

                <span className="rounded-full border border-[#dce5e1] bg-[#f7faf9] px-3 py-1.5 font-bold text-[#6d7d78]">
                    ۳ اقدام استخراج‌شده
                </span>
            </div>

            <button
                type="button"
                className="mt-4 inline-flex items-center gap-2 font-bold text-[#123f37] transition-colors hover:text-[#b28b42]"
            >
                <Eye size={15} />
                مشاهده خلاصه جلسه
            </button>
        </article>
    );
};

export default PreviousMeeting;
