'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';

import { Vazirmatn } from 'next/font/google';

const vazirmatn = Vazirmatn({
    subsets: ['arabic'],
    display: 'swap',
});

const ChatBox = ({ conversation, loading, sending, onSend }) => {
    const [message, setMessage] = useState('');
    const messages = conversation?.messages || [];
    const counterpartName = conversation?.counterpart?.name || 'وکیل پرونده';
    const counterpartInitial = Array.from(counterpartName)[0] || 'و';
    const isClosed = conversation?.status !== 'active';

    const sendMessage = async () => {
        const value = message.trim();

        if (!value || sending || isClosed) return;

        if (await onSend(value)) {
            setMessage('');
        }
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
                            {counterpartInitial}
                    </div>

                    <div className="text-right">
                        <h2 className="font-extrabold text-[#173f38]">
                            {counterpartName}
                        </h2>

                        <div className="mt-1 flex items-center gap-2 text-[#71817c]">
                            <span
                                className={`h-2 w-2 rounded-full ${
                                    isClosed ? 'bg-[#9aa6a2]' : 'bg-[#3a9b6e]'
                                }`}
                            />
                            {isClosed ? 'گفتگو بسته شده است' : 'گفتگوی فعال'}
                        </div>
                    </div>
                </div>
            </div>

            {/* پیام‌ها */}
            <div className="flex-1 space-y-4 overflow-y-auto bg-[#f8faf9] px-5 py-5">
                {loading && (
                    <p className="py-12 text-center text-[#899691]">
                        در حال بازیابی پیام‌ها...
                    </p>
                )}

                {!loading && messages.length === 0 && (
                    <p className="py-12 text-center leading-7 text-[#899691]">
                        هنوز پیامی در این گفتگو ثبت نشده است.
                    </p>
                )}

                {messages.map((item) => {
                    const isMine = item.is_mine;
                    const sentAt = item.sent_at
                        ? new Date(item.sent_at).toLocaleTimeString('fa-IR', {
                              hour: '2-digit',
                              minute: '2-digit',
                          })
                        : '';

                    return (
                        <div
                            key={item.id}
                            className={`flex ${
                                isMine
                                    ? 'justify-start'
                                    : 'justify-end'
                            }`}
                        >
                            <div
                                className={`max-w-[75%] rounded-[16px] px-4 py-3 ${
                                    isMine
                                        ? 'rounded-tl-[5px] bg-[#123f37] text-white'
                                        : 'rounded-tr-[5px] border border-[#dfe7e3] bg-white text-[#52645f]'
                                }`}
                            >
                                <p className="leading-7">
                                    {item.body || 'این پیام حذف شده است.'}
                                </p>

                                <div
                                    className={`mt-2 flex items-center gap-2 ${
                                        isMine
                                            ? 'text-[#c9ddd6]'
                                            : 'text-[#9aa6a2]'
                                    }`}
                                >
                                    <span>{sentAt}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Input */}
            <div className="shrink-0 border-t border-[#e7eeeb] bg-white p-4">
                <div className="flex items-end gap-2 rounded-[15px] border border-[#dce5e1] bg-[#fafcfb] p-2 transition focus-within:border-[#123f37]">
                    <textarea
                        value={message}
                        onChange={(event) =>
                            setMessage(event.target.value)
                        }
                        onKeyDown={handleKeyDown}
                        rows={2}
                        disabled={isClosed || sending}
                        placeholder={
                            isClosed
                                ? 'این گفتگو بسته شده است.'
                                : 'پیام خود را بنویسید...'
                        }
                        className="min-h-[45px] flex-1 resize-none bg-transparent px-2 py-2 leading-6 text-[#294e46] outline-none placeholder:text-[#9aa6a2]"
                    />

                    <button
                        type="button"
                        onClick={sendMessage}
                        disabled={!message.trim() || sending || isClosed}
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
