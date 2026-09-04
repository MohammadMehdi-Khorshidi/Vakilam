'use client';

import { Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import NegotiationMessage from './NegotiationMessage';

export default function NegotiationChat({ caseCode, initialMessages }) {
    const storageKey = `vakilam-negotiation-${caseCode}`;

    const [messages, setMessages] = useState(() => {
        if (typeof window === 'undefined') {
            return initialMessages;
        }

        try {
            const storedMessages = window.localStorage.getItem(storageKey);

            if (storedMessages) {
                const parsedMessages = JSON.parse(storedMessages);

                if (Array.isArray(parsedMessages)) {
                    return parsedMessages;
                }
            }
        } catch {
            // اگر localStorage یا JSON مشکل داشت،
            // از پیام‌های اولیه استفاده می‌کنیم.
        }

        return initialMessages;
    });

    const [text, setText] = useState('');

    const endRef = useRef(null);

    useEffect(() => {
        window.localStorage.setItem(
            storageKey,
            JSON.stringify(messages),
        );
    }, [messages, storageKey]);

    useEffect(() => {
        endRef.current?.scrollIntoView({
            behavior: 'smooth',
        });
    }, [messages]);

    function sendMessage() {
        const cleanedText = text.trim();

        if (!cleanedText) {
            return;
        }

        setMessages((currentMessages) => [
            ...currentMessages,
            {
                id: `NEG-MSG-${Date.now()}`,
                sender: 'lawyer',
                text: cleanedText,
                sentAt: new Date().toISOString(),
            },
        ]);

        setText('');
    }

    function handleSubmit(event) {
        event.preventDefault();
        sendMessage();
    }

    function handleKeyDown(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    }

    return (
        <section className="flex min-h-[620px] flex-col rounded-2xl border border-[#dce6e2] bg-white p-5 shadow-sm">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-800">
                برای حفظ حمایت و سوابق همکاری، اطلاعات تماس و پرداخت بیرونی
                ارسال نکنید.
            </div>

            <div className="my-5 flex max-h-[400px] flex-1 flex-col gap-3 overflow-y-auto">
                {messages.map((message) => (
                    <NegotiationMessage
                        key={message.id}
                        message={message}
                    />
                ))}

                <div ref={endRef} />
            </div>

            <form onSubmit={handleSubmit} className="mt-auto">
                <textarea
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={4}
                    maxLength={2000}
                    placeholder="پیام مربوط به شرایط همکاری را بنویسید..."
                    className="w-full resize-none rounded-xl border border-[#dce6e2] p-4 text-sm leading-7 outline-none transition focus:border-[#0b5648]"
                />

                <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="text-xs text-[#879590]">
                        {text.length.toLocaleString('fa-IR')}
                        /۲۰۰۰
                    </span>

                    <button
                        type="submit"
                        disabled={!text.trim()}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#0b5648] px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Send size={17} />
                        ارسال پیام
                    </button>
                </div>
            </form>
        </section>
    );
}
