'use client';

import {
    CalendarClock,
    CheckCircle2,
    CircleDot,
    Clock3,
    UserRound,
} from 'lucide-react';

import useRelativeTime from '@/hooks/useRelativeTime';

const statusConfig = {
    in_progress: {
        label: 'در حال انجام',
        icon: CircleDot,
        badge: 'border-sky-200 bg-sky-50 text-sky-700',
        dot: 'bg-red-500',
    },

    completed: {
        label: 'انجام‌شده',
        icon: CheckCircle2,
        badge: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        dot: 'bg-[#c99f42]',
    },

    scheduled: {
        label: 'برنامه‌ریزی‌شده',
        icon: Clock3,
        badge: 'border-sky-200 bg-sky-50 text-sky-700',
        dot: 'bg-[#c99f42]',
    },
};

function formatExactDate(date) {
    if (!date) {
        return 'بدون مهلت';
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return 'تاریخ نامعتبر';
    }

    return parsedDate.toLocaleString('fa-IR', {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
}

export default function TaskItem({ task }) {
    const relativeDueTime = useRelativeTime(task.dueAt);

    const status = statusConfig[task.status] ?? statusConfig.scheduled;

    const StatusIcon = status.icon;

    return (
        <article className="flex flex-col justify-between gap-4 rounded-xl border border-[#e3eae7] bg-white px-5 py-4 transition hover:border-[#c9d8d3] sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
                <span
                    className={`mt-2 size-2.5 shrink-0 rounded-full ${status.dot}`}
                />

                <div>
                    <h3 className="text-sm font-bold leading-7 text-[#183d36]">
                        {task.title}
                    </h3>

                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#879590]">
                        <span>{task.id}</span>

                        <span className="inline-flex items-center gap-1">
                            <UserRound size={13} />
                            مسئول: {task.assignee}
                        </span>

                        <time
                            dateTime={task.dueAt}
                            title={formatExactDate(task.dueAt)}
                            className="inline-flex items-center gap-1"
                        >
                            <CalendarClock size={13} />
                            مهلت: {relativeDueTime}
                        </time>
                    </div>
                </div>
            </div>

            <span
                className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${status.badge}`}
            >
                <StatusIcon size={14} />
                {status.label}
            </span>
        </article>
    );
}
