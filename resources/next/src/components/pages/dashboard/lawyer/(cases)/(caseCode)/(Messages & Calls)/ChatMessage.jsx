'use client';

import useRelativeTime from '@/hooks/useRelativeTime';

export default function ChatMessage({ message }) {
    const isCurrentUser = message.sender === 'lawyer';
    const relativeTime = useRelativeTime(message.sentAt);

    return (
        <div
            className={`flex ${
                isCurrentUser ? 'justify-start' : 'justify-end'
            }`}
        >
            <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 sm:max-w-[75%] ${
                    isCurrentUser
                        ? 'rounded-tr-sm bg-[#0b5648] text-white'
                        : 'rounded-tl-sm bg-[#f1f6f4] text-[#183d36]'
                }`}
            >
                <p className="text-sm leading-7">{message.text}</p>

                <div
                    className={`mt-2 flex items-center gap-2 text-[11px] ${
                        isCurrentUser ? 'text-white/65' : 'text-[#82918d]'
                    }`}
                >
                    <span>{isCurrentUser ? 'شما' : 'موکل'}</span>

                    <span>·</span>

                    <time
                        dateTime={message.sentAt}
                        title={new Date(message.sentAt).toLocaleString('fa-IR')}
                    >
                        {relativeTime}
                    </time>
                </div>
            </div>
        </div>
    );
}
