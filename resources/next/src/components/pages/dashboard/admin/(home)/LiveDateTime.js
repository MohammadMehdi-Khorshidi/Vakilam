'use client';

import { CalendarDays, Clock3 } from 'lucide-react';
import { useEffect, useState } from 'react';

function formatPersianDate(date) {
    return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(date);
}

function formatPersianTime(date) {
    return new Intl.DateTimeFormat('fa-IR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    }).format(date);
}

export default function LiveDateTime() {
    const [currentDate, setCurrentDate] = useState(() => new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentDate(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-[#dce4df] bg-white px-4 py-3 text-sm shadow-sm">
                <CalendarDays size={18} className="text-[#b38b3e]" />

                <span className="text-[#596761]">
                    {formatPersianDate(currentDate)}
                </span>
            </div>

            <div
                dir="ltr"
                className="flex items-center gap-2 rounded-xl border border-[#dce4df] bg-white px-4 py-3 text-sm shadow-sm"
            >
                <Clock3 size={18} className="text-[#b38b3e]" />

                <span className="min-w-[70px] text-center font-bold tabular-nums text-[#173b34]">
                    {formatPersianTime(currentDate)}
                </span>
            </div>
        </div>
    );
}
;
