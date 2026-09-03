'use client';

import { Vazirmatn } from 'next/font/google';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

const notifications = [
    {
        title: 'پیشنهاد همکاری جدید',
        subtitle: 'پیشنهاد · ۱۳ دقیقه پیش',
        icon: 'پ',
        active: true,
    },
    {
        title: 'دو مورد از خلاصه پرونده نیازمند تأیید شماست',
        subtitle: 'هوش مصنوعی · ۴۵ دقیقه پیش',
        icon: 'ه',
        active: false,
    },
    {
        title: 'یادآوری محرمانگی مدارک پرونده',
        subtitle: 'امنیت · دیروز',
        icon: 'ا',
        active: false,
    },
    {
        title: 'پرداخت پس از انتخاب وکیل فعال می‌شود',
        subtitle: 'پرداخت · ۲ روز پیش',
        icon: 'پ',
        active: false,
    },
];

const InboxNotifications = () => {
    return (
        <section
            dir="ltr"
            className={`${vazir.className} rounded-[20px] border border-[#dfe8e3] bg-white p-5 shadow-[0_4px_20px_rgba(13,48,42,0.035)]`}
        >
            <div className="border-b text-right border-[#edf1ef] pb-4">
                <h2 className=" font-extrabold text-[#173f37]">
                    اتفاق‌های مهم
                </h2>
            </div>

            <div className="mt-3 flex flex-col gap-2">
                {notifications.map((item) => (
                    <button
                        key={item.title}
                        type="button"
                        className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-right transition ${
                            item.active
                                ? 'bg-[#f1f7f5]'
                                : 'bg-transparent hover:bg-[#f7faf8]'
                        }`}
                    >
                        {/* Icon */}
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f6f1e5] text-[13px] font-bold text-[#173f37]">
                            {item.icon}
                        </div>

                        {/* Text */}
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-[12px] font-bold text-[#354741]">
                                {item.title}
                            </p>

                            <p className="mt-1  text-[#97a19e]">
                                {item.subtitle}
                            </p>
                        </div>
                    </button>
                ))}
            </div>
        </section>
    );
};

export default InboxNotifications;
