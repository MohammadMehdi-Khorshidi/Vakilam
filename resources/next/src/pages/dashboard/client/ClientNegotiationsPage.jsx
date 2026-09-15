'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CalendarDays, MessageCircle, Scale, UserRound } from 'lucide-react';
import { Vazirmatn } from 'next/font/google';

import { apiRequest } from '@/lib/api/client';
import { listLegalRequests } from '@/lib/api/legalRequests';
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

export default function ClientNegotiationsPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let mounted = true;

        (async () => {
            try {
                const payload = await listLegalRequests();
                const requests = (payload?.active_cases ?? []).filter(
                    (item) => item.service_intent === 'lawyer_selection',
                );

                const groups = await Promise.all(
                    requests.map(async (legalRequest) => {
                        try {
                            const response = await apiRequest(
                                `legal-requests/${encodeURIComponent(
                                    legalRequest.id,
                                )}/negotiations`,
                            );

                            return (response?.data ?? []).map((negotiation) => ({
                                ...negotiation,
                                legal_request: {
                                    ...legalRequest,
                                    ...(negotiation.legal_request ?? {}),
                                },
                            }));
                        } catch {
                            return [];
                        }
                    }),
                );

                const result = groups
                    .flat()
                    .sort(
                        (a, b) =>
                            new Date(b.opened_at || 0) -
                            new Date(a.opened_at || 0),
                    );

                if (mounted) setItems(result);
            } catch (e) {
                if (mounted) {
                    setError(e?.message || 'دریافت مذاکرات با خطا مواجه شد.');
                }
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, []);

    return (
        <main
            dir="rtl"
            className={`${vazir.className} min-h-screen bg-[#f7faf8] px-5 py-6 lg:px-8`}
        >
            <div className="mx-auto max-w-[1250px]">
                <header className="mb-6">
                    <h1 className="text-2xl font-black text-[#173f38]">
                        مذاکرات
                    </h1>
                    <p className="mt-2 text-sm leading-7 text-[#71817c]">
                        گفتگوهای شما با وکلا برای درخواست‌های انتخاب وکیل.
                    </p>
                </header>

                {error ? (
                    <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
                        {error}
                    </div>
                ) : null}

                {loading ? (
                    <div className="rounded-[18px] border border-[#dfe7e3] bg-white py-14 text-center text-[#899691]">
                        در حال دریافت مذاکرات...
                    </div>
                ) : items.length === 0 ? (
                    <div className="rounded-[18px] border border-[#dfe7e3] bg-white py-14 text-center text-[#899691]">
                        هنوز مذاکره‌ای ندارید.
                    </div>
                ) : (
                    <div className="grid gap-4 lg:grid-cols-2">
                        {items.map((item) => (
                            <article
                                key={item.public_id}
                                className="rounded-[18px] border border-[#dfe7e3] bg-white p-5"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <span className="inline-flex rounded-full bg-[#edf5f2] px-3 py-1 text-xs font-bold text-[#315f54]">
                                            {statusLabels[item.status] || 'مذاکره'}
                                        </span>
                                        <h2 className="mt-3 truncate font-black text-[#173f38]">
                                            {item.legal_request?.title || 'درخواست حقوقی'}
                                        </h2>
                                    </div>
                                    <MessageCircle size={21} className="shrink-0 text-[#35685c]" />
                                </div>

                                <div className="mt-4 space-y-2 text-xs text-[#73827d]">
                                    <p className="flex items-center gap-2">
                                        <UserRound size={14} />
                                        وکیل: <b className="text-[#405c54]">{item.lawyer?.full_name || '—'}</b>
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <Scale size={14} />
                                        دسته‌بندی: <b className="text-[#405c54]">{item.legal_request?.legal_category?.name || 'ثبت نشده'}</b>
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <CalendarDays size={14} />
                                        شروع مذاکره: {formatDate(item.opened_at)}
                                    </p>
                                </div>

                                {item.proposal ? (
                                    <div className="mt-4 rounded-xl bg-[#fffaf0] p-3">
                                        <p className="text-xs font-bold text-[#80662f]">
                                            پیشنهاد: {proposalStatusLabel(item.proposal.status)}
                                        </p>
                                        {item.proposal.summary ? (
                                            <p className="mt-2 line-clamp-2 text-xs leading-6 text-[#776b50]">
                                                {item.proposal.summary}
                                            </p>
                                        ) : null}
                                    </div>
                                ) : null}

                                <Link
                                    href={`/client/negotiation/${encodeURIComponent(item.public_id)}`}
                                    className="mt-4 inline-flex rounded-xl bg-[#174c42] px-4 py-2.5 text-sm font-bold text-white"
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
