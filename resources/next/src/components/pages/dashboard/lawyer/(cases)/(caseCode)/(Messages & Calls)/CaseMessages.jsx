'use client';

import { Info, Mic, Phone, Send, Video } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ChatMessage from './ChatMessage';


const initialMessages = [
    {
        id: 'MSG-101',
        sender: 'client',
        text: 'قرارداد پایه را در اسناد پرونده بارگذاری کردم.',
        sentAt: '2026-08-27T08:27:00.000Z',
    },
    {
        id: 'MSG-102',
        sender: 'lawyer',
        text: 'دریافت شد. پس از بررسی، اقدام بعدی را در مرکز اقدامات ثبت می‌کنم.',
        sentAt: '2026-08-27T08:34:00.000Z',
    },
];

function createMessageId() {
    return `MSG-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function CaseMessages({ caseItem }) {
    const storageKey = `vakilam-case-messages-${caseItem.code}`;

    const [messages, setMessages] = useState(initialMessages);

    const [messageText, setMessageText] = useState('');

    const [isLoaded, setIsLoaded] = useState(false);

    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    useEffect(() => {
        try {
            const storedMessages = window.localStorage.getItem(storageKey);

            if (storedMessages) {
                const parsedMessages = JSON.parse(storedMessages);

                if (Array.isArray(parsedMessages)) {
                    setMessages(parsedMessages);
                }
            }
        } catch {
            setMessages(initialMessages);
        } finally {
            setIsLoaded(true);
        }
    }, [storageKey]);

    useEffect(() => {
        if (!isLoaded) {
            return;
        }

        window.localStorage.setItem(storageKey, JSON.stringify(messages));
    }, [isLoaded, messages, storageKey]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
        });
    }, [messages]);

    function sendMessage() {
        const cleanedMessage = messageText.trim();

        if (!cleanedMessage) {
            return;
        }

        const newMessage = {
            id: createMessageId(),
            sender: 'lawyer',
            text: cleanedMessage,
            sentAt: new Date().toISOString(),
        };

        setMessages((currentMessages) => [...currentMessages, newMessage]);

        setMessageText('');

        textareaRef.current?.focus();
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

    function handleContactClick(type) {
        const messages = {
            voice: 'درخواست تماس صوتی داخل سامانه ثبت شد.',
            video: 'درخواست تماس تصویری داخل سامانه ثبت شد.',
            voiceMessage: 'امکان ضبط پیام صوتی در مرحله بعد اضافه می‌شود.',
        };

        window.alert(messages[type]);
    }

    return (
        <div className="space-y-5">
            <section className="flex items-start gap-3 rounded-2xl border border-sky-200 bg-sky-50 p-5">
                <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-white text-sky-700">
                    <Info size={19} />
                </div>

                <div>
                    <h2 className="text-sm font-bold text-[#183d36]">
                        ارتباط کنترل‌شده
                    </h2>

                    <p className="mt-2 text-sm leading-7 text-[#71817d]">
                        شماره تماس، ایمیل، نشانی، لینک بیرونی و پیشنهاد پرداخت
                        خارج از وکیلم مسدود و ثبت می‌شود.
                    </p>
                </div>
            </section>

            <div className="grid gap-5 xl:grid-cols-[1fr_1.2fr]">
                <ContactMethods onContactClick={handleContactClick} />

                <section className="flex min-h-[610px] flex-col rounded-2xl border border-[#dce6e2] bg-white p-6 shadow-sm">
                    <header className="border-b border-[#edf1ef] pb-5">
                        <h2 className="text-xl font-bold text-[#123b34]">
                            گفت‌وگوی {caseItem.title}
                        </h2>

                        <p className="mt-2 text-xs text-[#879590]">
                            موکل: {caseItem.client}
                        </p>
                    </header>

                    <div className="my-5 flex max-h-[400px] flex-1 flex-col gap-3 overflow-y-auto px-1">
                        {messages.length ? (
                            messages.map((message) => (
                                <ChatMessage
                                    key={message.id}
                                    message={message}
                                />
                            ))
                        ) : (
                            <div className="grid flex-1 place-items-center text-center">
                                <p className="text-sm text-[#879590]">
                                    هنوز پیامی ارسال نشده است.
                                </p>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSubmit} className="mt-auto">
                        <textarea
                            ref={textareaRef}
                            value={messageText}
                            onChange={(event) =>
                                setMessageText(event.target.value)
                            }
                            onKeyDown={handleKeyDown}
                            rows={4}
                            maxLength={2000}
                            placeholder="پیام خود را داخل وکیلم بنویسید..."
                            className="w-full resize-none rounded-xl border border-[#dce6e2] bg-white px-4 py-3 text-sm leading-7 text-[#183d36] outline-none transition placeholder:text-[#9aa6a2] focus:border-[#0b5648]"
                        />

                        <div className="mt-2 flex items-center justify-between gap-3">
                            <span className="text-xs text-[#97a29f]">
                                {messageText.length.toLocaleString('fa-IR')}
                                /۲۰۰۰
                            </span>

                            <button
                                type="submit"
                                disabled={!messageText.trim()}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0b5648] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#073f35] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Send size={17} />
                                ارسال پیام
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        </div>
    );
}

function ContactMethods({ onContactClick }) {
    return (
        <section className="rounded-2xl border border-[#dce6e2] bg-white p-6 shadow-sm">
            <header className="border-b border-[#edf1ef] pb-5">
                <h2 className="text-xl font-bold text-[#123b34]">
                    تماس‌های داخل سامانه
                </h2>
            </header>

            <div className="mt-5 space-y-3">
                <ContactButton
                    icon={Phone}
                    title="تماس صوتی"
                    description="بدون نمایش شماره واقعی"
                    onClick={() => onContactClick('voice')}
                />

                <ContactButton
                    icon={Video}
                    title="تماس تصویری"
                    description="داخل وکیلم و ثبت‌شده در پرونده"
                    onClick={() => onContactClick('video')}
                />

                <ContactButton
                    icon={Mic}
                    title="پیام صوتی به متن"
                    description="متن گفتار برای موکل موقتاً محدود است"
                    onClick={() => onContactClick('voiceMessage')}
                />
            </div>
        </section>
    );
}

function ContactButton({ icon: Icon, title, description, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex w-full items-center gap-4 rounded-xl border border-[#e3eae7] bg-white p-4 text-right transition hover:border-[#b9cec7] hover:bg-[#f7faf9]"
        >
            <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-[#edf6f2] text-[#0b5648]">
                <Icon size={20} />
            </div>

            <div>
                <strong className="block text-sm text-[#183d36]">
                    {title}
                </strong>

                <span className="mt-1 block text-xs text-[#879590]">
                    {description}
                </span>
            </div>
        </button>
    );
}
