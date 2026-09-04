'use client';

import useRelativeTime from '@/hooks/useRelativeTime';

function formatPersianDateTime(date) {
    if (!date) {
        return 'زمان ثبت نشده';
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return 'زمان نامعتبر';
    }

    return parsedDate.toLocaleString('fa-IR', {
        calendar: 'persian',
        dateStyle: 'medium',
        timeStyle: 'short',
    });
}

export default function HistoryItem({
    activity,
    isLast,
    caseCode,
    engagementCode,
}) {
    const relativeTime = useRelativeTime(activity.occurredAt);

    const exactTime = formatPersianDateTime(activity.occurredAt);

    return (
        <article className="relative flex gap-4 pb-7 last:pb-0">
            {!isLast && (
                <span className="absolute right-[6px] top-4 h-full w-px bg-[#e3e9e6]" />
            )}

            <span className="relative z-10 mt-1.5 size-3.5 shrink-0 rounded-full border-2 border-[#f5e4b3] bg-[#c99f42] shadow-[0_0_0_4px_#fffaf0]" />

            <div className="min-w-0">
                <h3 className="text-sm font-bold leading-7 text-[#183d36]">
                    {activity.title}
                </h3>

                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#8b9894]">
                    <time dateTime={activity.occurredAt} title={exactTime}>
                        {relativeTime}
                    </time>

                    <span>·</span>

                    <time dateTime={activity.occurredAt}>{exactTime}</time>

                    <span>·</span>

                    <span>پرونده {caseCode}</span>

                    {engagementCode && (
                        <>
                            <span>·</span>

                            <span>همکاری {engagementCode}</span>
                        </>
                    )}
                </div>
            </div>
        </article>
    );
}
