'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
    CalendarDays,
    Hash,
    MessageCircle,
    Send,
    Scale,
} from 'lucide-react';
import { Vazirmatn } from 'next/font/google';

import { getLawyerNegotiations } from '@/lib/api/lawyer';
import { proposalStatusLabel } from '@/lib/proposalStatus';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
    display: 'swap',
});

const statusLabels = {
    active: 'مذاکره فعال',
    proposal_submitted: 'پیشنهاد ارسال شده',
    closed: 'بسته شده',
    cancelled: 'لغو شده',
    won: 'توافق نهایی',
};

const sourceLabels = {
    matched: 'دعوت مستقیم موکل',
    lawyer_interest: 'درخواست همکاری وکیل',
};

function formatDate(value) {
    if (!value) return '—';
    try {
        return new Intl.DateTimeFormat('fa-IR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        }).format(new Date(value));
    } catch {
        return '—';
    }
}

export default function LawyerNegotiationsPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let mounted = true;

        getLawyerNegotiations({ per_page: 50 })
            .then((response) => {
                if (mounted) setItems(response?.data ?? []);
            })
            .catch((e) => {
                if (mounted) {
                    setError(e?.message || 'دریافت مذاکرات با خطا مواجه شد.');
                }
            })
            .finally(() => {
                if (mounted) setLoading(false);
            });

        return () => {
            mounted = false;
        };
    }, []);

    return (
        <main
            dir="rtl"
            className={`${vazir.className} min-h-screen bg-[#f6f8f5] px-4 py-6 sm:px-6 lg:px-8 xl:px-10`}
        >
            <div className="mx-auto max-w-[1300px]">
                <header className="mb-6">
                    <p className="text-sm font-bold text-[#a47b2c]">
                        پنل وکیل
                    </p>
                    <h1 className="mt-2 text-2xl font-black text-[#123e35] md:text-3xl">
                        مذاکرات
                    </h1>
                    <p className="mt-2 text-sm text-[#75847f]">
                        قبل از ورود، مشخصات هر مذاکره را بررسی کنید.
                    </p>
                </header>

                {error ? (
                    <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
                        {error}
                    </div>
                ) : null}

                {loading ? (
                    <div className="rounded-2xl border bg-white p-12 text-center text-[#81908b]">
                        در حال دریافت مذاکرات...
                    </div>
                ) : items.length === 0 ? (
                    <div className="rounded-2xl border bg-white p-12 text-center text-[#81908b]">
                        هنوز مذاکره‌ای ندارید.
                    </div>
                ) : (
                    <div className="grid gap-4 lg:grid-cols-2">
                        {items.map((item) => (
                            <article
                                key={item.public_id}
                                className="rounded-[20px] border border-[#dde5e1] bg-white p-5"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <span className="rounded-full bg-[#edf5f2] px-3 py-1 text-xs font-bold text-[#315f54]">
                                            {statusLabels[item.status] || 'مذاکره'}
                                        </span>
                                        <h2 className="mt-4 truncate font-black text-[#173f38]">
                                            {item.legal_request?.title || 'درخواست حقوقی'}
                                        </h2>
                                    </div>
                                    <MessageCircle size={22} className="shrink-0 text-[#35685c]" />
                                </div>

                                <div className="mt-4 grid gap-2 text-xs text-[#7e8d88] sm:grid-cols-2">
                                    <span className="inline-flex items-center gap-1.5">
                                        <CalendarDays size={14} />
                                        شروع: {formatDate(item.opened_at)}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5">
                                        <Scale size={14} />
                                        {sourceLabels[item.source] || 'مذاکره درخواست حقوقی'}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 sm:col-span-2">
                                        <Hash size={14} />
                                        شناسه مذاکره:
                                        <b dir="ltr" className="font-semibold text-[#526861]">
                                            {item.public_id?.slice(0, 8)}
                                        </b>
                                    </span>
                                </div>

                                {item.proposal ? (
                                    <div className="mt-4 rounded-xl border border-[#eadfbe] bg-[#fffaf0] p-3">
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#80662f]">
                                            <Send size={14} />
                                            پیشنهاد: {proposalStatusLabel(item.proposal.status)}
                                        </div>
                                        {item.proposal.summary ? (
                                            <p className="mt-2 line-clamp-2 text-xs leading-6 text-[#776b50]">
                                                {item.proposal.summary}
                                            </p>
                                        ) : null}
                                    </div>
                                ) : (
                                    <p className="mt-4 rounded-xl bg-[#f7faf8] px-3 py-2.5 text-xs text-[#7e8d88]">
                                        هنوز پیشنهاد رسمی در این مذاکره ثبت نشده است.
                                    </p>
                                )}

                                <Link
                                    href={`/lawyer/negotiation/${encodeURIComponent(item.public_id)}`}
                                    className="mt-5 inline-flex rounded-xl bg-[#14594b] px-5 py-3 text-sm font-bold text-white"
                                >
                                    ورود به گفت‌وگو
                                </Link>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
