'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Clock3, History, MapPin, Scale, X } from 'lucide-react';

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

export default function LawyerInvitationsPage() {
    const router = useRouter();
    const [invitations, setInvitations] = useState([]);
    const [tab, setTab] = useState('active');
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
                router.push(`/lawyer/negotiation/${encodeURIComponent(result.negotiation.public_id)}`);
                return;
            }
            await load();
        } catch (e) {
            setError(e?.validationMessages?.[0] || e?.message || 'ثبت پاسخ انجام نشد.');
        } finally {
            setBusyId(null);
        }
    }

    return (
        <main dir="rtl" className="min-h-screen bg-[#f6f8f5] px-4 py-8 sm:px-6 lg:px-10">
            <div className="mx-auto max-w-[1300px]">
                <header>
                    <p className="text-sm font-bold text-[#a47b2c]">پنل وکیل</p>
                    <h1 className="mt-2 text-3xl font-black text-[#173f38]">دعوت‌های موکلان</h1>
                    <p className="mt-2 text-sm leading-7 text-slate-500">
                        این بخش فقط برای دعوت‌ها و مذاکره‌های قبل از انتخاب نهایی است. بعد از پذیرش Proposal، ادامه همکاری به «پرونده‌های من» منتقل می‌شود.
                    </p>
                </header>

                <div className="mt-5 inline-flex rounded-xl border border-slate-200 bg-white p-1">
                    <button onClick={() => setTab('active')} className={`rounded-lg px-4 py-2 text-xs font-bold ${tab === 'active' ? 'bg-[#173f38] text-white' : 'text-slate-600'}`}>
                        دعوت‌های فعال ({active.length})
                    </button>
                    <button onClick={() => setTab('history')} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold ${tab === 'history' ? 'bg-[#173f38] text-white' : 'text-slate-600'}`}>
                        <History size={14} /> تاریخچه ({history.length})
                    </button>
                </div>

                {error ? <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div> : null}

                {loading ? (
                    <div className="mt-5 rounded-2xl border bg-white p-12 text-center text-slate-500">در حال دریافت دعوت‌ها...</div>
                ) : list.length === 0 ? (
                    <div className="mt-5 rounded-2xl border bg-white p-12 text-center text-slate-500">
                        {tab === 'active' ? 'دعوت فعالی ندارید.' : 'تاریخچه‌ای وجود ندارد.'}
                    </div>
                ) : (
                    <div className="mt-5 space-y-4">
                        {list.map((item) => {
                            const req = item.legal_request ?? {};
                            const pending = item.status === 'pending';
                            const accepted = req.status === 'matched' || item.proposal?.status === 'selected';

                            return (
                                <article key={item.distribution_id} className="rounded-3xl border border-slate-200 bg-white p-5">
                                    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                                        <div>
                                            <span className={`rounded-full px-3 py-1 text-xs font-bold ${accepted ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                                {accepted ? 'منتقل‌شده به پرونده‌های من' : (statusLabels[item.status] || item.status)}
                                            </span>
                                            <h2 className="mt-3 text-lg font-black text-[#173f38]">{req.title || 'درخواست حقوقی'}</h2>
                                            <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                                                {req.category ? <span className="inline-flex items-center gap-1"><Scale size={14}/>{req.category}</span> : null}
                                                {[req.province, req.city].filter(Boolean).length ? <span className="inline-flex items-center gap-1"><MapPin size={14}/>{[req.province, req.city].filter(Boolean).join('، ')}</span> : null}
                                                {item.sent_at ? <span className="inline-flex items-center gap-1"><Clock3 size={14}/>دعوت ثبت‌شده</span> : null}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {pending ? (
                                                <>
                                                    <button disabled={busyId === item.distribution_id} onClick={() => respond(item, 'accept')} className="inline-flex items-center gap-2 rounded-xl bg-[#173f38] px-4 py-2.5 text-xs font-black text-white">
                                                        <Check size={15}/> قبول و شروع مذاکره
                                                    </button>
                                                    <button disabled={busyId === item.distribution_id} onClick={() => respond(item, 'reject')} className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-700">
                                                        <X size={15}/> رد
                                                    </button>
                                                </>
                                            ) : accepted ? (
                                                <button onClick={() => router.push('/lawyer/cases')} className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white">
                                                    رفتن به پرونده‌های من
                                                </button>
                                            ) : item.negotiation_public_id ? (
                                                <button onClick={() => router.push(`/lawyer/negotiation/${encodeURIComponent(item.negotiation_public_id)}`)} className="rounded-xl border px-4 py-2.5 text-xs font-bold">
                                                    مشاهده مذاکره
                                                </button>
                                            ) : null}
                                        </div>
                                    </div>
                                    {req.description ? <p className="mt-4 line-clamp-3 text-sm leading-7 text-slate-600">{req.description}</p> : null}
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}
