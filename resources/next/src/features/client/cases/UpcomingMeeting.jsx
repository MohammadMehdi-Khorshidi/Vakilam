import { CalendarDays, Clock3 } from 'lucide-react';

import { Vazirmatn } from 'next/font/google';

const vazirmatn = Vazirmatn({
    subsets: ['arabic'],
    display: 'swap',
});

const UpcomingMeeting = ({ meeting }) => {
    return (
        <section
            dir="rtl"
            className={`${vazirmatn.className} rounded-[18px] border border-[#dfe7e4] bg-white p-5 shadow-[0_4px_18px_rgba(18,63,55,0.035)]`}
        >
            <div className="flex items-center justify-between">
                <h2 className="font-extrabold text-[#173f38]">جلسه بعدی</h2>

                <span className="font-extrabold text-[#b28627]">
                    {meeting?.day || '۲۶'}
                </span>
            </div>

            <div className="my-4 h-px bg-[#edf1ef]" />

            <div className="flex items-center justify-between gap-4">
                <div>
                    <h3 className="font-bold text-[#294e46]">
                        {meeting?.title || 'جلسه بررسی راهبرد پرونده'}
                    </h3>

                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-[#7b8783]">
                        <span className="flex items-center gap-1.5">
                            <Clock3 size={14} />
                            {meeting?.time || '۱۷:۰۰'}
                        </span>

                        <span className="flex items-center gap-1.5">
                            <CalendarDays size={14} />
                            {meeting?.date || 'سه‌شنبه، ۲۶ تیر'}
                        </span>
                    </div>
                </div>

                <button
                    type="button"
                    className="shrink-0 rounded-[10px] border border-[#e1c98f] bg-[#fffdf8] px-4 py-2.5 font-bold text-[#8f6b24] transition hover:bg-[#fff8e9]"
                >
                    مشاهده جلسه
                </button>
            </div>
        </section>
    );
};

export default UpcomingMeeting;
