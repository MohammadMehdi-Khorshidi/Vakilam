'use client';

import { useState } from 'react';
import {
    Send,
    Paperclip,
    Mic,
    Phone,
    Video,
} from 'lucide-react';

import { Vazirmatn } from 'next/font/google';

const vazirmatn = Vazirmatn({
    subsets: ['arabic'],
    display: 'swap',
});

const initialMessages = [
    {
        id: 1,
        sender: 'lawyer',
        text: 'سلام، مدارک اولیه پرونده را بررسی کردم.',
        time: '۱۰:۲۰',
    },
    {
        id: 2,
        sender: 'client',
        text: 'سلام وقت بخیر. قرارداد را هم در بخش اسناد قرار دادم.',
        time: '۱۰:۲۷',
    },
    {
        id: 3,
        sender: 'lawyer',
        text: 'بله، دریافت شد. برای جلسه بعد درباره قرارداد پایه و زمان صدور چک صحبت می‌کنیم.',
        time: '۱۰:۳۱',
    },
];

const ChatBox = () => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState(initialMessages);

    const sendMessage = () => {
        const value = message.trim();

        if (!value) return;

        setMessages((prev) => [
            ...prev,
            {
                id: Date.now(),
                sender: 'client',
                text: value,
                time: new Date().toLocaleTimeString('fa-IR', {
                    hour: '2-digit',
                    minute: '2-digit',
                }),
            },
        ]);

        setMessage('');
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    };

    return (
        <section
            dir="rtl"
            className={`${vazirmatn.className} flex h-[620px] flex-col overflow-hidden rounded-[18px] border border-[#dfe7e3] bg-white shadow-[0_5px_20px_rgba(18,63,55,0.035)]`}
        >
            {/* Header چت */}
            <div className="flex shrink-0 items-center justify-between border-b border-[#e7eeeb] px-5 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#123f37] font-extrabold text-white">
                        و
                    </div>

                    <div className="text-right">
                        <h2 className="font-extrabold text-[#173f38]">
                            وکیل پرونده
                        </h2>

                        <div className="mt-1 flex items-center gap-2 text-[#71817c]">
                            <span className="h-2 w-2 rounded-full bg-[#3a9b6e]" />
                            آنلاین
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#dce6e2] text-[#123f37] transition hover:bg-[#f1f6f3]"
                    >
                        <Phone size={18} />
                    </button>

                    <button
                        type="button"
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#dce6e2] text-[#123f37] transition hover:bg-[#f1f6f3]"
                    >
                        <Video size={18} />
                    </button>
                </div>
            </div>

            {/* پیام‌ها */}
            <div className="flex-1 space-y-4 overflow-y-auto bg-[#f8faf9] px-5 py-5">
                <div className="flex justify-center">
                    <span className="rounded-full bg-white px-4 py-2 text-[#899691] shadow-sm">
                        امروز
                    </span>
                </div>

                {messages.map((item) => {
                    const isClient = item.sender === 'client';

                    return (
                        <div
                            key={item.id}
                            className={`flex ${
                                isClient
                                    ? 'justify-start'
                                    : 'justify-end'
                            }`}
                        >
                            <div
                                className={`max-w-[75%] rounded-[16px] px-4 py-3 ${
                                    isClient
                                        ? 'rounded-tl-[5px] bg-[#123f37] text-white'
                                        : 'rounded-tr-[5px] border border-[#dfe7e3] bg-white text-[#52645f]'
                                }`}
                            >
                                <p className="leading-7">
                                    {item.text}
                                </p>

                                <div
                                    className={`mt-2 flex items-center gap-2 ${
                                        isClient
                                            ? 'text-[#c9ddd6]'
                                            : 'text-[#9aa6a2]'
                                    }`}
                                >
                                    <span>{item.time}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Input */}
            <div className="shrink-0 border-t border-[#e7eeeb] bg-white p-4">
                <div className="flex items-end gap-2 rounded-[15px] border border-[#dce5e1] bg-[#fafcfb] p-2 transition focus-within:border-[#123f37]">
                    <button
                        type="button"
                        className="mb-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#6f807a] transition hover:bg-[#edf4f1] hover:text-[#123f37]"
                    >
                        <Paperclip size={18} />
                    </button>

                    <textarea
                        value={message}
                        onChange={(event) =>
                            setMessage(event.target.value)
                        }
                        onKeyDown={handleKeyDown}
                        rows={2}
                        placeholder="پیام خود را بنویسید..."
                        className="min-h-[45px] flex-1 resize-none bg-transparent px-2 py-2 leading-6 text-[#294e46] outline-none placeholder:text-[#9aa6a2]"
                    />

                    <button
                        type="button"
                        className="mb-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#6f807a] transition hover:bg-[#edf4f1] hover:text-[#123f37]"
                    >
                        <Mic size={18} />
                    </button>

                    <button
                        type="button"
                        onClick={sendMessage}
                        className="mb-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#123f37] text-white shadow-[0_5px_12px_rgba(18,63,55,0.15)] transition hover:bg-[#0d302a]"
                    >
                        <Send size={17} />
                    </button>
                </div>

                <p className="mt-2 text-center text-[#899691]">
                    پیام‌های شما در محیط امن وکیلم ثبت و نگهداری می‌شوند.
                </p>
            </div>
        </section>
    );
};

export default ChatBox;
