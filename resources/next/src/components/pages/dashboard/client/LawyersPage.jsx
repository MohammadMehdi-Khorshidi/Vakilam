'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, ChevronLeft, ChevronRight, Loader2, RefreshCw, Scale, Search } from 'lucide-react';
import { Vazirmatn } from 'next/font/google';
import {
    getLawyersForRequest,
    getLegalRequestProposals,
    selectProposal,
    sendLawyerRequests,
} from '@/lib/api/legalRequests';

const vazir = Vazirmatn({ subsets: ['arabic'], weight: ['400', '500', '600', '700', '800'] });

export default function LawyersPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const legalRequestId = searchParams.get('legal_request');
    const [lawyers, setLawyers] = useState([]);
    const [selected, setSelected] = useState([]);
    const [proposals, setProposals] = useState([]);
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0, per_page: 20 });
    const [page, setPage] = useState(1);
    const [query, setQuery] = useState('');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [selectingProposal, setSelectingProposal] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const loadProposals = useCallback(async () => {
        if (!legalRequestId) return;
        const rows = await getLegalRequestProposals(legalRequestId);
        setProposals(Array.isArray(rows) ? rows : []);
    }, [legalRequestId]);

    const loadLawyers = useCallback(async () => {
        if (!legalRequestId) return;
        setLoading(true);
        setError('');

        try {
            const result = await getLawyersForRequest(legalRequestId, {
                page,
                q: search,
                perPage: 20,
            });
            setLawyers(Array.isArray(result?.data) ? result.data : []);
            setPagination(result?.meta?.pagination || { current_page: page, last_page: 1, total: 0, per_page: 20 });
            await loadProposals();
        } catch (err) {
            setError(err.message || 'دریافت فهرست وکلا ناموفق بود.');
        } finally {
            setLoading(false);
        }
    }, [legalRequestId, loadProposals, page, search]);

    useEffect(() => {
        loadLawyers();
    }, [loadLawyers]);

    function submitSearch(event) {
        event.preventDefault();
        setPage(1);
        setSearch(query.trim());
    }

    function toggleLawyer(publicId) {
        setError('');
        setSelected((current) => {
            if (current.includes(publicId)) return current.filter((id) => id !== publicId);
            if (current.length >= 5) {
                setError('حداکثر ۵ وکیل را می‌توانید انتخاب کنید.');
                return current;
            }
            return [...current, publicId];
        });
    }

    async function sendRequests() {
        if (!legalRequestId || selected.length === 0) {
            setError('حداقل یک وکیل را انتخاب کنید.');
            return;
        }

        setSending(true);
        setError('');
        setMessage('');
        try {
            const result = await sendLawyerRequests(legalRequestId, selected);
            setMessage(`درخواست برای ${result?.meta?.selected_count ?? selected.length} وکیل ارسال شد.`);
            setSelected([]);
            await loadLawyers();
        } catch (err) {
            setError(err.message || 'ارسال درخواست به وکلا ناموفق بود.');
        } finally {
            setSending(false);
        }
    }

    async function chooseProposal(proposal) {
        if (!legalRequestId || !proposal?.public_id) return;
        setSelectingProposal(proposal.public_id);
        setError('');
        setMessage('');
        try {
            const result = await selectProposal(legalRequestId, proposal.public_id);
            setMessage('وکیل با موفقیت انتخاب شد و Engagement پیش‌قراردادی ایجاد شد.');
            if (result?.engagement?.public_id) {
                localStorage.setItem('engagement_public_id', result.engagement.public_id);
            }
            await loadProposals();
        } catch (err) {
            setError(err.message || 'انتخاب Proposal ناموفق بود.');
        } finally {
            setSelectingProposal('');
        }
    }

    if (!legalRequestId) {
        return (
            <main dir="rtl" className={`${vazir.className} mt-20 p-8`}>
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                    شناسه درخواست حقوقی مشخص نیست. از مسیر «ثبت شرح مسئله» وارد انتخاب وکیل شوید.
                </div>
            </main>
        );
    }

    return (
        <main dir="rtl" className={`${vazir.className} mt-12 min-h-screen bg-[#f7faf8] px-4 py-10 lg:px-8`}>
            <div className="mx-auto max-w-6xl">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-[#173f38]">انتخاب وکیل برای درخواست شما</h1>
                        <p className="mt-2 text-sm text-slate-500">
                            همه وکلای فعال نمایش داده می‌شوند؛ وکلای با امتیاز Matching بالاتر در ابتدای فهرست قرار می‌گیرند. حداکثر ۵ دعوت هم‌زمان.
                        </p>
                    </div>
                    <button type="button" onClick={loadLawyers} className="flex items-center gap-2 rounded-xl border bg-white px-4 py-3 text-sm font-bold">
                        <RefreshCw size={16} />به‌روزرسانی
                    </button>
                </div>

                <form onSubmit={submitSearch} className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <div className="relative flex-1">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="جستجو بر اساس نام وکیل یا تخصص"
                            className="w-full rounded-xl border border-[#dfe7e4] bg-white py-3 pl-4 pr-11 text-sm outline-none focus:border-[#c9a96e]"
                        />
                    </div>
                    <button type="submit" className="rounded-xl bg-[#123f37] px-6 py-3 text-sm font-bold text-white">جستجو</button>
                    {search ? (
                        <button type="button" onClick={() => { setQuery(''); setSearch(''); setPage(1); }} className="rounded-xl border bg-white px-5 py-3 text-sm font-bold">حذف فیلتر</button>
                    ) : null}
                </form>

                {error ? <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div> : null}
                {message ? <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">{message}</div> : null}

                {loading ? (
                    <div className="flex min-h-64 items-center justify-center gap-2"><Loader2 className="animate-spin" />در حال دریافت وکلا...</div>
                ) : (
                    <>
                        <div className="mt-5 text-xs font-bold text-slate-500">{pagination.total ?? 0} وکیل · ۲۰ وکیل در هر صفحه</div>
                        <section className="mt-4 grid gap-4 md:grid-cols-2">
                            {lawyers.map((item) => {
                                const lawyer = item.lawyer || {};
                                const publicId = lawyer.public_id;
                                const active = selected.includes(publicId);
                                const score = item.match_score;
                                return (
                                    <article key={publicId} className={`rounded-2xl border bg-white p-5 shadow-sm ${active ? 'border-[#c9a96e]' : 'border-[#dfe7e4]'}`}>
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <h2 className="text-lg font-extrabold text-[#173f38]">{lawyer.full_name || 'وکیل'}</h2>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    {item.is_matching_candidate
                                                        ? `رتبه Matching: ${item.match_rank ?? '—'} · امتیاز: ${score != null ? Number(score).toFixed(1) : '—'}`
                                                        : 'خارج از نتایج مستقیم Matching · همچنان قابل انتخاب'}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => toggleLawyer(publicId)}
                                                disabled={!publicId}
                                                className={`rounded-xl px-4 py-2 text-sm font-bold ${active ? 'bg-[#123f37] text-white' : 'border border-[#dfe7e4]'}`}
                                            >
                                                {active ? 'انتخاب شد' : 'انتخاب'}
                                            </button>
                                        </div>

                                        {lawyer.bio ? <p className="mt-4 line-clamp-3 text-sm leading-7 text-slate-600">{lawyer.bio}</p> : null}
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {(lawyer.specialties || []).slice(0, 4).map((specialty) => (
                                                <span key={specialty.id || specialty.code || specialty.name} className="rounded-full bg-[#f2f7f5] px-3 py-1 text-xs text-[#52645f]">
                                                    {specialty.name || specialty.specialty?.name || 'تخصص حقوقی'}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                                            <span>امتیاز کاربران: {lawyer.average_rating ?? '—'} ({lawyer.rating_count ?? 0})</span>
                                            <button
                                                type="button"
                                                onClick={() => publicId && router.push(`/client/lawyersAdmin/${publicId}?legal_request=${encodeURIComponent(legalRequestId)}`)}
                                                className="font-bold text-[#123f37]"
                                            >
                                                مشاهده پروفایل
                                            </button>
                                        </div>
                                    </article>
                                );
                            })}
                        </section>

                        {lawyers.length === 0 ? (
                            <div className="mt-6 rounded-xl border bg-white p-8 text-center text-sm text-slate-500">وکیلی با این جستجو پیدا نشد.</div>
                        ) : null}

                        {pagination.last_page > 1 ? (
                            <div className="mt-6 flex items-center justify-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                                    disabled={page <= 1}
                                    className="flex items-center gap-1 rounded-xl border bg-white px-4 py-2 text-sm font-bold disabled:opacity-40"
                                >
                                    <ChevronRight size={16} /> قبلی
                                </button>
                                <span className="text-sm font-bold text-slate-600">صفحه {pagination.current_page} از {pagination.last_page}</span>
                                <button
                                    type="button"
                                    onClick={() => setPage((current) => Math.min(pagination.last_page, current + 1))}
                                    disabled={page >= pagination.last_page}
                                    className="flex items-center gap-1 rounded-xl border bg-white px-4 py-2 text-sm font-bold disabled:opacity-40"
                                >
                                    بعدی <ChevronLeft size={16} />
                                </button>
                            </div>
                        ) : null}

                        <div className="sticky bottom-4 mt-6 flex items-center justify-between rounded-2xl border bg-white p-4 shadow-lg">
                            <span className="text-sm font-bold">{selected.length} از ۵ وکیل انتخاب شده</span>
                            <button type="button" onClick={sendRequests} disabled={sending || selected.length === 0} className="rounded-xl bg-[#123f37] px-6 py-3 text-sm font-bold text-white disabled:opacity-50">
                                {sending ? 'در حال ارسال...' : 'ارسال درخواست همکاری'}
                            </button>
                        </div>
                    </>
                )}

                <section className="mt-12">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h2 className="text-xl font-black text-[#173f38]">Proposalهای نهایی</h2>
                            <p className="mt-1 text-sm text-slate-500">Proposal فقط وقتی اینجا می‌آید که وکیل آن را در Backend نهایی کرده باشد.</p>
                        </div>
                        <button type="button" onClick={loadProposals} className="rounded-xl border bg-white px-4 py-2 text-sm font-bold">دریافت مجدد</button>
                    </div>
                    <div className="mt-5 space-y-4">
                        {proposals.map((proposal) => (
                            <article key={proposal.public_id} className="rounded-2xl border border-[#dfe7e4] bg-white p-5">
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2"><Scale size={18} /><h3 className="font-extrabold">{proposal.lawyer?.full_name || 'وکیل'}</h3></div>
                                        <p className="mt-3 text-sm leading-7 text-slate-600">{proposal.summary || proposal.service_scope || 'توضیحی ثبت نشده است.'}</p>
                                        <p className="mt-2 text-sm font-bold">مبلغ: {proposal.proposed_fee_rial != null ? Number(proposal.proposed_fee_rial).toLocaleString('fa-IR') + ' ریال' : '—'} · مدت: {proposal.estimated_days ?? '—'} روز</p>
                                    </div>
                                    <button
                                        type="button"
                                        disabled={selectingProposal === proposal.public_id || !['submitted', 'sent', 'active'].includes(proposal.status)}
                                        onClick={() => chooseProposal(proposal)}
                                        className="flex items-center gap-2 rounded-xl bg-[#123f37] px-5 py-3 text-sm font-bold text-white disabled:opacity-40"
                                    >
                                        <CheckCircle2 size={17} />
                                        {selectingProposal === proposal.public_id ? 'در حال انتخاب...' : 'انتخاب این Proposal'}
                                    </button>
                                </div>
                            </article>
                        ))}
                        {proposals.length === 0 ? <div className="rounded-xl border bg-white p-6 text-center text-sm text-slate-500">هنوز Proposal نهایی ثبت نشده است.</div> : null}
                    </div>
                </section>
            </div>
        </main>
    );
}
