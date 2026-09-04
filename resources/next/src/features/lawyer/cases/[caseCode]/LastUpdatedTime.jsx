'use client';

import useRelativeTime from '@/hooks/useRelativeTime';

export default function LastUpdatedTime({ date }) {
    const relativeTime = useRelativeTime(date);

    if (!date) {
        return <span className="mt-2 block text-sm font-bold">ثبت نشده</span>;
    }

    const exactTime = new Date(date).toLocaleString('fa-IR', {
        dateStyle: 'medium',
        timeStyle: 'short',
    });

    return (
        <time
            dateTime={date}
            title={exactTime}
            className="mt-2 block text-sm font-bold"
        >
            {relativeTime}
        </time>
    );
}
