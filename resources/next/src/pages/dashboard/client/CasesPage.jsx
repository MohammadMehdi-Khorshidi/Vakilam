'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BriefcaseBusiness, FilePlus2 } from 'lucide-react';
import { Vazirmatn } from 'next/font/google';

import { apiRequest, unwrapData } from '@/lib/api/client';

const vazirmatn = Vazirmatn({ subsets: ['arabic'], display: 'swap' });

const statusLabels = {
    draft: 'پیش‌نویس',
    submitted: 'ثبت‌شده',
    matched: 'در حال بررسی پیشنهادها',
    active: 'فعال',
    in_progress: 'در حال پیگیری',
    closed: 'بسته‌شده',
    cancelled: 'لغوشده',
};

function CaseSection({ title, items, emptyText }) {
    return (
        <section className="rounded-[18px] border border-[#dfe7e3] bg-white p-5">
            <h2 className="border-b border-[#e8eeeb] pb-4 font-extrabold text-[#173f38]">
                {title}
            </h2>
            {items.length === 0 ? (
                <p className="py-8 text-center text-sm text-[#899691]">
                    {emptyText}
                </p>
            ) : (
                <div className="divide-y divide-[#e8eeeb]">
                    {items.map((item) => (
                        <article
                            key={item.public_id || item.id}
                            className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between"
                        >
                            <div>
                                <h3 className="font-bold text-[#294e46]">
                                    {item.title || 'موضوع حقوقی بدون عنوان'}
                                </h3>
                                <p className="mt-1 text-xs text-[#899691]">
                                    شناسه: {item.public_id}
                                </p>
                            </div>
                            <span className="w-fit rounded-full bg-[#f4f0e5] px-3 py-1.5 text-xs font-semibold text-[#6f5b2e]">
                                {statusLabels[item.status] || item.status}
                            </span>
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
    const submitted = dashboard?.submitted_requests || [];
    const drafts = dashboard?.draft_cases || [];

    return (
        <main
            dir="rtl"
            className={`${vazirmatn.className} min-h-screen bg-[#f7faf8]`}
        >
            <div className="mx-auto mt-12 max-w-[1280px] px-5 py-7">
                <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-extrabold text-[#173f38]">
                            پرونده‌ها و درخواست‌های من
                        </h1>
                        <p className="mt-2 text-sm text-[#71817c]">
                            اطلاعات این بخش مستقیماً از حساب کاربری شما دریافت می‌شود.
                        </p>
                    </div>
                    <Link
                        href="/client/legal-request"
                        className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#123f37] px-5 py-3 font-bold text-white"
                    >
                        <FilePlus2 size={18} />
                        ثبت موضوع جدید
                    </Link>
                </header>

                {loading && (
                    <div className="rounded-[18px] border border-[#dfe7e3] bg-white py-16 text-center text-[#899691]">
                        در حال دریافت پرونده‌ها...
                    </div>
                )}

                {error && (
                    <div className="rounded-[18px] bg-red-50 p-5 text-red-700">
                        {error}
                    </div>
                )}

                {!loading && !error && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 rounded-[18px] bg-[#0d4a40] p-5 text-white">
                            <BriefcaseBusiness className="text-[#dfc58f]" />
                            <p>
                                {new Intl.NumberFormat('fa-IR').format(
                                    activeCases.length,
                                )}{' '}
                                پرونده فعال در حساب شما وجود دارد.
                            </p>
                        </div>
                        <CaseSection
                            title="پرونده‌های فعال"
                            items={activeCases}
                            emptyText="در حال حاضر پرونده فعالی ندارید."
                        />
                        <CaseSection
                            title="درخواست‌های ثبت‌شده"
                            items={submitted}
                            emptyText="درخواست ثبت‌شده‌ای وجود ندارد."
                        />
                        <CaseSection
                            title="پیش‌نویس‌ها"
                            items={drafts}
                            emptyText="پیش‌نویسی ذخیره نشده است."
                        />
                    </div>
                )}
            </div>
        </main>
    );
}
