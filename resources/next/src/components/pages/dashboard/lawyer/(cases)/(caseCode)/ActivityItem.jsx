'use client';

import useRelativeTime from '@/hooks/useRelativeTime';

export default function ActivityItem({ activity, isLast }) {
    const relativeTime = useRelativeTime(activity.occurredAt);

    const exactTime = new Date(activity.occurredAt).toLocaleString('fa-IR', {
        dateStyle: 'medium',
        timeStyle: 'short',
    });

    return (
        <div className="relative flex gap-4 pb-6 last:pb-0">
            {!isLast && (
                <span className="absolute right-[5px] top-4 h-full w-px bg-[#e3e9e6]" />
            )}

            <span className="relative z-10 mt-1.5 size-3 shrink-0 rounded-full border-2 border-[#f6e8bd] bg-[#c99f42] shadow-[0_0_0_4px_#fffaf0]" />

            <div>
                <p className="text-sm font-bold leading-7 text-[#183d36]">
                    {activity.title}
                </p>

                <time
                    dateTime={activity.occurredAt}
                    title={exactTime}
                    className="mt-1 block text-xs text-[#97a29f]"
                >
                    {relativeTime}
                </time>
            </div>
        </div>
    );
}
