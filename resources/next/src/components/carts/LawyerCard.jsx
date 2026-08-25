import {
    BriefcaseBusiness,
    Clock3,
    Star,
    ShieldCheck,
    BarChart3,
    CheckCircle2,
} from 'lucide-react';

import { Vazirmatn } from 'next/font/google';

const vazirmatn = Vazirmatn({
    subsets: ['arabic'],
    display: 'swap',
});

const LawyerCard = ({
    name,
    initial,
    title,
    location,
    description,
    trustScore,
    cooperationScore,
    reviewedCases,
    responseTime,
    experience,
    match,
}) => {
    return (
        <article
            dir="rtl"
            className={`${vazirmatn.className} relative overflow-hidden rounded-[18px] border border-[#dfbd6c] bg-white shadow-[0_5px_20px_rgba(18,63,55,0.04)]`}
        >
            {/* برچسب تماس بیشتر */}
            <div className="absolute left-0 top-0 rounded-br-[14px] rounded-tl-[0] bg-[#c9a96e] px-4 py-2 font-extrabold text-[#173f38]">
                تماس بیشتر با پرونده
            </div>

            <div className="grid grid-cols-1 gap-5 p-5 lg:grid-cols-[1fr_260px]">
                {/* اطلاعات وکیل */}
                <div className="min-w-0" dir="ltr">
                    <div className="flex items-start justify-end gap-3">
                        <div className="min-w-0 flex-1 text-right">
                            <div className="flex items-center justify-end gap-2">
                                <span className="rounded-full border border-[#cce9dc] bg-[#effaf4] px-3 py-1 font-bold text-[#27805a]">
                                    احراز هویت تأییدشده
                                </span>

                                <h2 className="font-extrabold text-[#173f38]">
                                    {name}
                                </h2>
                            </div>

                            <p className="mt-2 text-[#71817c]">
                                {title} · {location}
                            </p>
                        </div>

                        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-[17px] bg-[#123f37] font-extrabold text-white shadow-[0_7px_16px_rgba(18,63,55,0.14)]">
                            {initial}

                            <span className="absolute -bottom-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-[#3a9b6e] text-white">
                                <CheckCircle2 size={12} />
                            </span>
                        </div>
                    </div>

                    <p className="mt-4 text-right leading-7 text-[#62736e]">
                        {description}
                    </p>

                    {/* امتیازها */}
                    <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
                        <div className="flex items-center gap-2 rounded-[10px] border border-[#e3e9e6] bg-white px-3 py-2 text-[#52645f]">
                            <ShieldCheck size={15} />

                            <span>امتیاز اعتماد {trustScore}</span>
                        </div>

                        <div className="flex items-center gap-2 rounded-[10px] border border-[#e3e9e6] bg-white px-3 py-2 text-[#52645f]">
                            <Star size={15} />

                            <span>{cooperationScore} از تجربه همکاری</span>
                        </div>

                        <div className="flex items-center gap-2 rounded-[10px] border border-[#e3e9e6] bg-white px-3 py-2 text-[#52645f]">
                            <CheckCircle2 size={15} />

                            <span>{reviewedCases} بازخورد بررسی‌شده</span>
                        </div>
                    </div>

                    {/* تخصص‌ها */}
                    <div className="mt-3 flex flex-wrap justify-end gap-2">
                        <span className="rounded-full bg-[#f2f7f5] px-3 py-1.5 text-[#52645f]">
                            مطالبات مالی
                        </span>

                        <span className="rounded-full bg-[#f2f7f5] px-3 py-1.5 text-[#52645f]">
                            اسناد تجاری
                        </span>

                        <span className="rounded-full bg-[#f2f7f5] px-3 py-1.5 text-[#52645f]">
                            قراردادها
                        </span>
                    </div>

                    {/* آمار */}
                    <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                        <div className="rounded-[12px] bg-[#f3f8f6] p-3 text-right">
                            <div className="flex items-center justify-end gap-2 text-[#71817c]">
                                <span>سابقه حرفه‌ای</span>

                                <BriefcaseBusiness size={15} />
                            </div>

                            <strong className="mt-2 block font-extrabold text-[#173f38]">
                                {experience}
                            </strong>
                        </div>

                        <div className="rounded-[12px] bg-[#f3f8f6] p-3 text-right">
                            <div className="flex items-center justify-end gap-2 text-[#71817c]">
                                <span>زمان پاسخ</span>

                                <Clock3 size={15} />
                            </div>

                            <strong className="mt-2 block font-extrabold text-[#173f38]">
                                {responseTime}
                            </strong>
                        </div>

                        <div className="rounded-[12px] bg-[#f3f8f6] p-3 text-right">
                            <div className="flex items-center justify-end gap-2 text-[#71817c]">
                                <span>برآورد زمان</span>

                                <BarChart3 size={15} />
                            </div>

                            <strong className="mt-2 block font-extrabold text-[#173f38]">
                                ۴ تا ۶ ماه
                            </strong>
                        </div>
                    </div>
                </div>

                {/* بخش پیشنهاد */}
                <div className="flex flex-col justify-between border-l border-[#e8ecea] pl-5 lg:border-l-0 lg:border-r lg:pr-5">
                    <div className="rounded-[14px] border border-[#e2c982] bg-[#fffdf8] p-4 text-center">
                        <span className="block text-[#7b8783]">
                            تناسب با پرونده
                        </span>

                        <strong className="mt-2 block font-extrabold text-[#b28627]">
                            {match}٪
                        </strong>

                        <span className="mt-1 block text-[#899591]">
                            تناسب با پرونده
                        </span>
                    </div>

                    <div className="mt-4 space-y-2">
                        <button
                            type="button"
                            className="w-full rounded-[11px] border border-[#d6e0dc] bg-white px-4 py-3 font-bold text-[#294e46] transition hover:border-[#123f37] hover:bg-[#f5f8f7]"
                        >
                            مشاهده پروفایل
                        </button>

                        <button
                            type="button"
                            className="w-full rounded-[11px] bg-[#123f37] px-4 py-3 font-bold text-white shadow-[0_6px_15px_rgba(18,63,55,0.14)] transition hover:bg-[#0d302a]"
                        >
                            مشاهده پیشنهاد
                        </button>

                        <p className="text-center leading-6 text-[#899591]">
                            پیشنهاد مالی فقط پس از بررسی پرونده توسط این وکیل،
                            در بخش پیشنهادها نمایش داده می‌شود.
                        </p>
                    </div>
                </div>
            </div>
        </article>
    );
};

export default LawyerCard;
