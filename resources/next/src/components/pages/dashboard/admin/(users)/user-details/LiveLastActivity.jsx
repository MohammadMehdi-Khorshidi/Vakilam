'use client';

import { useSyncExternalStore } from 'react';

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

function subscribeToClock(callback) {
    const interval = window.setInterval(callback, 60 * 1000);

    return () => {
        window.clearInterval(interval);
    };
}

function getClientTime() {
    return Date.now();
}

function getServerTime() {
    return 0;
}

export default function LiveLastActivity({ dateString }) {
    const nowTimestamp = useSyncExternalStore(
        subscribeToClock,
        getClientTime,
        getServerTime,
    );

    const activityDate = new Date(dateString);

    if (Number.isNaN(activityDate.getTime())) {
        return <span>زمان نامشخص</span>;
    }

    const now = new Date(nowTimestamp);

    return (
        <span
            title={formatExactDate(activityDate)}
            className="font-black text-[#173d35]"
        >
            {getRelativeTime(activityDate, now)}
        </span>
    );
}
