'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
    ArrowRight,
    Check,
    Handshake,
    MessageCircle,
    Send,
    ShieldAlert,
    X,
} from 'lucide-react';
import { Vazirmatn } from 'next/font/google';

import { apiRequest, unwrapData } from '@/lib/api/client';
import {
    acceptLawyerProposal,
    getNegotiation,
    rejectLawyerProposal,
    sendNegotiationMessage,
} from '@/lib/api/negotiations';
import {
    contactWarning,
    containsContactInformation,
} from '@/lib/contactGuard';
import useNegotiationRealtime from '@/hooks/useNegotiationRealtime';
import { proposalStatusLabel } from '@/lib/proposalStatus';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
    display: 'swap',
});

const faNumber = new Intl.NumberFormat('fa-IR');

const negotiationStatusLabels = {
    active: 'مذاکره فعال',
    proposal_submitted: 'پیشنهاد جدید برای تصمیم شما',
    closed: 'مذاکره بسته شده',
    cancelled: 'مذاکره پایان یافته',
    won: 'توافق با وکیل انجام شده',
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

function AgreementBox({ engagement }) {
    const agreement =
        engagement?.agreement_snapshot ||
        engagement?.proposal ||
        null;

    if (!engagement || !agreement) return null;

    return (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
            <div className="flex items-center gap-2 font-black text-emerald-800">
                <Handshake size={18} />
                توافق با وکیل
            </div>
            <p className="mt-2 text-xs leading-6 text-emerald-700">
                این توافق از Proposal پذیرفته‌شده ثبت شده و مبنای قرارداد
                خواهد بود.
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <div className="rounded-xl bg-white/80 p-3">
                    <span className="text-xs text-slate-500">مبلغ</span>
                    <p className="mt-1 font-bold text-slate-700">
                        {agreement.proposed_fee_rial
                            ? `${faNumber.format(
                                  agreement.proposed_fee_rial,
                              )} ریال`
                            : 'ثبت نشده'}
                    </p>
                </div>
                <div className="rounded-xl bg-white/80 p-3">
                    <span className="text-xs text-slate-500">
                        زمان تقریبی
                    </span>
                    <p className="mt-1 font-bold text-slate-700">
                        {agreement.estimated_days
                            ? `${faNumber.format(
                                  agreement.estimated_days,
                              )} روز`
                            : 'ثبت نشده'}
                    </p>
                </div>
            </div>
        </div>
    );
}

function ProposalCard({
    proposal,
    onAccept,
    onReject,
    busy,
    engagement,
}) {
    const submitted = proposal.status === 'submitted';
    const selected = proposal.status === 'selected';

    return (
        <div
            className={`mx-auto my-4 w-full max-w-[680px] rounded-2xl border p-5 shadow-sm ${
                selected
                    ? 'border-emerald-200 bg-emerald-50/60'
                    : 'border-[#dbc58e] bg-[#fffaf0]'
            }`}
        >
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-bold text-[#9a7527]">
                        پیشنهاد رسمی وکیل
                    </p>
                    <h3 className="mt-1 font-black text-[#4c452f]">
                        شرایط پیشنهادی همکاری
                    </h3>
                </div>
                <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-bold text-[#765819]">
                    {proposalStatusLabel(proposal.status)}
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

            {submitted ? (
                <div className="mt-4 flex flex-wrap gap-2">
                    <button
                        type="button"
                        disabled={busy}
                        onClick={() => onAccept(proposal)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#17634f] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
                    >
                        <Check size={16} />
                        پذیرش پیشنهاد
                    </button>
                    <button
                        type="button"
                        disabled={busy}
                        onClick={() => onReject(proposal)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 disabled:opacity-50"
                    >
                        <X size={16} />
                        نپذیرفتن پیشنهاد
                    </button>
                </div>
            ) : null}

            {selected && engagement ? (
                <p className="mt-4 text-xs font-bold text-emerald-700">
                    این Proposal پذیرفته شده و توافق بر اساس همین نسخه ثبت
                    شده است.
                </p>
            ) : null}
        </div>
    );
}

export default function ClientNegotiationChatPage({ negotiationId }) {
    const [negotiation, setNegotiation] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [body, setBody] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [proposalBusy, setProposalBusy] = useState(false);
    const [error, setError] = useState('');
    const [showAgreement, setShowAgreement] = useState(false);

    const load = useCallback(async ({ silent = false } = {}) => {
        if (!silent) setError('');
        try {
            const [negotiationData, userPayload] = await Promise.all([
                getNegotiation(negotiationId),
                currentUser
                    ? Promise.resolve(currentUser)
                    : apiRequest('user'),
            ]);

            setNegotiation(negotiationData);

            if (!currentUser) {
                setCurrentUser(
                    unwrapData(userPayload) ?? userPayload,
                );
            }
        } catch (requestError) {
            if (!silent) {
                setError(
                    requestError?.message ||
                        'دریافت اطلاعات مذاکره با خطا مواجه شد.',
                );
            }
        } finally {
            setLoading(false);
        }
    }, [negotiationId, currentUser]);

    useEffect(() => {
        load();
    }, [load]);

    const onRealtimeMessage = useCallback((message) => {
        if (!message?.id) return;

        setNegotiation((previous) => {
            if (!previous) return previous;
            const messages = previous.messages ?? [];

            if (messages.some((item) => item.id === message.id)) {
                return previous;
            }

            return {
                ...previous,
                messages: [...messages, message],
            };
        });
    }, []);

    const onRealtimeState = useCallback(() => {
        load({ silent: true });
    }, [load]);

    const {
        connected,
        otherOnline,
        otherTyping,
        notifyTyping,
    } = useNegotiationRealtime({
        negotiationId,
        currentUserPublicId: currentUser?.public_id,
        onMessage: onRealtimeMessage,
        onStateChanged: onRealtimeState,
    });

    const proposals = negotiation?.proposals ?? [];

    const stream = useMemo(() => {
        if (!negotiation) return [];

        const items = (negotiation.messages ?? []).map((message) => ({
            type: 'message',
            date: message.created_at,
            message,
        }));

        proposals
            .filter((proposal) => proposal.submitted_at)
            .forEach((proposal) => {
                items.push({
                    type: 'proposal',
                    date:
                        proposal.submitted_at ||
                        proposal.created_at,
                    proposal,
                });
            });

        return items.sort(
            (a, b) =>
                new Date(a.date).getTime() -
                new Date(b.date).getTime(),
        );
    }, [negotiation, proposals]);

    const canMessage = ['active', 'proposal_submitted', 'won'].includes(
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
            const message = await sendNegotiationMessage(
                negotiationId,
                trimmed,
            );
            setBody('');
            notifyTyping(false);
            onRealtimeMessage(message);
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

    const decideProposal = async (proposal, action) => {
        if (proposalBusy) return;

        setProposalBusy(true);
        setError('');

        try {
            if (action === 'accept') {
                await acceptLawyerProposal(proposal.public_id);
            } else {
                await rejectLawyerProposal(proposal.public_id);
            }

            await load({ silent: true });
        } catch (requestError) {
            setError(
                requestError?.validationMessages?.[0] ||
                    requestError?.message ||
                    'ثبت تصمیم درباره پیشنهاد انجام نشد.',
            );
        } finally {
            setProposalBusy(false);
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
                            <div className="mt-2 flex items-center gap-2 text-sm text-[#74847e]">
                                <span>
                                    وکیل:{' '}
                                    {negotiation.lawyer?.full_name ||
                                        'وکیل'}
                                </span>
                                <span
                                    className={`h-2 w-2 rounded-full ${
                                        otherOnline
                                            ? 'bg-emerald-500'
                                            : 'bg-slate-300'
                                    }`}
                                />
                                <span className="text-xs">
                                    {otherOnline
                                        ? 'آنلاین'
                                        : connected
                                          ? 'آفلاین'
                                          : 'در حال اتصال...'}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <span className="w-fit rounded-full bg-[#edf5f2] px-4 py-2 text-xs font-bold text-[#315f54]">
                                {negotiationStatusLabels[
                                    negotiation.status
                                ] || negotiation.status}
                            </span>

                            {negotiation.engagement ? (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowAgreement(
                                            (value) => !value,
                                        )
                                    }
                                    className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700"
                                >
                                    مشاهده توافق با وکیل
                                </button>
                            ) : null}
                        </div>
                    </div>

                    {showAgreement ? (
                        <div className="mt-4">
                            <AgreementBox
                                engagement={negotiation.engagement}
                            />
                        </div>
                    ) : null}

                    <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-6 text-amber-800">
                        <ShieldAlert
                            size={17}
                            className="mt-0.5 shrink-0"
                        />
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
                    <div className="flex items-center justify-between border-b border-[#e8eeeb] px-5 py-4">
                        <div className="flex items-center gap-2 font-black text-[#173f38]">
                            <MessageCircle size={19} />
                            گفت‌وگو
                        </div>

                        {otherTyping ? (
                            <span className="text-xs font-bold text-emerald-600">
                                وکیل در حال نوشتن است...
                            </span>
                        ) : null}
                    </div>

                    <div className="min-h-[430px] space-y-3 bg-[#f8faf9] p-5">
                        {stream.length === 0 ? (
                            <div className="py-20 text-center text-sm text-[#899691]">
                                گفتگو هنوز شروع نشده است. می‌توانید اولین
                                پیام را ارسال کنید.
                            </div>
                        ) : (
                            stream.map((entry, index) => {
                                if (entry.type === 'proposal') {
                                    return (
                                        <ProposalCard
                                            key={`proposal-${entry.proposal.public_id}`}
                                            proposal={entry.proposal}
                                            onAccept={(proposal) =>
                                                decideProposal(
                                                    proposal,
                                                    'accept',
                                                )
                                            }
                                            onReject={(proposal) =>
                                                decideProposal(
                                                    proposal,
                                                    'reject',
                                                )
                                            }
                                            busy={proposalBusy}
                                            engagement={
                                                negotiation.engagement
                                            }
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
                                onChange={(event) => {
                                    setBody(event.target.value);
                                    notifyTyping(
                                        Boolean(
                                            event.target.value,
                                        ),
                                    );
                                }}
                                disabled={!canMessage || sending}
                                rows={2}
                                placeholder={
                                    canMessage
                                        ? 'پیام خود را برای وکیل بنویسید...'
                                        : 'این مذاکره فقط قابل مشاهده است.'
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
