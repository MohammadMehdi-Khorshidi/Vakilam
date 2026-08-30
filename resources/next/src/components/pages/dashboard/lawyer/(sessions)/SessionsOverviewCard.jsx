'use client';

import Link from 'next/link';
import { CalendarDays, Phone, Video } from 'lucide-react';

import useRelativeTime from '@/hooks/useRelativeTime';

const statusConfig = {
    scheduled: {
        label: 'برنامه‌ریزی‌شده',

        className: 'border-amber-200 bg-amber-50 text-amber-700',
    },

    completed: {
        label: 'برگزارشده',

        className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    },

    cancelled: {
        label: 'لغوشده',

        className: 'border-red-200 bg-red-50 text-red-700',
    },
};

function formatPersianDate(date) {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return 'تاریخ نامعتبر';
    }

    return parsedDate.toLocaleString('fa-IR', {
        calendar: 'persian',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function SessionsOverviewCard({ meeting }) {
    const relativeTime = useRelativeTime(meeting.startsAt);

    const status = statusConfig[meeting.status] ?? statusConfig.scheduled;

    const TypeIcon = meeting.type === 'video' ? Video : Phone;

    const typeLabel =
        meeting.type === 'video'
            ? 'تماس تصویری داخل وکیلم'
            : 'تماس صوتی داخل وکیلم';

    return (
        <article className="rounded-2xl border border-[#dce6e2] bg-white p-6 shadow-sm">
            <span
                className={`inline-flex w-full justify-center rounded-full border px-4 py-1.5 text-xs font-bold ${status.className}`}
            >
                {status.label}
            </span>

            <h2 className="mt-7 text-2xl font-black leading-9 text-[#123b34]">
                {meeting.title}
            </h2>

            <div className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-2 text-sm text-[#71817d]">
                <span>{meeting.caseTitle}</span>

                <span>·</span>

                <time
                    dateTime={meeting.startsAt}
                    title={new Date(meeting.startsAt).toLocaleString('fa-IR')}
                >
                    {formatPersianDate(meeting.startsAt)}
                </time>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#879590]">
                <CalendarDays size={15} />

                <span>{relativeTime}</span>

                <span>·</span>

                <span>{meeting.caseCode}</span>
            </div>

            <div className="mt-5 flex items-center gap-2 text-sm text-[#52635e]">
                <TypeIcon size={18} />

                <span>{typeLabel}</span>
            </div>

            <Link
                href={`/lawyer/cases/${encodeURIComponent(
                    meeting.caseCode,
                )}?tab=meetings`}
                className="mt-6 block rounded-xl bg-[#0b5648] px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-[#073f35]"
            >
                ورود به جلسات پرونده
            </Link>
        </article>
    );
}
