'use client';

import { useEffect, useState } from 'react';

import { securityEvents } from './dashboardData';
import PanelTitle from './PanelTitle';

const badgeStyles = {
    red: 'border-red-200 bg-red-50 text-red-600',
    amber: 'border-amber-200 bg-amber-50 text-amber-700',
    blue: 'border-sky-200 bg-sky-50 text-sky-700',
};

function formatEventDate(dateString) {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return 'زمان نامشخص';
    }

    return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).format(date);
}

function formatRelativeTime(dateString, currentTime) {
    const eventDate = new Date(dateString);

    if (Number.isNaN(eventDate.getTime())) {
        return 'زمان نامشخص';
    }

    const difference = currentTime.getTime() - eventDate.getTime();
    const futureEvent = difference < 0;
    const absoluteDifference = Math.abs(difference);

    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (absoluteDifference < minute) {
        return futureEvent ? 'تا چند لحظه دیگر' : 'چند لحظه پیش';
    }

    if (absoluteDifference < hour) {
        const minutes = Math.floor(absoluteDifference / minute).toLocaleString(
            'fa-IR',
        );

        return futureEvent ? `${minutes} دقیقه دیگر` : `${minutes} دقیقه پیش`;
    }

    if (absoluteDifference < day) {
        const hours = Math.floor(absoluteDifference / hour).toLocaleString(
            'fa-IR',
        );

        return futureEvent ? `${hours} ساعت دیگر` : `${hours} ساعت پیش`;
    }

    const days = Math.floor(absoluteDifference / day).toLocaleString('fa-IR');

    return futureEvent ? `${days} روز دیگر` : `${days} روز پیش`;
}

export default function SecurityEventsTable() {
    const [currentTime, setCurrentTime] = useState(null);

    useEffect(() => {
        setCurrentTime(new Date());

        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <section className="mt-5 overflow-hidden rounded-2xl border border-[#dce4df] bg-white p-5 shadow-[0_6px_18px_rgba(15,52,45,0.03)] md:p-6">
            <PanelTitle title="آخرین رویدادهای حساس" />

            <div className="overflow-x-auto">
                <table className="mt-4 w-full min-w-[800px] border-collapse text-right text-sm">
                    <thead className="bg-[#f8faf8] text-xs text-[#68756f]">
                        <tr>
                            <th className="rounded-r-xl p-4 font-medium">
                                شناسه
                            </th>

                            <th className="p-4 font-medium">عامل</th>

                            <th className="p-4 font-medium">رویداد</th>

                            <th className="p-4 font-medium">زمان</th>

                            <th className="rounded-l-xl p-4 font-medium">
                                شدت
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {securityEvents.map((item) => (
                            <tr
                                key={item.id}
                                className="border-t border-[#e3e9e5] transition hover:bg-[#fafcfb]"
                            >
                                <td className="p-4 font-mono text-xs">
                                    {item.id}
                                </td>

                                <td className="p-4">{item.actor}</td>

                                <td className="p-4">{item.event}</td>

                                <td className="p-4">
                                    <span className="block text-xs font-medium text-[#334c45]">
                                        {currentTime
                                            ? formatRelativeTime(
                                                  item.createdAt,
                                                  currentTime,
                                              )
                                            : 'در حال محاسبه...'}
                                    </span>

                                    <span
                                        dir="ltr"
                                        className="mt-1 block text-left text-[11px] text-[#8a9691]"
                                    >
                                        {formatEventDate(item.createdAt)}
                                    </span>
                                </td>

                                <td className="p-4">
                                    <span
                                        className={`rounded-full border px-3 py-1 text-xs ${
                                            badgeStyles[item.tone]
                                        }`}
                                    >
                                        {item.severity}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
