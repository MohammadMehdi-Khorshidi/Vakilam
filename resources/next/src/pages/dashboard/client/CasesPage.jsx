'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
    ArrowLeft,
    BriefcaseBusiness,
    Clock3,
    Eye,
    FilePlus2,
    Hourglass,
} from 'lucide-react';
import { Vazirmatn } from 'next/font/google';

import { apiRequest, unwrapData } from '@/lib/api/client';

const vazirmatn = Vazirmatn({ subsets: ['arabic'], display: 'swap' });

const statusLabels = {
    submitted: 'در انتظار بررسی',
    matched: 'در حال بررسی وکلا',
    active: 'در جریان',
    in_progress: 'در حال پیگیری',
    closed: 'بسته‌شده',
    cancelled: 'لغوشده',
};

const faNumber = new Intl.NumberFormat('fa-IR');

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

function StatusBadge({ status }) {
    const styles = {
        submitted: 'border-amber-200 bg-amber-50 text-amber-700',
        matched: 'border-sky-200 bg-sky-50 text-sky-700',
        active: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        in_progress: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        closed: 'border-slate-200 bg-slate-50 text-slate-600',
        cancelled: 'border-red-200 bg-red-50 text-red-700',
    };

    return (
        <span
            className={`w-fit rounded-full border px-3 py-1.5 text-xs font-bold ${
                styles[status] ||
                'border-slate-200 bg-slate-50 text-slate-600'
            }`}
        >
            {statusLabels[status] || status || 'نامشخص'}
        </span>
    );
}

function CaseSection({
    title,
    description,
    items,
    emptyText,
    type,
}) {
    return (
        <section className="overflow-hidden rounded-[18px] border border-[#dfe7e3] bg-white">
            <div className="border-b border-[#e8eeeb] px-5 py-5">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h2 className="font-extrabold text-[#173f38]">
                            {title}
                        </h2>
                        <p className="mt-1 text-xs leading-6 text-[#7e8d88]">
                            {description}
                        </p>
                    </div>

                    <span className="rounded-full bg-[#f1f6f4] px-3 py-1.5 text-xs font-extrabold text-[#42685e]">
                        {faNumber.format(items.length)}
                    </span>
                </div>
            </div>

            {items.length === 0 ? (
                <p className="px-5 py-10 text-center text-sm text-[#899691]">
                    {emptyText}
                </p>
            ) : (
                <div className="divide-y divide-[#e8eeeb]">
                    {items.map((item) => (
                        <article
                            key={item.public_id || item.id}
                            className="flex flex-col gap-4 px-5 py-5 lg:flex-row lg:items-center lg:justify-between"
                        >
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="font-extrabold text-[#294e46]">
                                        {item.title || 'موضوع حقوقی بدون عنوان'}
                                    </h3>
                                    <StatusBadge status={item.status} />
                                </div>

                                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#7f8e89]">
                                    <span className="inline-flex items-center gap-1.5">
                                        <Clock3 size={14} />
                                        آخرین بروزرسانی:
                                        <b className="font-bold text-[#52655f]">
                                            {formatDate(item.updated_at)}
                                        </b>
                                    </span>

                                    {item.public_id ? (
                                        <span>
                                            شناسه:
                                            <b
                                                dir="ltr"
                                                className="mr-1 font-semibold text-[#687772]"
                                            >
                                                {item.public_id}
                                            </b>
                                        </span>
                                    ) : null}
                                </div>
                            </div>

                            <Link
                                href={`/client/cases/${encodeURIComponent(
                                    item.id,
                                )}?type=${type}`}
                                className="inline-flex w-fit shrink-0 items-center gap-2 rounded-xl border border-[#bcd2cb] bg-[#f7fbf9] px-4 py-2.5 text-sm font-bold text-[#174c42] transition hover:border-[#78a99d] hover:bg-[#eef7f3]"
                            >
                                <Eye size={16} />
                                مشاهده جزئیات
                                <ArrowLeft size={15} />
                            </Link>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}

export default function CasePage() {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let mounted = true;

        apiRequest('client/dashboard')
            .then((response) => {
                if (mounted) setDashboard(unwrapData(response));
            })
            .catch((requestError) => {
                if (mounted) setError(requestError.message);
            })
            .finally(() => {
                if (mounted) setLoading(false);
            });

        return () => {
            mounted = false;
        };
    }, []);

    const activeCases = dashboard?.active_cases || [];
    const submittedRequests = dashboard?.submitted_requests || [];

    return (
        <main
            dir="rtl"
            className={`${vazirmatn.className} min-h-screen bg-[#f7faf8]`}
        >
            <div className="mx-auto mt-12 max-w-[1280px] px-5 py-7">
                <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-extrabold text-[#173f38]">
                            پرونده‌های من
                        </h1>
                        <p className="mt-2 text-sm leading-7 text-[#71817c]">
                            پرونده‌های در جریان و درخواست‌هایی که هنوز در مرحله
                            انتخاب یا پاسخ وکیل هستند را از اینجا دنبال کنید.
                        </p>
                    </div>

                    <Link
                        href="/client/legal-request"
                        className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#123f37] px-5 py-3 font-bold text-white transition hover:bg-[#0d332c]"
                    >
                        <FilePlus2 size={18} />
                        ثبت موضوع جدید
                    </Link>
                </header>

                {loading ? (
                    <div className="rounded-[18px] border border-[#dfe7e3] bg-white py-16 text-center text-[#899691]">
                        در حال دریافت پرونده‌ها...
                    </div>
                ) : null}

                {error ? (
                    <div className="rounded-[18px] border border-red-200 bg-red-50 p-5 text-red-700">
                        {error}
                    </div>
                ) : null}

                {!loading && !error ? (
                    <div className="space-y-5">
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="flex items-center justify-between rounded-[18px] border border-[#d6e7e0] bg-[#eff8f4] p-5">
                                <div>
                                    <p className="text-xs font-bold text-[#648078]">
                                        پرونده‌های در جریان
                                    </p>
                                    <p className="mt-2 text-2xl font-black text-[#173f38]">
                                        {faNumber.format(activeCases.length)}
                                    </p>
                                </div>

                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#174f43] text-white">
                                    <BriefcaseBusiness size={21} />
                                </div>
                            </div>

                            <div className="flex items-center justify-between rounded-[18px] border border-[#eadfbe] bg-[#fffaf0] p-5">
                                <div>
                                    <p className="text-xs font-bold text-[#8b7440]">
                                        درخواست‌های در انتظار
                                    </p>
                                    <p className="mt-2 text-2xl font-black text-[#5d4c27]">
                                        {faNumber.format(
                                            submittedRequests.length,
                                        )}
                                    </p>
                                </div>

                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#b38b38] text-white">
                                    <Hourglass size={21} />
                                </div>
                            </div>
                        </div>

                        <CaseSection
                            title="پرونده‌های در جریان"
                            description="پرونده‌هایی که فرایند ارائه خدمت برای آن‌ها آغاز شده است."
                            items={activeCases}
                            emptyText="در حال حاضر پرونده‌ای در جریان ندارید."
                            type="case"
                        />

                        <CaseSection
                            title="درخواست‌های در انتظار"
                            description="درخواست‌هایی که ثبت شده‌اند و هنوز در مرحله بررسی، انتخاب وکیل یا دریافت پاسخ هستند."
                            items={submittedRequests}
                            emptyText="در حال حاضر درخواست در انتظاری ندارید."
                            type="request"
                        />
                    </div>
                ) : null}
            </div>
        </main>
    );
}
