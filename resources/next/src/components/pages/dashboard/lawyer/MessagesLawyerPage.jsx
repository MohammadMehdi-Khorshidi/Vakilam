'use client';

import { Vazirmatn } from 'next/font/google';

import MessagesList from './(messages)/MessagesList';
import { messages } from './(messages)/messagesData';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700'],
});

const MessagesLawyerPage = () => {
    return (
        <main
            dir="rtl"
            className={`${vazir.className} min-h-screen w-full min-w-0 bg-[#f5f8f6] px-4 py-8 text-[#0b302b] sm:px-6 lg:px-8 xl:px-10`}
        >
            <div className="mx-auto w-full max-w-[1500px]">
                {/* عنوان صفحه */}
                <header className="mb-7">
                    <div className="mb-3 flex items-center gap-2">
                        <span className="h-px w-7 bg-[#c9a96e]" />

                        <span className="text-xs font-semibold text-[#a27b32]">
                            پیام‌ها و تماس‌ها
                        </span>
                    </div>

                    <h1 className="text-2xl font-extrabold tracking-tight text-[#0b302b] sm:text-3xl">
                        نمای تجمیعی گفت‌وگوهای پرونده‌ها
                    </h1>

                    <p className="mt-3 text-sm leading-7 text-[#7b8985]">
                        برای مشاهده متن کامل و ارسال پیام، وارد فضای همان پرونده
                        شوید.
                    </p>
                </header>

                {/* لیست پیام‌ها */}
                <MessagesList messages={messages} />
            </div>
        </main>
    );
};

export default MessagesLawyerPage;
