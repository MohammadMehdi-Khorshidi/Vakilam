'use client';

import { useEffect, useState } from 'react';

function formatExactDate(date) {
    return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).format(date);
}

function getRelativeTime(date, now) {
    const difference = now.getTime() - date.getTime();

    if (difference < 0) {
        return 'لحظاتی دیگر';
    }

    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (difference < minute) {
        return 'همین حالا';
    }

    if (difference < hour) {
        const minutes = Math.floor(difference / minute);

        return `${minutes.toLocaleString('fa-IR')} دقیقه پیش`;
    }

    if (difference < day) {
        const hours = Math.floor(difference / hour);

        return `${hours.toLocaleString('fa-IR')} ساعت پیش`;
    }

    const days = Math.floor(difference / day);

    return `${days.toLocaleString('fa-IR')} روز پیش`;
}

export default function LiveLastActivity({ dateString }) {
    const [now, setNow] = useState(null);

    useEffect(() => {
        setNow(new Date());

        const interval = setInterval(() => {
            setNow(new Date());
        }, 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    const activityDate = new Date(dateString);

    if (Number.isNaN(activityDate.getTime())) {
        return <span>زمان نامشخص</span>;
    }

    if (!now) {
        return (
            <span className="inline-block h-5 w-20 animate-pulse rounded bg-[#e7ece9]" />
        );
    }

    return (
        <span
            title={formatExactDate(activityDate)}
            className="font-black text-[#173d35]"
        >
            {getRelativeTime(activityDate, now)}
        </span>
    );
}
