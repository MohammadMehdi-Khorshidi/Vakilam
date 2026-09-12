'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
    ArrowLeft,
    BriefcaseBusiness,
    Clock3,
    FilePlus2,
    Handshake,
    Hourglass,
    MessageCircleMore,
} from 'lucide-react';
import { Vazirmatn } from 'next/font/google';

import { apiRequest, unwrapData } from '@/lib/api/client';
import { getClientEngagements } from '@/lib/api/workflow';

const vazirmatn = Vazirmatn({ subsets: ['arabic'], display: 'swap' });
const faNumber = new Intl.NumberFormat('fa-IR');

const requestStatusLabels = {
    draft: 'پیش‌نویس',
    submitted: 'در انتظار بررسی و انتخاب وکیل',
    matched: 'در حال بررسی وکلا',
    active: 'در جریان',
    in_progress: 'در حال پیگیری',
    completed: 'تکمیل‌شده',
    closed: 'بسته‌شده',
    cancelled: 'لغوشده',
};

function formatDate(value) {
    if (!value) return 'ثبت نشده';
    try {
        return new Intl.DateTimeFormat('fa-IR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }).format(new Date(value));
    } catch {
        return 'ثبت نشده';
    }
}

const stageStyle = {
    agreement: 'bg-amber-50 text-amber-700 border-amber-200',
    documents: 'bg-sky-50 text-sky-700 border-sky-200',
    signing: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    payment: 'bg-violet-50 text-violet-700 border-violet-200',
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export default function CasePage() {
    const [dashboard, setDashboard] = useState(null);
    const [engagements, setEngagements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let mounted = true;

        Promise.all([
            apiRequest('client/dashboard').then(unwrapData),
            getClientEngagements(),
        ])
            .then(([dashboardData, engagementData]) => {
                if (!mounted) return;
                setDashboard(dashboardData);
                setEngagements(engagementData ?? []);
            })
            .catch((e) => {
                if (mounted) setError(e?.message || 'دریافت پرونده‌ها انجام نشد.');
            })
            .finally(() => {
                if (mounted) setLoading(false);
            });

        return () => { mounted = false; };
    }, []);

    const activeCases = dashboard?.active_cases || [];
    const engagedRequestIds = useMemo(
        () => new Set(engagements.map((item) => item.legal_request?.public_id).filter(Boolean)),
        [engagements],
    );
    const submittedRequests = (dashboard?.submitted_requests || []).filter(
        (item) => !engagedRequestIds.has(item.public_id),
    );
    const preActiveEngagements = engagements.filter((item) => item.stage !== 'active');

    return (
        <main dir="rtl" className={`${vazirmatn.className} min-h-screen bg-[#f7faf8]`}>
            <div className="mx-auto mt-12 max-w-[1280px] px-5 py-7">
                <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-extrabold text-[#173f38]">پرونده‌ها و همکاری‌های من</h1>
                        <p className="mt-2 text-sm leading-7 text-[#71817c]">
                            بعد از پذیرش پیشنهاد وکیل، قرارداد، مدارک، پرداخت و ادامه گفتگو از همین بخش قابل پیگیری است.
                        </p>
                    </div>
                    <Link href="/client/legal-request" className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#123f37] px-5 py-3 font-bold text-white transition hover:bg-[#0d332c]">
                        <FilePlus2 size={18} /> ثبت موضوع جدید
                    </Link>
                </header>

                {error ? <div className="rounded-[18px] border border-red-200 bg-red-50 p-5 text-red-700">{error}</div> : null}
                {loading ? <div className="rounded-[18px] border bg-white py-16 text-center text-[#899691]">در حال دریافت پرونده‌ها...</div> : null}

                {!loading && !error ? (
                    <div className="space-y-5">
                        <section className="grid gap-3 sm:grid-cols-3">
                            <div className="flex items-center justify-between rounded-[18px] border border-[#d6e7e0] bg-[#eff8f4] p-5">
                                <div><p className="text-xs font-bold text-[#648078]">پرونده‌های فعال</p><p className="mt-2 text-2xl font-black text-[#173f38]">{faNumber.format(activeCases.length)}</p></div>
                                <BriefcaseBusiness className="text-[#174f43]" />
                            </div>
                            <div className="flex items-center justify-between rounded-[18px] border border-[#d9e4f2] bg-[#f2f7fc] p-5">
                                <div><p className="text-xs font-bold text-[#58738b]">همکاری‌های در حال تکمیل</p><p className="mt-2 text-2xl font-black text-[#173f38]">{faNumber.format(preActiveEngagements.length)}</p></div>
                                <Handshake className="text-[#416a88]" />
                            </div>
                            <div className="flex items-center justify-between rounded-[18px] border border-[#eadfbe] bg-[#fffaf0] p-5">
                                <div><p className="text-xs font-bold text-[#8b7440]">درخواست‌های قبل از توافق</p><p className="mt-2 text-2xl font-black text-[#5d4c27]">{faNumber.format(submittedRequests.length)}</p></div>
                                <Hourglass className="text-[#b38b38]" />
                            </div>
                        </section>

                        <section className="overflow-hidden rounded-[18px] border border-[#dfe7e3] bg-white">
                            <div className="border-b border-[#e8eeeb] px-5 py-5">
                                <h2 className="font-extrabold text-[#173f38]">همکاری با وکیل منتخب</h2>
                                <p className="mt-1 text-xs leading-6 text-[#7e8d88]">توافق‌های پذیرفته‌شده تا زمان فعال شدن کامل پرونده.</p>
                            </div>
                            {preActiveEngagements.length === 0 ? (
                                <p className="px-5 py-10 text-center text-sm text-[#899691]">همکاری در حال تکمیلی ندارید.</p>
                            ) : (
                                <div className="divide-y divide-[#e8eeeb]">
                                    {preActiveEngagements.map((item) => (
                                        <article key={item.public_id} className="px-5 py-5">
                                            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                                                <div>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <h3 className="font-extrabold text-[#294e46]">{item.legal_request?.title || 'موضوع حقوقی'}</h3>
                                                        <span className={`rounded-full border px-3 py-1 text-xs font-bold ${stageStyle[item.stage] || stageStyle.agreement}`}>{item.stage_label}</span>
                                                    </div>
                                                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-[#7f8e89]">
                                                        <span>وکیل: <b className="text-[#52655f]">{item.lawyer?.full_name || '—'}</b></span>
                                                        <span>مبلغ توافق: <b className="text-[#52655f]">{faNumber.format(item.agreement?.proposed_fee_rial || 0)} ریال</b></span>
                                                        {item.documents?.required > 0 ? <span>مدارک تأییدشده: <b>{faNumber.format(item.documents.accepted)} از {faNumber.format(item.documents.required)}</b></span> : null}
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    <Link href={`/client/engagement/${encodeURIComponent(item.public_id)}`} className="inline-flex items-center gap-2 rounded-xl bg-[#173f38] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#0e332d]">
                                                        مشاهده و ادامه فرآیند <ArrowLeft size={15} />
                                                    </Link>
                                                    {item.negotiation?.public_id ? (
                                                        <Link href={`/client/negotiation/${encodeURIComponent(item.negotiation.public_id)}`} className="inline-flex items-center gap-2 rounded-xl border border-[#bcd2cb] bg-white px-4 py-2.5 text-sm font-bold text-[#174c42] hover:bg-[#eef7f3]">
                                                            <MessageCircleMore size={16} /> گفتگو
                                                        </Link>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </section>

                        <section className="overflow-hidden rounded-[18px] border border-[#dfe7e3] bg-white">
                            <div className="border-b border-[#e8eeeb] px-5 py-5">
                                <h2 className="font-extrabold text-[#173f38]">پرونده‌های در جریان</h2>
                            </div>
                            {activeCases.length === 0 ? (
                                <p className="px-5 py-10 text-center text-sm text-[#899691]">در حال حاضر پرونده فعالی ندارید.</p>
                            ) : (
                                <div className="divide-y divide-[#e8eeeb]">
                                    {activeCases.map((item) => (
                                        <article key={item.public_id || item.id} className="flex flex-col justify-between gap-4 px-5 py-5 lg:flex-row lg:items-center">
                                            <div>
                                                <h3 className="font-extrabold text-[#294e46]">{item.title || 'پرونده حقوقی'}</h3>
                                                <p className="mt-2 text-xs text-[#7f8e89]"><Clock3 size={14} className="ml-1 inline" />آخرین بروزرسانی: {formatDate(item.updated_at)}</p>
                                            </div>
                                            <Link href={`/client/cases/${encodeURIComponent(item.id)}?type=case`} className="rounded-xl border border-[#bcd2cb] bg-[#f7fbf9] px-4 py-2.5 text-sm font-bold text-[#174c42]">مشاهده جزئیات</Link>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </section>

                        <section className="overflow-hidden rounded-[18px] border border-[#dfe7e3] bg-white">
                            <div className="border-b border-[#e8eeeb] px-5 py-5">
                                <h2 className="font-extrabold text-[#173f38]">درخواست‌های قبل از توافق</h2>
                            </div>
                            {submittedRequests.length === 0 ? (
                                <p className="px-5 py-10 text-center text-sm text-[#899691]">درخواست دیگری در انتظار انتخاب وکیل نیست.</p>
                            ) : (
                                <div className="divide-y divide-[#e8eeeb]">
                                    {submittedRequests.map((item) => (
                                        <article key={item.public_id || item.id} className="flex flex-col justify-between gap-4 px-5 py-5 lg:flex-row lg:items-center">
                                            <div>
                                                <h3 className="font-extrabold text-[#294e46]">{item.title || 'موضوع حقوقی'}</h3>
                                                <p className="mt-2 text-xs text-[#7f8e89]">وضعیت: {requestStatusLabels[item.status] || item.status || 'نامشخص'}</p>
                                            </div>
                                            <Link href={`/client/cases/${encodeURIComponent(item.id)}?type=request`} className="rounded-xl border border-[#bcd2cb] bg-[#f7fbf9] px-4 py-2.5 text-sm font-bold text-[#174c42]">مشاهده جزئیات</Link>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                ) : null}
            </div>
        </main>
    );
}
