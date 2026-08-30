
'use client';

import { useEffect, useMemo, useState } from 'react';

const relativeTimeFormatter = new Intl.RelativeTimeFormat('fa-IR', {
    numeric: 'auto',
});

const timeUnits = [
    {
        unit: 'year',
        seconds: 60 * 60 * 24 * 365,
    },
    {
        unit: 'month',
        seconds: 60 * 60 * 24 * 30,
    },
    {
        unit: 'week',
        seconds: 60 * 60 * 24 * 7,
    },
    {
        unit: 'day',
        seconds: 60 * 60 * 24,
    },
    {
        unit: 'hour',
        seconds: 60 * 60,
    },
    {
        unit: 'minute',
        seconds: 60,
    },
    {
        unit: 'second',
        seconds: 1,
    },
];

function calculateRelativeTime(date, currentTime) {
    if (!date) {
        return 'زمان نامشخص';
    }

    const targetTime = new Date(date).getTime();

    if (Number.isNaN(targetTime)) {
        return 'زمان نامعتبر';
    }

    const differenceInSeconds = Math.round(
        (targetTime - currentTime) / 1000,
    );

    const selectedUnit =
        timeUnits.find(
            ({ seconds }) => Math.abs(differenceInSeconds) >= seconds,
        ) ?? timeUnits[timeUnits.length - 1];

    const value = Math.round(
        differenceInSeconds / selectedUnit.seconds,
    );

    return relativeTimeFormatter.format(value, selectedUnit.unit);
}

export default function useRelativeTime(date) {
    const [currentTime, setCurrentTime] = useState(() => new Date());

    useEffect(() => {
        const intervalId = window.setInterval(() => {
            setCurrentTime(new Date());
        }, 60_000);

        return () => {
            window.clearInterval(intervalId);
        };
    }, []);

    return useMemo(
        () => calculateRelativeTime(date, currentTime.getTime()),
        [date, currentTime],
    );
};
