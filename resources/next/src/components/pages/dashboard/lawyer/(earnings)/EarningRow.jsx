'use client';

import Link from 'next/link';

import useRelativeTime from '@/hooks/useRelativeTime';

const statusConfig = {
    ready: {
        label: 'آماده بررسی تسویه',

        className: 'border-sky-200 bg-sky-50 text-sky-700',
    },

    blocked: {
        label: 'متوقف تا تکمیل شرایط',

        className: 'border-amber-200 bg-amber-50 text-amber-700',
    },

    settled: {
        label: 'تسویه کامل',

        className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    },
};

function formatToman(value) {
    return `${new Intl.NumberFormat('fa-IR').format(value)} تومان`;
}

function formatPersianDate(date) {
    if (!date) {
        return '—';
    }

    return new Date(date).toLocaleString('fa-IR', {
        calendar: 'persian',
        dateStyle: 'medium',
        timeStyle: 'short',
    });
}

export default function EarningRow({ earning }) {
    const relativePaymentTime = useRelativeTime(earning.paidAt);

    const status = statusConfig[earning.status] ?? statusConfig.blocked;

    return (
        <tr className="border-b border-[#edf1ef] last:border-b-0">
            <td className="min-w-52 px-4 py-4">
                <Link
                    href={`/lawyer/cases/${encodeURIComponent(
                        earning.caseCode,
                    )}?tab=payments`}
                    className="font-bold text-[#0b5648] underline decoration-[#d8b45d] underline-offset-8"
                >
                    {earning.caseTitle}
                </Link>

                <span className="mt-2 block text-sm font-bold text-[#657571]">
                    {earning.caseCode}
                </span>
            </td>

            <td className="whitespace-nowrap px-4 py-4 text-sm font-bold text-[#52635e]">
                {earning.engagementCode}
            </td>

            <td className="whitespace-nowrap px-4 py-4">
                <strong className="block text-sm text-[#183d36]">
                    {formatToman(earning.prepayment)}
                </strong>

                <time
                    dateTime={earning.paidAt}
                    title={formatPersianDate(earning.paidAt)}
                    className="mt-1 block text-xs text-[#879590]"
                >
                    {relativePaymentTime}
                </time>
            </td>

            <td className="min-w-64 px-4 py-4">
                <span
                    className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-bold ${status.className}`}
                >
                    {status.label}
                </span>

                <p className="mt-2 text-xs text-[#879590]">
                    سهم خالص وکیل: {formatToman(earning.lawyerNetAmount)}
                </p>
            </td>

            <td className="whitespace-nowrap px-4 py-4">
                <Link
                    href={`/lawyer/cases/${encodeURIComponent(
                        earning.caseCode,
                    )}?tab=payments`}
                    className="inline-flex rounded-xl border border-[#dce6e2] bg-white px-4 py-2.5 text-sm font-bold text-[#183d36] transition hover:bg-[#f5f8f6]"
                >
                    جزئیات مالی
                </Link>
            </td>
        </tr>
    );
}
