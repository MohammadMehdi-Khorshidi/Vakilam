'use client';

import Link from 'next/link';
import { CheckCircle2, CircleDot, Clock3 } from 'lucide-react';
import useRelativeTime from '@/hooks/useRelativeTime';

const statusConfig = {
    in_progress: {
        label: 'در حال انجام',

        icon: CircleDot,

        dot: 'bg-red-500',

        badge: 'border-sky-200 bg-sky-50 text-sky-700',
    },

    completed: {
        label: 'انجام‌شده',

        icon: CheckCircle2,

        dot: 'bg-[#c99f42]',

        badge: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    },

    scheduled: {
        label: 'برنامه‌ریزی‌شده',

        icon: Clock3,

        dot: 'bg-[#c99f42]',

        badge: 'border-sky-200 bg-sky-50 text-sky-700',
    },

    waiting_client: {
        label: 'منتظر موکل',

        icon: Clock3,

        dot: 'bg-[#c99f42]',

        badge: 'border-amber-200 bg-amber-50 text-amber-700',
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

export default function TaskOverviewItem({ task }) {
    const relativeDueTime = useRelativeTime(task.dueAt);

    const status = statusConfig[task.status] ?? statusConfig.scheduled;

    const StatusIcon = status.icon;

    return (
        <article className="flex flex-col justify-between gap-4 rounded-xl border border-[#e3eae7] bg-white px-5 py-4 transition hover:border-[#c4d4ce] sm:flex-row sm:items-center">
            <div className="flex min-w-0 items-start gap-3">
                <span
                    className={`mt-2.5 size-2.5 shrink-0 rounded-full ${status.dot}`}
                />

                <div className="min-w-0">
                    <h2 className="truncate text-sm font-bold text-[#183d36]">
                        {task.title}
                    </h2>

                    <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#879590]">
                        <span>{task.caseTitle}</span>

                        <span>·</span>

                        <span>{task.caseCode}</span>

                        <span>·</span>

                        <time
                            dateTime={task.dueAt}
                            title={formatPersianDate(task.dueAt)}
                        >
                            مهلت {relativeDueTime}
                        </time>
                    </div>
                </div>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-3">
                <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${status.badge}`}
                >
                    <StatusIcon size={14} />

                    {status.label}
                </span>

                <Link
                    href={`/lawyer/cases/${encodeURIComponent(
                        task.caseCode,
                    )}?tab=tasks`}
                    className="rounded-xl border border-[#dce6e2] bg-white px-4 py-2.5 text-sm font-bold text-[#183d36] transition hover:bg-[#f5f8f6]"
                >
                    پرونده
                </Link>
            </div>
        </article>
    );
}
