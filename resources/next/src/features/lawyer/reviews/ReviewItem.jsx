'use client';

import Link from 'next/link';
import { Star } from 'lucide-react';

import useRelativeTime from '@/hooks/useRelativeTime';

const statusConfig = {
    published: {
        label: 'منتشرشده پس از بررسی',

        className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    },

    under_review: {
        label: 'در حال بررسی مدیر',

        className: 'border-amber-200 bg-amber-50 text-amber-700',
    },

    rejected: {
        label: 'منتشرنشده',

        className: 'border-red-200 bg-red-50 text-red-700',
    },
};

function formatScore(score) {
    return new Intl.NumberFormat('fa-IR', {
        maximumFractionDigits: 1,
    }).format(score);
}

function formatPersianDate(date) {
    return new Date(date).toLocaleString('fa-IR', {
        calendar: 'persian',
        dateStyle: 'medium',
        timeStyle: 'short',
    });
}

export default function ReviewItem({ review }) {
    const relativeTime = useRelativeTime(review.createdAt);

    const status = statusConfig[review.status] ?? statusConfig.under_review;

    return (
        <article className="rounded-xl border border-[#e3eae7] bg-white p-5">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <Star
                            size={19}
                            className="fill-[#c99f42] text-[#c99f42]"
                        />

                        <strong className="text-lg text-[#183d36]">
                            {formatScore(review.score)} از ۵
                        </strong>
                    </div>

                    <p className="mt-4 text-sm leading-8 text-[#52635e]">
                        {review.text}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-x-2 gap-y-1 text-xs text-[#879590]">
                        <span>همکاری {review.engagementCode}</span>

                        <span>·</span>

                        <span>پرونده {review.caseCode}</span>

                        <span>·</span>

                        <time
                            dateTime={review.createdAt}
                            title={formatPersianDate(review.createdAt)}
                        >
                            {relativeTime}
                        </time>
                    </div>
                </div>

                <span
                    className={`inline-flex w-fit shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold ${status.className}`}
                >
                    {status.label}
                </span>
            </div>

            {review.status === 'under_review' && (
                <div className="mt-5 flex justify-end border-t border-[#edf1ef] pt-4">
                    <Link
                        href={`/lawyer/feedbacks/review-dispute?reviewId=${encodeURIComponent(
                            review.id,
                        )}`}
                        className="inline-flex rounded-xl border border-[#d8b45d] bg-[#fffaf0] px-5 py-3 text-sm font-bold text-[#183d36] transition hover:bg-[#fff5dc]"
                    >
                        ثبت پاسخ یا درخواست بررسی
                    </Link>
                </div>
            )}
        </article>
    );
}
