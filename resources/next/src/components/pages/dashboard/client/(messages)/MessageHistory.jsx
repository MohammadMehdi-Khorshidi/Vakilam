import { Mic, MessageSquareText } from 'lucide-react';

import { Vazirmatn } from 'next/font/google';

const vazirmatn = Vazirmatn({
    subsets: ['arabic'],
    display: 'swap',
});

const messages = [
    {
        id: 1,
        type: 'text',
        message:
            'مدارک اولیه را بررسی کردم. برای جلسه بعد درباره قرارداد پایه و زمان صدور چک صحبت می‌کنیم.',
        sender: 'نگار سعادتی',
        time: '۱۰:۲۰',
    },
    {
        id: 2,
        type: 'text',
        message: 'ممنون، قرارداد را هم در بخش اسناد قرار دادم.',
        sender: 'شما',
        time: '۱۰:۲۷',
    },
    {
        id: 3,
        type: 'voice',
        title: 'پیام صوتی تبدیل‌شده به متن',
        message:
            'گواهی عدم پرداخت را هم بررسی کردم و نتیجه را بعد از بررسی کامل اعلام می‌کنم.',
        time: '۱۰:۳۵',
    },
];

const MessageHistory = () => {
    return (
        <section
            dir="rtl"
            className={`${vazirmatn.className} rounded-[18px] border border-[#dfe7e3] bg-white p-5 shadow-[0_5px_20px_rgba(18,63,55,0.035)]`}
        >
            <div className="mb-5 border-b border-[#e8eeeb] pb-4">
                <h2 className="font-extrabold text-[#173f38]">
                    تاریخچه ارتباط
                </h2>
            </div>

            <div className="space-y-3">
                {messages.map((item) => (
                    <div
                        key={item.id}
                        className={`rounded-[15px] p-4 ${
                            item.type === 'voice'
                                ? 'border border-[#d6e5e0] bg-[#f7faf9]'
                                : 'bg-[#f2f7f5]'
                        }`}
                    >
                        {item.type === 'voice' ? (
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#123f37] text-white">
                                    <Mic size={16} />
                                </div>

                                <div className="min-w-0 flex-1 text-right">
                                    <h3 className="font-extrabold text-[#294d46]">
                                        {item.title}
                                    </h3>

                                    <p className="mt-2 leading-7 text-[#667772]">
                                        {item.message}
                                    </p>

                                    <p className="mt-2 text-[#899691]">
                                        متن صوتی فقط طبق سیاست سامانه نگهداری
                                        می‌شود.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-right">
                                <p className="leading-7 text-[#52645f]">
                                    {item.message}
                                </p>

                                <div className="mt-2 flex items-center justify-between gap-3">
                                    <span className="text-[#899691]">
                                        {item.sender}
                                    </span>

                                    <span className="text-[#899691]">
                                        {item.time}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-5 border-t border-[#e8eeeb] pt-4">
                <button
                    type="button"
                    className="flex w-full items-center justify-center gap-2 rounded-[11px] bg-[#123f37] px-4 py-3 font-bold text-white transition-all duration-200 hover:bg-[#0d302a]"
                >
                    <MessageSquareText size={17} />
                    ارسال پیام جدید
                </button>
            </div>
        </section>
    );
};

export default MessageHistory;
