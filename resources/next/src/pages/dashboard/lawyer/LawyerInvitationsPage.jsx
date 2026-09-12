'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Check,
    ChevronLeft,
    Clock3,
    History,
    MapPin,
    Scale,
    UserRound,
    X,
} from 'lucide-react';

import {
    getLawyerInvitations,
    respondToLawyerInvitation,
} from '@/lib/api/lawyer';

const statusLabels = {
    pending: 'در انتظار پاسخ شما',
    negotiating: 'مذاکره فعال',
    rejected: 'ردشده',
    expired: 'منقضی‌شده',
    closed: 'پایان‌یافته',
    selected: 'پذیرفته‌شده توسط موکل',
};

const urgencyLabels = {
    low: 'عادی',
    normal: 'عادی',
    medium: 'متوسط',
    high: 'فوری',
    urgent: 'خیلی فوری',
};

export default function LawyerInvitationsPage() {
    const router = useRouter();
    const [invitations, setInvitations] = useState([]);
    const [tab, setTab] = useState('active');
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState(null);
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getLawyerInvitations({ per_page: 50 });
            setInvitations(response?.data ?? []);
            setError('');
        } catch (e) {
            setError(e?.message || 'دریافت دعوت‌ها انجام نشد.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const active = useMemo(
        () => invitations.filter((item) =>
            ['pending', 'negotiating'].includes(item.status)
            && !['matched', 'active', 'completed'].includes(item.legal_request?.status)
            && item.proposal?.status !== 'selected'
        ),
        [invitations],
    );

    const history = useMemo(
        () => invitations.filter((item) => !active.includes(item)),
        [invitations, active],
    );

    const list = tab === 'active' ? active : history;

    async function respond(item, action) {
        setBusyId(item.distribution_id);
        try {
            const result = await respondToLawyerInvitation(item.distribution_id, action);

            if (action === 'accept' && result?.negotiation?.public_id) {
                setSelected(null);
                router.push(`/lawyer/negotiation/${encodeURIComponent(result.negotiation.public_id)}`);
                return;
            }

            setSelected(null);
            await load();
        } catch (e) {
            setError(e?.validationMessages?.[0] || e?.message || 'ثبت پاسخ انجام نشد.');
        } finally {
            setBusyId(null);
        }
    }

    const selectedReq = selected?.legal_request ?? null;
    const selectedPending = selected?.status === 'pending';

    return (
        <main dir="rtl" className="min-h-screen bg-[#f6f8f5] px-4 py-8 sm:px-6 lg:px-10">
            <div className="mx-auto max-w-[1180px]">
                <header>
                    <p className="text-sm font-bold text-[#a47b2c]">پنل وکیل</p>
                    <h1 className="mt-2 text-3xl font-black text-[#173f38]">دعوت‌های موکلان</h1>
                    <p className="mt-2 text-sm leading-7 text-slate-500">
                        ابتدا جزئیات درخواست را بررسی کنید و بعد درباره شروع مذاکره تصمیم بگیرید.
                    </p>
                </header>

                <div className="mt-5 inline-flex rounded-xl border border-slate-200 bg-white p-1">
                    <button
                        onClick={() => setTab('active')}
                        className={`rounded-lg px-4 py-2 text-xs font-bold ${tab === 'active' ? 'bg-[#173f38] text-white' : 'text-slate-600'}`}
                    >
                        دعوت‌های فعال ({active.length})
                    </button>
                    <button
                        onClick={() => setTab('history')}
                        className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold ${tab === 'history' ? 'bg-[#173f38] text-white' : 'text-slate-600'}`}
                    >
                        <History size={14} /> تاریخچه ({history.length})
                    </button>
                </div>

                {error ? (
                    <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
                        {error}
                    </div>
                ) : null}

                {loading ? (
                    <div className="mt-5 rounded-2xl border bg-white p-10 text-center text-slate-500">
                        در حال دریافت دعوت‌ها...
                    </div>
                ) : list.length === 0 ? (
                    <div className="mt-5 rounded-2xl border bg-white p-10 text-center text-slate-500">
                        {tab === 'active' ? 'دعوت فعالی ندارید.' : 'تاریخچه‌ای وجود ندارد.'}
                    </div>
                ) : (
                    <div className="mt-5 space-y-2.5">
                        {list.map((item) => {
                            const req = item.legal_request ?? {};
                            const accepted = req.status === 'matched' || item.proposal?.status === 'selected';

                            return (
                                <article
                                    key={item.distribution_id}
                                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 transition hover:border-[#b9cec7] hover:shadow-[0_5px_18px_rgba(18,62,53,0.05)]"
                                >
                                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h2 className="truncate font-black text-[#173f38]">
                                                    {req.title || 'درخواست حقوقی'}
                                                </h2>
                                                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${accepted ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                                    {accepted ? 'منتقل‌شده به پرونده‌های من' : (statusLabels[item.status] || item.status)}
                                                </span>
                                            </div>

                                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500">
                                                {req.category ? (
                                                    <span className="inline-flex items-center gap-1">
                                                        <Scale size={13} /> {req.category}
                                                    </span>
                                                ) : null}
                                                {[req.province, req.city].filter(Boolean).length ? (
                                                    <span className="inline-flex items-center gap-1">
                                                        <MapPin size={13} /> {[req.province, req.city].filter(Boolean).join('، ')}
                                                    </span>
                                                ) : null}
                                                {req.urgency ? (
                                                    <span className="inline-flex items-center gap-1">
                                                        <Clock3 size={13} /> {urgencyLabels[req.urgency] || req.urgency}
                                                    </span>
                                                ) : null}
                                            </div>
                                        </div>

                                        <div className="flex shrink-0 flex-wrap gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setSelected(item)}
                                                className="inline-flex items-center gap-2 rounded-xl border border-[#bcd2cb] bg-[#f7fbf9] px-4 py-2.5 text-xs font-black text-[#174c42] transition hover:border-[#78a99d] hover:bg-[#eef7f3]"
                                            >
                                                مشاهده جزئیات درخواست
                                                <ChevronLeft size={15} />
                                            </button>

                                            {accepted ? (
                                                <button
                                                    onClick={() => router.push('/lawyer/cases')}
                                                    className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white"
                                                >
                                                    پرونده‌های من
                                                </button>
                                            ) : item.status === 'negotiating' && item.negotiation_public_id ? (
                                                <button
                                                    onClick={() => router.push(`/lawyer/negotiation/${encodeURIComponent(item.negotiation_public_id)}`)}
                                                    className="rounded-xl bg-[#173f38] px-4 py-2.5 text-xs font-black text-white"
                                                >
                                                    ادامه مذاکره
                                                </button>
                                            ) : null}
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>

            {selected && selectedReq ? (
                <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]">
                    <div className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
                        <button
                            type="button"
                            onClick={() => setSelected(null)}
                            className="absolute left-4 top-4 rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        >
                            <X size={20} />
                        </button>

                        <p className="text-xs font-bold text-[#a47b2c]">جزئیات درخواست موکل</p>
                        <h2 className="mt-2 pl-10 text-2xl font-black text-[#173f38]">
                            {selectedReq.title || 'درخواست حقوقی'}
                        </h2>

                        <div className="mt-5 grid gap-3 sm:grid-cols-3">
                            <div className="rounded-2xl bg-slate-50 p-4">
                                <p className="text-[11px] font-bold text-slate-400">حوزه حقوقی</p>
                                <p className="mt-1 text-sm font-black text-slate-700">{selectedReq.category || '—'}</p>
                            </div>
                            <div className="rounded-2xl bg-slate-50 p-4">
                                <p className="text-[11px] font-bold text-slate-400">موقعیت</p>
                                <p className="mt-1 text-sm font-black text-slate-700">
                                    {[selectedReq.province, selectedReq.city].filter(Boolean).join('، ') || '—'}
                                </p>
                            </div>
                            <div className="rounded-2xl bg-slate-50 p-4">
                                <p className="text-[11px] font-bold text-slate-400">فوریت</p>
                                <p className="mt-1 text-sm font-black text-slate-700">
                                    {urgencyLabels[selectedReq.urgency] || selectedReq.urgency || '—'}
                                </p>
                            </div>
                        </div>

                        <section className="mt-5 rounded-2xl border border-slate-200 p-5">
                            <h3 className="font-black text-[#173f38]">شرح کامل مسئله</h3>
                            <p className="mt-3 whitespace-pre-wrap text-sm leading-8 text-slate-600">
                                {selectedReq.description || 'شرحی ثبت نشده است.'}
                            </p>
                        </section>

                        {selectedReq.parties?.length ? (
                            <section className="mt-4 rounded-2xl border border-slate-200 p-5">
                                <div className="flex items-center gap-2">
                                    <UserRound size={18} className="text-[#a47b2c]" />
                                    <h3 className="font-black text-[#173f38]">طرف‌های مرتبط با موضوع</h3>
                                </div>
                                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                    {selectedReq.parties.map((party) => (
                                        <div key={party.id} className="rounded-xl bg-slate-50 p-3 text-sm">
                                            <p className="font-black text-slate-700">{party.full_name || 'بدون نام'}</p>
                                            <p className="mt-1 text-xs text-slate-500">
                                                {[party.party_role, party.relation_note].filter(Boolean).join(' • ') || 'اطلاعات تکمیلی ثبت نشده'}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        ) : null}

                        <div className="mt-6 border-t border-slate-100 pt-5">
                            {selectedPending ? (
                                <>
                                    <p className="mb-3 text-xs leading-6 text-slate-500">
                                        با قبول درخواست، مذاکره با موکل باز می‌شود. پذیرش این دعوت به معنی قبول نهایی پرونده نیست؛ توافق نهایی بعد از Proposal انجام می‌شود.
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            disabled={busyId === selected.distribution_id}
                                            onClick={() => respond(selected, 'accept')}
                                            className="inline-flex items-center gap-2 rounded-xl bg-[#173f38] px-5 py-3 text-sm font-black text-white transition hover:bg-[#0f342e] disabled:opacity-50"
                                        >
                                            <Check size={16} /> قبول و شروع مذاکره
                                        </button>
                                        <button
                                            disabled={busyId === selected.distribution_id}
                                            onClick={() => respond(selected, 'reject')}
                                            className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                                        >
                                            <X size={16} /> رد درخواست
                                        </button>
                                    </div>
                                </>
                            ) : selected.negotiation_public_id ? (
                                <button
                                    onClick={() => router.push(`/lawyer/negotiation/${encodeURIComponent(selected.negotiation_public_id)}`)}
                                    className="rounded-xl bg-[#173f38] px-5 py-3 text-sm font-black text-white"
                                >
                                    ادامه مذاکره
                                </button>
                            ) : null}
                        </div>
                    </div>
                </div>
            ) : null}
        </main>
    );
}
