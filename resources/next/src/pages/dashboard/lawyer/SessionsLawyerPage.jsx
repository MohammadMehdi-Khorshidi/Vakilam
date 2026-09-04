'use client';

import { useMemo } from 'react';
import { Vazirmatn } from 'next/font/google';

import { meetings } from '../../../features/lawyer/sessions/sessionsData';
import SessionsOverviewCard from '../../../features/lawyer/sessions/SessionsOverviewCard';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700'],
});

export default function SessionsLawyerPage() {
    const sortedMeetings = useMemo(() => {
        const statusPriority = {
            scheduled: 1,
            completed: 2,
            cancelled: 3,
        };

        return [...meetings].sort((firstMeeting, secondMeeting) => {
            const firstPriority = statusPriority[firstMeeting.status] ?? 4;
            const secondPriority = statusPriority[secondMeeting.status] ?? 4;

            if (firstPriority !== secondPriority) {
                return firstPriority - secondPriority;
            }

            return (
                new Date(firstMeeting.startsAt).getTime() -
                new Date(secondMeeting.startsAt).getTime()
            );
        });
    }, []);

    return (
        <div
            dir="rtl"
            className={`${vazir.className} mx-auto w-full max-w-[1500px]`}
        >
            <header className="mb-8 pt-4">
                <div className="flex items-center gap-3">
                    <span className="h-px w-7 bg-[#c99f42]" />

                    <p className="text-sm font-bold text-[#a47b2c]">جلسات</p>
                </div>

                <h1 className="mt-5 text-3xl font-black leading-tight text-[#0b302b] sm:text-4xl">
                    تقویم تجمیعی پرونده‌ها
                </h1>

                <p className="mt-4 text-sm leading-7 text-[#75847f]">
                    هر جلسه به پرونده و رابطه همکاری مشخص متصل است.
                </p>
            </header>

            {sortedMeetings.length ? (
                <section className="grid items-start gap-5 lg:grid-cols-2">
                    {sortedMeetings.map((meeting) => (
                        <SessionsOverviewCard
                            key={meeting.id}
                            meeting={meeting}
                        />
                    ))}
                </section>
            ) : (
                <section className="rounded-2xl border border-dashed border-[#dce6e2] bg-white py-16 text-center">
                    <p className="text-sm text-[#879590]">
                        هنوز جلسه‌ای ثبت نشده است.
                    </p>
                </section>
            )}
        </div>
    );
}
