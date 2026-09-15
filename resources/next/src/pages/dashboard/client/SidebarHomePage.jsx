'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
    ArrowLeft,
    Bot,
    BriefcaseBusiness,
    CalendarClock,
    Clock3,
    FilePlus2,
    FileText,
} from 'lucide-react';
import { Vazirmatn } from 'next/font/google';

import { apiRequest, unwrapData } from '@/lib/api/client';
import { getClientConsultations } from '@/lib/api/consultations';
import { formatPersianDate, formatTime24 } from '@/lib/persianDateTime';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

const fa = new Intl.NumberFormat('fa-IR');

const requestStatusLabels = {
    submitted: 'در انتظار ادامه',
    matched: 'وکلا پیشنهاد شده‌اند',
    in_progress: 'در حال پیگیری',
    active: 'فعال',
    closed: 'بسته‌شده',
    cancelled: 'لغوشده',
};

export default function ClientHomePage() {
    const [user, setUser] = useState(null);
    const [dashboard, setDashboard] = useState(null);
    const [consultations, setConsultations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let mounted = true;

        Promise.all([
            apiRequest('user'),
            apiRequest('client/dashboard'),
            getClientConsultations(),
        ])
            .then(([userPayload, dashboardPayload, consultationPayload]) => {
                if (!mounted) return;
                setUser(unwrapData(userPayload) ?? userPayload);
                setDashboard(unwrapData(dashboardPayload));
                setConsultations(consultationPayload?.consultations ?? []);
            })
            .catch((e) => {
                if (mounted) setError(e?.message || 'دریافت اطلاعات داشبورد انجام نشد.');
            })
            .finally(() => {
                if (mounted) setLoading(false);
            });

        return () => {
            mounted = false;
        };
    }, []);

    const activeCases = dashboard?.active_cases ?? [];
    const submittedRequests = (dashboard?.submitted_requests ?? []).filter(
        (item) => item.service_intent !== 'consultation',
    );

    const upcomingConsultations = useMemo(() => {
        const now = Date.now();
        return consultations
            .filter(
                (item) =>
                    ['reserved', 'confirmed'].includes(item.status) &&
                    item.scheduled_start_at &&
                    new Date(item.scheduled_start_at).getTime() > now,
            )
            .sort(
                (a, b) =>
                    new Date(a.scheduled_start_at) - new Date(b.scheduled_start_at),
            );
    }, [consultations]);

    const heldConsultations = consultations.filter((item) => item.status === 'held');
    const nextConsultation = upcomingConsultations[0] ?? null;
    const fullName = [user?.name, user?.last_name].filter(Boolean).join(' ') || 'موکل';

    const stats = [
        { label: 'پرونده فعال', value: activeCases.length, icon: BriefcaseBusiness, href: '/client/cases' },
        { label: 'درخواست در انتظار', value: submittedRequests.length, icon: FileText, href: '/client/cases' },
        { label: 'مشاوره آینده', value: upcomingConsultations.length, icon: CalendarClock, href: '/client/consultations' },
        { label: 'در انتظار پرداخت', value: heldConsultations.length, icon: Clock3, href: '/client/consultations' },
    ];

    return (
        <main dir="rtl" className={`${vazir.className} min-h-screen bg-[#f7faf8] px-5 py-6 lg:px-8`}>
            <div className="mx-auto max-w-[1250px]">
                <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-xs font-bold text-[#a17d37]">خانه موکل</p>
                        <h1 className="mt-1 text-2xl font-black text-[#173f38]">
                            {loading ? 'در حال دریافت اطلاعات...' : `سلام ${fullName}`}
                        </h1>
                        <p className="mt-2 text-sm leading-7 text-[#71817c]">
                            وضعیت پرونده‌ها، درخواست‌ها و مشاوره‌های خود را از اینجا دنبال کنید.
                        </p>
                    </div>

                    <Link href="/client/legal-request" className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#123f37] px-5 py-3 text-sm font-black text-white transition hover:bg-[#0d332c]">
                        <FilePlus2 size={17} />
                        شرح مسئله جدید
                    </Link>
                </header>

                {error ? (
                    <div className="mb-5 rounded-[18px] border border-red-200 bg-red-50 p-5 text-sm font-bold text-red-700">
                        {error}
                    </div>
                ) : null}

                <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {stats.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <Link key={stat.label} href={stat.href} className="rounded-[18px] border border-[#dfe7e3] bg-white p-5 transition hover:border-[#bcd2cb]">
                                <div className="flex items-center justify-between">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eff8f4] text-[#17634f]">
                                        <Icon size={19} />
                                    </span>
                                    <ArrowLeft size={17} className="text-[#94a19d]" />
                                </div>
                                <p className="mt-4 text-2xl font-black text-[#173f38]">
                                    {loading ? '—' : fa.format(stat.value)}
                                </p>
                                <p className="mt-1 text-sm font-bold text-[#687873]">{stat.label}</p>
                            </Link>
                        );
                    })}
                </section>

                {nextConsultation ? (
                    <section className="mt-5 rounded-[20px] border border-[#d6e7e0] bg-[#eff8f4] p-5 md:p-6">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <p className="text-xs font-bold text-[#648078]">مشاوره بعدی</p>
                                <h2 className="mt-2 text-lg font-black text-[#173f38]">
                                    {nextConsultation.legal_request?.title || 'مشاوره حقوقی'}
                                </h2>
                                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#60736d]">
                                    <span>وکیل: <b>{nextConsultation.lawyer?.full_name || '—'}</b></span>
                                    <span>
                                        {formatPersianDate(nextConsultation.scheduled_start_at)} ساعت {formatTime24(nextConsultation.scheduled_start_at)}
                                    </span>
                                    <span>{nextConsultation.duration_minutes} دقیقه</span>
                                </div>
                            </div>
                            <Link href="/client/consultations" className="inline-flex w-fit rounded-xl bg-[#123f37] px-5 py-3 text-sm font-bold text-white">
                                مشاهده مشاوره
                            </Link>
                        </div>
                    </section>
                ) : null}

                <div className="mt-5 grid gap-5 xl:grid-cols-2">
                    <section className="overflow-hidden rounded-[18px] border border-[#dfe7e3] bg-white">
                        <div className="flex items-center justify-between border-b border-[#edf1ef] px-5 py-4">
                            <h2 className="font-extrabold text-[#173f38]">پرونده‌های فعال</h2>
                            <Link href="/client/cases" className="text-xs font-bold text-[#17634f]">مشاهده همه</Link>
                        </div>
                        <List items={activeCases.slice(0, 3)} empty="پرونده فعالی ندارید." />
                    </section>

                    <section className="overflow-hidden rounded-[18px] border border-[#dfe7e3] bg-white">
                        <div className="flex items-center justify-between border-b border-[#edf1ef] px-5 py-4">
                            <h2 className="font-extrabold text-[#173f38]">درخواست‌های اخیر</h2>
                            <Link href="/client/cases" className="text-xs font-bold text-[#17634f]">مشاهده همه</Link>
                        </div>
                        <RecentRequestList items={submittedRequests.slice(0, 3)} empty="درخواست در انتظاری ندارید." />
                    </section>
                </div>

                <section className="mt-5 flex flex-col gap-4 rounded-[18px] border border-[#eadfbe] bg-[#fffaf0] p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#9b772c]">
                            <Bot size={18} />
                        </span>
                        <div>
                            <h2 className="font-extrabold text-[#5d4c27]">دستیار حقوقی وکیلم</h2>
                            <p className="mt-1 text-xs leading-6 text-[#8b7440]">
                                برای راهنمایی اولیه می‌توانید از دستیار حقوقی استفاده کنید.
                            </p>
                        </div>
                    </div>
                    <Link href="/client/legal-assistant" className="inline-flex w-fit rounded-xl border border-[#d7bd82] bg-white px-4 py-2.5 text-xs font-bold text-[#70561e]">
                        ورود به دستیار
                    </Link>
                </section>
            </div>
        </main>
    );
}


