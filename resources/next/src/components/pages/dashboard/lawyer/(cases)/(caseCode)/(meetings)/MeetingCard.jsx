'use client';

import { CalendarDays, Eye, Phone, Video } from 'lucide-react';

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

function getPersianDateParts(date) {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return {
            day: '--',
            month: 'نامشخص',
            fullDate: 'تاریخ نامعتبر',
            time: '--:--',
        };
    }

    const day = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
        day: 'numeric',
    }).format(parsedDate);

    const month = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
        month: 'long',
    }).format(parsedDate);

    const fullDate = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(parsedDate);

    const time = new Intl.DateTimeFormat('fa-IR', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(parsedDate);

    return {
        day,
        month,
        fullDate,
        time,
    };
}

export default function MeetingCard({ meeting, onView }) {
    const relativeTime = useRelativeTime(meeting.startsAt);

    const status = statusConfig[meeting.status] ?? statusConfig.scheduled;

    const TypeIcon = meeting.type === 'video' ? Video : Phone;

    const typeLabel =
        meeting.type === 'video'
            ? 'تماس تصویری داخل وکیلم'
            : 'تماس صوتی داخل وکیلم';

    const date = getPersianDateParts(meeting.startsAt);

    return (
        <article className="rounded-2xl border border-[#dce6e2] bg-white p-6 shadow-sm">
            <div className="flex items-start gap-5">
                <div className="grid size-24 shrink-0 place-items-center rounded-2xl bg-gradient-to-b from-[#0b5648] to-[#073f35] text-white">
                    <div className="text-center">
                        <strong className="block text-4xl font-black">
                            {date.day}
                        </strong>

                        <span className="mt-1 block text-sm">{date.month}</span>
                    </div>
                </div>

                <div className="min-w-0 flex-1">
                    <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${status.className}`}
                    >
                        {status.label}
                    </span>

                    <h3 className="mt-3 text-xl font-bold leading-8 text-[#123b34]">
                        {meeting.title}
                    </h3>

                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-[#687873]">
                        <time
                            dateTime={meeting.startsAt}
                            title={new Date(meeting.startsAt).toLocaleString(
                                'fa-IR',
                            )}
                        >
                            {date.fullDate} · {date.time}
                        </time>

                        <span>·</span>

                        <span>{relativeTime}</span>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                        <span className="inline-flex items-center gap-2 text-sm text-[#52635e]">
                            <TypeIcon size={18} />
                            {typeLabel}
                        </span>

                        <button
                            type="button"
                            onClick={() => onView(meeting)}
                            className="inline-flex items-center gap-2 rounded-xl bg-[#0b5648] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#073f35]"
                        >
                            <Eye size={17} />
                            مشاهده جلسه
                        </button>
                    </div>
                </div>
            </div>
        </article>
    );
}
