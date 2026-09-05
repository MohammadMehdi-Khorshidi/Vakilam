'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
    Bot,
    BriefcaseBusiness,
    FilePlus2,
    FileText,
    MessageSquareText,
} from 'lucide-react';

import HomeIntro from '@/features/client/home/HomeIntro';
import { apiRequest, unwrapData } from '@/lib/api/client';

const statusLabels = {
    draft: 'پیش‌نویس',
    submitted: 'ثبت‌شده',
    matched: 'وکلا پیشنهاد شده‌اند',
    in_progress: 'در حال پیگیری',
    active: 'فعال',
    closed: 'بسته‌شده',
    cancelled: 'لغوشده',
};

const numberFormatter = new Intl.NumberFormat('fa-IR');

function RecordList({ title, emptyText, items }) {
    return (
        <section className="rounded-2xl border border-[#dfe8e3] bg-white p-5 shadow-[0_4px_20px_rgba(13,48,42,0.035)]">
            <h2 className="border-b border-[#edf1ef] pb-4 font-bold text-[#173f37]">
                {title}
            </h2>

            {items.length === 0 ? (
                <p className="py-8 text-center text-sm text-[#8a9994]">
                    {emptyText}
                </p>
            ) : (
                <div className="divide-y divide-[#edf1ef]">
                    {items.map((item) => (
                        <div
                            key={item.public_id || item.id}
                            className="flex items-center justify-between gap-4 py-4"
                        >
                            <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-[#294d46]">
                                    {item.title || 'موضوع حقوقی بدون عنوان'}
                                </p>
                                <p className="mt-1 text-xs text-[#8a9994]">
                                    شناسه: {item.public_id}
                                </p>
                            </div>
                            <span className="shrink-0 rounded-full bg-[#f4f0e5] px-3 py-1.5 text-xs font-semibold text-[#6f5b2e]">
                                {statusLabels[item.status] || item.status}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

export default function ClientHomePage() {
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

    const drafts = dashboard?.draft_cases || [];
    const submitted = dashboard?.submitted_requests || [];
    const activeCases = dashboard?.active_cases || [];

    const stats = [
        {
            label: 'پرونده فعال',
            value: activeCases.length,
            icon: BriefcaseBusiness,
        },
        {
            label: 'درخواست ثبت‌شده',
            value: submitted.length,
            icon: FileText,
        },
        {
            label: 'پیش‌نویس',
            value: drafts.length,
            icon: FilePlus2,
        },
    ];

    return (
        <div dir="rtl" className="min-h-[calc(100vh-80px)] bg-[#f8faf9]">
            <div className="mx-auto max-w-[1400px] px-5 py-15 lg:px-8">
                <HomeIntro />

                <div className="my-6 grid grid-cols-1 gap-3 md:grid-cols-3">
                    <Link
                        href="/client/legal-assistant"
                        className="flex items-center gap-4 rounded-2xl bg-[#0d4a40] p-5 text-white transition hover:-translate-y-0.5"
                    >
                        <Bot className="text-[#dfc58f]" />
                        <div>
                            <p className="font-bold">گفتگو با دستیار وکیلم</p>
                            <p className="mt-1 text-xs text-white/65">
                                دریافت راهنمایی اولیه و ذخیره تاریخچه
                            </p>
                        </div>
                    </Link>
                    <Link
                        href="/client/legal-request"
                        className="flex items-center gap-4 rounded-2xl border border-[#dfe8e3] bg-white p-5 text-[#173f37] transition hover:-translate-y-0.5"
                    >
                        <FilePlus2 className="text-[#b28b43]" />
                        <div>
                            <p className="font-bold">ثبت موضوع حقوقی</p>
                            <p className="mt-1 text-xs text-[#8a9994]">
                                ایجاد یا ادامه پیش‌نویس درخواست
                            </p>
                        </div>
                    </Link>
                    <Link
                        href="/client/messages"
                        className="flex items-center gap-4 rounded-2xl border border-[#dfe8e3] bg-white p-5 text-[#173f37] transition hover:-translate-y-0.5"
                    >
                        <MessageSquareText className="text-[#b28b43]" />
                        <div>
                            <p className="font-bold">گفتگو با وکیل</p>
                            <p className="mt-1 text-xs text-[#8a9994]">
                                پس از رزرو یا شروع همکاری
                            </p>
                        </div>
                    </Link>
                </div>

                {loading && (
                    <div className="rounded-2xl border border-[#dfe8e3] bg-white py-16 text-center text-[#71817c]">
                        در حال دریافت اطلاعات داشبورد...
                    </div>
                )}

                {error && (
                    <div className="rounded-2xl bg-red-50 px-5 py-4 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {!loading && !error && (
                    <>
                        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            {stats.map((item) => {
                                const Icon = item.icon;

                                return (
                                    <div
                                        key={item.label}
                                        className="flex items-center justify-between rounded-2xl border border-[#dfe8e3] bg-white p-5"
                                    >
                                        <div>
                                            <p className="text-sm text-[#60736d]">
                                                {item.label}
                                            </p>
                                            <p className="mt-2 text-2xl font-bold text-[#0d302a]">
                                                {numberFormatter.format(item.value)}
                                            </p>
                                        </div>
                                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f4f0e5] text-[#0d302a]">
                                            <Icon size={20} />
                                        </span>
                                    </div>
                                );
                            })}
                        </section>

                        <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
                            <RecordList
                                title="پرونده‌های فعال"
                                emptyText="در حال حاضر پرونده فعالی ندارید."
                                items={activeCases}
                            />
                            <RecordList
                                title="درخواست‌های ثبت‌شده"
                                emptyText="درخواست ثبت‌شده‌ای وجود ندارد."
                                items={submitted}
                            />
                            <RecordList
                                title="پیش‌نویس‌ها"
                                emptyText="پیش‌نویسی ذخیره نشده است."
                                items={drafts}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
