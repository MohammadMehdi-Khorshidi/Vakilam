import { CalendarDays, Clock3, Video } from 'lucide-react';

import { Vazirmatn } from 'next/font/google';

const vazirmatn = Vazirmatn({
    subsets: ['arabic'],
    display: 'swap',
});

const UpcomingMeeting = () => {
    const meetingDate = new Date();

    const persianDate = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    }).format(meetingDate);

    const persianDay = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
        day: 'numeric',
    }).format(meetingDate);

    const persianMonth = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
        month: 'long',
    }).format(meetingDate);

    return (
        <article
            dir="rtl"
            className={`${vazirmatn.className} relative overflow-hidden rounded-[18px] border border-[#e1c98f] bg-white p-5 shadow-[0_5px_20px_rgba(18,63,55,0.035)]`}
        >
            {/* خط طلایی بالای کارت */}
            <div className="absolute inset-x-0 top-0 h-[2px] bg-[#c9a96e]" />

            <div className="flex items-start justify-between gap-5">
                {/* اطلاعات جلسه */}
                <div className="min-w-0 flex-1">
                    <div className="mb-3 flex items-center justify-between gap-3">
                        <span className="rounded-full border border-[#ead9ac] bg-[#fffaf0] px-3 py-1 font-bold text-[#b28627]">
                            جلسه بعدی
                        </span>
                    </div>

                    <h2 className="font-extrabold text-[#173f38]">
                        بررسی راهبرد مطالبه وجه
                    </h2>

                    <div className="mt-2 flex flex-wrap items-center gap-4 text-[#71817c]">
                        <div className="flex items-center gap-1.5">
                            <CalendarDays size={15} />
                            <span>{persianDate}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                            <Clock3 size={15} />
                            <span>۱۷:۰۰</span>
                        </div>
                    </div>

                    {/* دستور جلسه */}
                    <div className="mt-5">
                        <h3 className="mb-2 font-bold text-[#294e46]">
                            دستور جلسه
                        </h3>

                        <ul className="space-y-2 pr-5 text-[#62736e]">
                            <li className="list-disc">بررسی قرارداد پایه</li>

                            <li className="list-disc">
                                انتخاب مسیر ثبت پیگیری قضایی
                            </li>

                            <li className="list-disc">تعیین مدارک تکمیلی</li>
                        </ul>
                    </div>

                    {/* دکمه */}
                    <div className="mt-5 flex justify-start">
                        <button
                            type="button"
                            className="inline-flex items-center gap-2 rounded-[11px] bg-[#123f37] px-5 py-2.5 font-bold text-white shadow-[0_6px_15px_rgba(18,63,55,0.16)] transition-all duration-200 hover:bg-[#0d302a]"
                        >
                            <Video size={15} />
                            ورود به جلسه
                        </button>
                    </div>
                </div>

                {/* تاریخ */}
                <div className="flex h-[92px] w-[82px] shrink-0 flex-col items-center justify-center rounded-[17px] bg-[#123f37] text-white shadow-[0_8px_18px_rgba(18,63,55,0.14)]">
                    <span className="font-extrabold">{persianDay}</span>

                    <span className="mt-1 font-bold text-[#d8bb82]">
                        {persianMonth}
                    </span>
                </div>
            </div>
        </article>
    );
};

export default UpcomingMeeting;