function RecentRequestList({ items, empty }) {
    if (!items.length) {
        return <p className="px-5 py-10 text-center text-sm text-[#899691]">{empty}</p>;
    }

    return (
        <div className="divide-y divide-[#edf1ef]">
            {items.map((item) => {
                const location = [item.province?.name, item.city?.name]
                    .filter(Boolean)
                    .join('، ');

                return (
                    <div
                        key={item.public_id || item.id}
                        className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                        <div className="min-w-0">
                            <p className="truncate text-sm font-extrabold text-[#294e46]">
                                {item.title || 'موضوع حقوقی'}
                            </p>

                            {item.description ? (
                                <p className="mt-2 line-clamp-2 text-xs leading-6 text-[#71817c]">
                                    {item.description}
                                </p>
                            ) : null}

                            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-bold text-[#8a9793]">
                                <span>{item.legal_category?.name || 'بدون دسته‌بندی'}</span>
                                {location ? <span>{location}</span> : null}
                                <span>{requestStatusLabels[item.status] || 'در حال پیگیری'}</span>
                            </div>
                        </div>

                        <Link
                            href={`/client/cases/${encodeURIComponent(item.id)}?type=request`}
                            className="inline-flex w-fit shrink-0 rounded-xl border border-[#cfded8] bg-[#f6faf8] px-4 py-2.5 text-xs font-extrabold text-[#17634f]"
                        >
                            مشاهده جزئیات
                        </Link>
                    </div>
                );
            })}
        </div>
    );
}

function List({ items, empty }) {
    if (!items.length) {
        return <p className="px-5 py-10 text-center text-sm text-[#899691]">{empty}</p>;
    }

    return (
        <div className="divide-y divide-[#edf1ef]">
            {items.map((item) => (
                <div key={item.public_id || item.id} className="flex items-center justify-between gap-4 px-5 py-4">
                    <div className="min-w-0">
                        <p className="truncate text-sm font-extrabold text-[#294e46]">
                            {item.title || 'موضوع حقوقی'}
                        </p>
                        <p className="mt-1 text-xs text-[#84918d]">
                            {requestStatusLabels[item.status] || 'در حال پیگیری'}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
