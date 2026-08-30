'use client';

import { useEffect, useState } from 'react';

export default function useCurrentDateTime() {
    const [currentDate, setCurrentDate] = useState(() => new Date());

    useEffect(() => {
        const intervalId = window.setInterval(() => {
            setCurrentDate(new Date());
        }, 60_000);

        return () => {
            window.clearInterval(intervalId);
        };
    }, []);

    return currentDate;
}
