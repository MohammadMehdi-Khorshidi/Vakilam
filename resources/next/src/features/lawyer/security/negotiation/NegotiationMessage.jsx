'use client';

import useRelativeTime from '@/hooks/useRelativeTime';

export default function NegotiationMessage({ message }) {
    const isLawyer = message.sender === 'lawyer';

    const relativeTime = useRelativeTime(message.sentAt);

    return (
        <div className={`flex ${isLawyer ? 'justify-start' : 'justify-end'}`}>
            <div
                className={`max-w-[88%] rounded-2xl px-4 py-3 ${
                    isLawyer
                        ? 'rounded-tr-sm bg-[#edf6f2] text-[#183d36]'
                        : 'rounded-tl-sm bg-[#0b5648] text-white'
                }`}
            >
                <p className="text-sm leading-7">{message.text}</p>

                <div
                    className={`mt-2 flex gap-2 text-[11px] ${
                        isLawyer ? 'text-[#879590]' : 'text-white/65'
                    }`}
                >
                    <span>{isLawyer ? 'شما' : 'موکل'}</span>

                    <span>·</span>

                    <time
                        dateTime={message.sentAt}
                        title={new Date(message.sentAt).toLocaleString(
                            'fa-IR',
                            {
                                calendar: 'persian',
                                dateStyle: 'medium',
                                timeStyle: 'short',
                            },
                        )}
                    >
                        {relativeTime}
                    </time>
                </div>
            </div>
        </div>
    );
}
