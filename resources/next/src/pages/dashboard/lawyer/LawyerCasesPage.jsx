'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    BriefcaseBusiness,
    FileSignature,
    MessageCircleMore,
    ReceiptText,
    Search,
    UserRoundCheck,
} from 'lucide-react';

import { getLawyerCases } from '@/lib/api/lawyerCases';

const money = new Intl.NumberFormat('fa-IR');

const filters = [
    ['all', 'همه'],
    ['pre_contract', 'در انتظار قرارداد'],
    ['signing', 'در انتظار امضا'],
    ['payment', 'در انتظار پرداخت'],
    ['active', 'فعال'],
];

const stageStyles = {
    pre_contract: 'bg-amber-50 text-amber-700 border-amber-200',
    signing: 'bg-blue-50 text-blue-700 border-blue-200',
    payment: 'bg-violet-50 text-violet-700 border-violet-200',
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

function Stat({ label, value, icon: Icon }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">{label}</span>
                <Icon size={18} className="text-[#a47b2c]" />
            </div>
            <p className="mt-3 text-2xl font-black text-[#173f38]">{money.format(value || 0)}</p>
        </div>
    );
}

export default function LawyerCasesPage() {
    const router = useRouter();
    const [payload, setPayload] = useState({ data: [], stats: {} });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');
    const [query, setQuery] = useState('');

    useEffect(() => {
        let alive = true;
        getLawyerCases()
            .then((result) => {
                if (alive) setPayload(result ?? { data: [], stats: {} });
            })
            .catch((e) => {
                if (alive) setError(e?.message || 'دریافت پرونده‌ها انجام نشد.');
            })
            .finally(() => {
                if (alive) setLoading(false);
            });
        return () => { alive = false; };
    }, []);

    const items = useMemo(() => {
        const normalized = query.trim().toLowerCase();
        return (payload.data ?? []).filter((item) => {
            if (filter !== 'all' && item.stage !== filter) return false;
            if (!normalized) return true;
            return [
                item.legal_request?.title,
                item.client?.full_name,
            ].filter(Boolean).some((v) => v.toLowerCase().includes(normalized));
        });
    }, [payload.data, filter, query]);

    return (
        <main dir="rtl" className="min-h-screen bg-[#f6f8f5] px-4 py-8 sm:px-6 lg:px-10">
            <div className="mx-auto max-w-[1450px]">
                <header>
                    <p className="text-sm font-bold text-[#a47b2c]">پنل وکیل</p>
                    <h1 className="mt-2 text-3xl font-black text-[#173f38]">پرونده‌های من</h1>
                    <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-500">
                        از لحظه پذیرش پیشنهاد توسط موکل، تمام ادامه همکاری—قرارداد، امضا، پرداخت و گفتگو—از این بخش مدیریت می‌شود.
                    </p>
                </header>

                <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                    <Stat label="کل همکاری‌ها" value={payload.stats?.total} icon={BriefcaseBusiness} />
                    <Stat label="در انتظار قرارداد" value={payload.stats?.pre_contract} icon={FileSignature} />
                    <Stat label="در انتظار امضا" value={payload.stats?.signing} icon={UserRoundCheck} />
                    <Stat label="در انتظار پرداخت" value={payload.stats?.payment} icon={ReceiptText} />
                    <Stat label="فعال" value={payload.stats?.active} icon={BriefcaseBusiness} />
                </section>

                <section className="mt-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap gap-2">
                        {filters.map(([value, label]) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setFilter(value)}
                                className={`rounded-xl px-4 py-2 text-xs font-bold ${
                                    filter === value
                                        ? 'bg-[#173f38] text-white'
                                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                    <label className="flex min-w-[260px] items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
                        <Search size={16} className="text-slate-400" />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="جستجو نام موکل یا عنوان پرونده"
                            className="w-full bg-transparent text-sm outline-none"
                        />
                    </label>
                </section>

                {error ? (
                    <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div>
                ) : null}

                {loading ? (
                    <div className="mt-5 rounded-2xl border bg-white p-12 text-center text-slate-500">در حال دریافت پرونده‌ها...</div>
                ) : items.length === 0 ? (
                    <div className="mt-5 rounded-2xl border bg-white p-12 text-center text-slate-500">پرونده‌ای در این وضعیت وجود ندارد.</div>
                ) : (
                    <section className="mt-5 grid gap-4 xl:grid-cols-2">
                        {items.map((item) => (
                            <article key={item.public_id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(18,62,53,0.04)]">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-bold ${stageStyles[item.stage] || stageStyles.pre_contract}`}>
                                            {item.stage_label}
                                        </span>
                                        <h2 className="mt-3 truncate text-lg font-black text-[#173f38]">
                                            {item.legal_request?.title || 'پرونده حقوقی'}
                                        </h2>
                                        <p className="mt-2 text-sm text-slate-500">
                                            موکل: <strong className="text-slate-700">{item.client?.full_name || '—'}</strong>
                                        </p>
                                    </div>
                                    <div className="shrink-0 text-left">
                                        <p className="text-[11px] text-slate-400">مبلغ توافق</p>
                                        <p className="mt-1 font-black text-[#173f38]">
                                            {money.format(item.agreement?.proposed_fee_rial || 0)} ریال
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                                    <div className="rounded-xl bg-slate-50 p-3">
                                        <span className="text-slate-400">مدت توافق</span>
                                        <p className="mt-1 font-bold text-slate-700">
                                            {money.format(item.agreement?.estimated_days || 0)} روز
                                        </p>
                                    </div>
                                    <div className="rounded-xl bg-slate-50 p-3">
                                        <span className="text-slate-400">وضعیت همکاری</span>
                                        <p className="mt-1 font-bold text-slate-700">{item.stage_label}</p>
                                    </div>
                                </div>

                                <div className="mt-5 flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => router.push(`/lawyer/cases/${encodeURIComponent(item.public_id)}`)}
                                        className="rounded-xl bg-[#173f38] px-4 py-2.5 text-xs font-black text-white"
                                    >
                                        مشاهده و ادامه پرونده
                                    </button>
                                    {item.negotiation?.public_id ? (
                                        <button
                                            type="button"
                                            onClick={() => router.push(`/lawyer/negotiation/${encodeURIComponent(item.negotiation.public_id)}`)}
                                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700"
                                        >
                                            <MessageCircleMore size={15} />
                                            ادامه گفتگو
                                        </button>
                                    ) : null}
                                </div>
                            </article>
                        ))}
                    </section>
                )}
            </div>
        </main>
    );
}
