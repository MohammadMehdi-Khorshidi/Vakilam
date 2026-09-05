'use client';

import { useEffect, useRef, useState } from 'react';
import { Vazirmatn } from 'next/font/google';
import { Sparkles, Send, User } from 'lucide-react';
import {
    listLegalAssistantMessages,
    sendLegalAssistantMessage,
} from '@/lib/api/legalAssistant';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

const LegalChat = () => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const bottomRef = useRef(null);

    useEffect(() => {
        let mounted = true;

        listLegalAssistantMessages()
            .then((items) => {
                if (mounted) setMessages(items);
            })
            .catch((requestError) => {
                if (mounted) setError(requestError.message);
            })
            .finally(() => {
                if (mounted) setLoading(false);
            });

        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        const text = message.trim();

        if (!text || sending) return;

        setSending(true);
        setError('');
        setMessage('');

        try {
            const result = await sendLegalAssistantMessage(text);
            setMessages((current) => [
                ...current,
                result.user_message,
                result.assistant_message,
            ]);
        } catch (requestError) {
            setMessage(text);
            setError(requestError.message);
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <section
            dir="rtl"
            className={`${vazir.className} flex min-h-[560px] flex-col rounded-[20px] border border-[#dfe8e3] bg-white p-5 shadow-[0_4px_20px_rgba(13,48,42,0.035)]`}
        >
            {/* Header */}
            <div className="shrink-0 border-b border-[#edf1ef] pb-4">
                <h2 className="text-[14px] font-extrabold text-[#173f37]">
                    گفت‌وگوی پرونده
                </h2>

                <p className="mt-1 text-[11px] text-[#8a9994]">
                    راهنمای اولیه و محرمانه
                </p>
            </div>

            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto py-4">
                <div className="flex flex-col gap-4">
                    {loading && (
                        <p className="py-10 text-center text-sm text-[#8a9994]">
                            در حال بازیابی تاریخچه گفتگو...
                        </p>
                    )}

                    {!loading && messages.length === 0 && (
                        <p className="py-10 text-center text-sm leading-7 text-[#8a9994]">
                            هنوز گفتگویی ثبت نشده است. پرسش حقوقی خود را بنویسید
                            تا پاسخ در حساب شما ذخیره شود.
                        </p>
                    )}

                    {messages.map((item) => {
                        const isUser = item.role === 'user';

                        return (
                            <div
                                key={item.id}
                                className={`flex ${
                                    isUser ? 'justify-start' : 'justify-end'
                                }`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-[16px] px-5 py-4 ${
                                        isUser
                                            ? 'bg-[#0d4a3e] text-white'
                                            : 'border border-[#d5e2dd] bg-white text-[#354741]'
                                    }`}
                                >
                                    {/* Message header */}
                                    <div
                                        className={`mb-2 flex items-center gap-2 text-[11px] font-bold ${
                                            isUser
                                                ? 'text-white/70'
                                                : 'text-[#315e52]'
                                        }`}
                                    >
                                        {isUser ? (
                                            <>
                                                <User size={14} />
                                                شما
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles
                                                    size={14}
                                                    className="text-[#b28b43]"
                                                />
                                                دستیار وکیلم
                                            </>
                                        )}
                                    </div>

                                    {/* Message */}
                                    <p className="whitespace-pre-wrap text-[13px] leading-8">
                                        {item.content}
                                    </p>
                                </div>
                            </div>
                        );
                    })}

                    <div ref={bottomRef} />
                </div>
            </div>

            {error && (
                <p className="mb-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </p>
            )}

            {/* Input */}
            <div className="shrink-0 rounded-[18px] border-2 border-[#eadfc4] p-2">
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={3}
                    placeholder="سؤال خود را بنویسید..."
                    className="w-full resize-none bg-transparent px-3 py-2 text-right text-[13px] leading-7 text-[#354741] outline-none placeholder:text-[#9aa6a2]"
                />

                <div className="flex items-center justify-between px-1 pt-2">
                    <span className="text-[10px] text-[#9aa6a2]">
                        Enter برای ارسال · Shift + Enter برای خط جدید
                    </span>

                    <button
                        type="button"
                        onClick={handleSend}
                    disabled={!message.trim() || sending}
                        className="inline-flex appearance-none items-center gap-2 rounded-xl border-0 bg-[#C9A96E] px-5 py-3 text-[11px] font-bold text-white shadow-none outline-none ring-0 transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[#C9A96E] hover:shadow-none focus:border-0 focus:outline-none focus:ring-0 focus-visible:border-0 focus-visible:outline-none focus-visible:ring-0 active:border-0 active:bg-[#C9A96E] active:shadow-none "
                    >
                        {sending ? 'در حال دریافت پاسخ...' : 'دریافت راهنمایی'}
                        <Send size={14} />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default LegalChat;
