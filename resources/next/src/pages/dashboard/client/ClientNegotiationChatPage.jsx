'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
    ArrowRight,
    MessageCircle,
    Send,
    ShieldAlert,
} from 'lucide-react';
import { Vazirmatn } from 'next/font/google';

import { apiRequest, unwrapData } from '@/lib/api/client';
import {
    getNegotiation,
    sendNegotiationMessage,
} from '@/lib/api/negotiations';
import {
    contactWarning,
    containsContactInformation,
} from '@/lib/contactGuard';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
    display: 'swap',
});

const faNumber = new Intl.NumberFormat('fa-IR');

const statusLabels = {
    active: 'مذاکره فعال',
    proposal_submitted: 'پیشنهاد رسمی ارسال شده',
    closed: 'مذاکره بسته شده',
    cancelled: 'لغو شده',
    won: 'توافق با وکیل',
};

function formatDate(value) {
    if (!value) return '';

    try {
        return new Intl.DateTimeFormat('fa-IR', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(value));
    } catch {
        return '';
    }
}

function ProposalCard({ proposal }) {
    if (!proposal) return null;

    return (
        <div className="mx-auto my-4 w-full max-w-[650px] rounded-2xl border border-[#dbc58e] bg-[#fffaf0] p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-bold text-[#9a7527]">
                        پیشنهاد رسمی وکیل
                    </p>
                    <h3 className="mt-1 font-black text-[#4c452f]">
                        شرایط پیشنهادی همکاری
                    </h3>
                </div>
                <span className="rounded-full bg-[#f2e6c9] px-3 py-1 text-xs font-bold text-[#765819]">
                    {proposal.status}
                </span>
            </div>

            {proposal.summary ? (
                <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#645e4c]">
                    {proposal.summary}
                </p>
            ) : null}

            {proposal.service_scope ? (
                <div className="mt-3 rounded-xl bg-white/70 p-3">
                    <p className="text-xs font-bold text-[#8b7440]">
                        محدوده و نحوه انجام کار
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[#645e4c]">
                        {proposal.service_scope}
                    </p>
                </div>
            ) : null}

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <div className="rounded-xl bg-white/80 p-3">
                    <p className="text-[11px] font-bold text-[#9a8b67]">
                        مبلغ
                    </p>
                    <p className="mt-1 font-black text-[#514b39]">
                        {proposal.proposed_fee_rial
                            ? `${faNumber.format(
                                  proposal.proposed_fee_rial,
                              )} ریال`
                            : 'ثبت نشده'}
                    </p>
                </div>
                <div className="rounded-xl bg-white/80 p-3">
                    <p className="text-[11px] font-bold text-[#9a8b67]">
                        زمان تقریبی
                    </p>
                    <p className="mt-1 font-black text-[#514b39]">
                        {proposal.estimated_days
                            ? `${faNumber.format(
                                  proposal.estimated_days,
                              )} روز`
                            : 'ثبت نشده'}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function ClientNegotiationChatPage({ negotiationId }) {
    const [negotiation, setNegotiation] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [body, setBody] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        setError('');

        try {
            const [negotiationData, userPayload] = await Promise.all([
                getNegotiation(negotiationId),
                apiRequest('user'),
            ]);

            setNegotiation(negotiationData);
            setCurrentUser(unwrapData(userPayload) ?? userPayload);
        } catch (requestError) {
            setError(
                requestError?.message ||
                    'دریافت اطلاعات مذاکره با خطا مواجه شد.',
            );
        } finally {
            setLoading(false);
        }
    }, [negotiationId]);

    useEffect(() => {
        load();
    }, [load]);

    const stream = useMemo(() => {
        if (!negotiation) return [];

        const items = (negotiation.messages ?? []).map((message) => ({
            type: 'message',
            date: message.created_at,
            message,
        }));

        if (negotiation.proposal?.submitted_at) {
            items.push({
                type: 'proposal',
                date: negotiation.proposal.submitted_at,
                proposal: negotiation.proposal,
            });
        }

        return items.sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        );
    }, [negotiation]);

    const canMessage = ['active', 'proposal_submitted'].includes(
        negotiation?.status,
    );

    const sendMessage = async () => {
        const trimmed = body.trim();
        if (!trimmed || sending || !canMessage) return;

        if (containsContactInformation(trimmed)) {
            setError(contactWarning);
            return;
        }

        setSending(true);
        setError('');

        try {
            await sendNegotiationMessage(negotiationId, trimmed);
            setBody('');
            await load();
        } catch (requestError) {
            setError(
                requestError?.validationMessages?.[0] ||
                    requestError?.message ||
                    'ارسال پیام انجام نشد.',
            );
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <main
                dir="rtl"
                className={`${vazir.className} min-h-screen bg-[#f5f8f6] p-8`}
            >
                <div className="mx-auto max-w-[1200px] rounded-2xl border bg-white p-16 text-center text-[#81908b]">
                    در حال دریافت مذاکره...
                </div>
            </main>
        );
    }

    if (!negotiation) {
        return (
            <main
                dir="rtl"
                className={`${vazir.className} min-h-screen bg-[#f5f8f6] p-8`}
            >
                <div className="mx-auto max-w-[1200px]">
                    <Link
                        href="/client/cases"
                        className="inline-flex items-center gap-2 text-sm font-bold text-[#315f54]"
                    >
                        <ArrowRight size={17} />
                        بازگشت به پرونده‌های من
                    </Link>
                    <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
                        {error || 'مذاکره پیدا نشد.'}
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main
            dir="rtl"
            className={`${vazir.className} min-h-screen bg-[#f5f8f6] px-4 py-7 sm:px-6 lg:px-8`}
        >
            <div className="mx-auto max-w-[1200px]">
                <Link
                    href="/client/cases"
                    className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-[#315f54]"
                >
                    <ArrowRight size={17} />
                    بازگشت به پرونده‌های من
                </Link>

                <header className="rounded-[20px] border border-[#dce6e2] bg-white p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <p className="text-xs font-bold text-[#a47b2c]">
                                مذاکره با وکیل
                            </p>
                            <h1 className="mt-2 text-xl font-black text-[#173f38] md:text-2xl">
                                {negotiation.legal_request?.title ||
                                    'درخواست حقوقی'}
                            </h1>
                            <p className="mt-2 text-sm text-[#74847e]">
                                وکیل: {negotiation.lawyer?.full_name || 'وکیل'}
                            </p>
                        </div>
                        <span className="w-fit rounded-full bg-[#edf5f2] px-4 py-2 text-xs font-bold text-[#315f54]">
                            {statusLabels[negotiation.status] ||
                                negotiation.status}
                        </span>
                    </div>

                    <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-6 text-amber-800">
                        <ShieldAlert size={17} className="mt-0.5 shrink-0" />
                        برای حفظ امنیت، شماره تماس، ایمیل، لینک و شناسه
                        شبکه‌های اجتماعی را داخل گفتگو ارسال نکنید.
                    </div>
                </header>

                {error ? (
                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
                        {error}
                    </div>
                ) : null}

                <section className="mt-5 overflow-hidden rounded-[20px] border border-[#dce6e2] bg-white">
                    <div className="flex items-center gap-2 border-b border-[#e8eeeb] px-5 py-4 font-black text-[#173f38]">
                        <MessageCircle size={19} />
                        گفت‌وگو
                    </div>

                    <div className="min-h-[430px] space-y-3 bg-[#f8faf9] p-5">
                        {stream.length === 0 ? (
                            <div className="py-20 text-center text-sm text-[#899691]">
                                گفتگو هنوز شروع نشده است. می‌توانید اولین پیام
                                را ارسال کنید.
                            </div>
                        ) : (
                            stream.map((entry, index) => {
                                if (entry.type === 'proposal') {
                                    return (
                                        <ProposalCard
                                            key={`proposal-${entry.proposal.public_id}`}
                                            proposal={entry.proposal}
                                        />
                                    );
                                }

                                const message = entry.message;
                                const mine =
                                    currentUser?.public_id &&
                                    message.sender?.public_id ===
                                        currentUser.public_id;

                                return (
                                    <div
                                        key={
                                            message.id ||
                                            `${message.created_at}-${index}`
                                        }
                                        className={`flex ${
                                            mine
                                                ? 'justify-start'
                                                : 'justify-end'
                                        }`}
                                    >
                                        <div
                                            className={`max-w-[78%] rounded-2xl px-4 py-3 ${
                                                mine
                                                    ? 'bg-[#174c42] text-white'
                                                    : 'border border-[#dce5e1] bg-white text-[#405851]'
                                            }`}
                                        >
                                            <p className="whitespace-pre-wrap text-sm leading-7">
                                                {message.body}
                                            </p>
                                            <p
                                                className={`mt-2 text-[10px] ${
                                                    mine
                                                        ? 'text-white/60'
                                                        : 'text-[#9aa5a1]'
                                                }`}
                                            >
                                                {message.sender
                                                    ? `${message.sender.name || ''} ${
                                                          message.sender
                                                              .last_name ||
                                                          ''
                                                      }`
                                                    : ''}
                                                {' · '}
                                                {formatDate(
                                                    message.created_at,
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <div className="border-t border-[#e7ecea] bg-white p-4">
                        <div className="flex gap-2">
                            <textarea
                                value={body}
                                onChange={(event) =>
                                    setBody(event.target.value)
                                }
                                disabled={!canMessage || sending}
                                rows={2}
                                placeholder={
                                    canMessage
                                        ? 'پیام خود را برای وکیل بنویسید...'
                                        : 'این مذاکره بسته شده است.'
                                }
                                className="min-h-[52px] flex-1 resize-none rounded-xl border border-[#dbe5e1] bg-[#fbfdfc] px-4 py-3 text-sm outline-none focus:border-[#7aa096] disabled:opacity-60"
                            />
                            <button
                                type="button"
                                onClick={sendMessage}
                                disabled={
                                    !canMessage ||
                                    sending ||
                                    !body.trim()
                                }
                                className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-xl bg-[#174c42] text-white disabled:opacity-40"
                                aria-label="ارسال پیام"
                            >
                                <Send size={19} />
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
