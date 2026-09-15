'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
    ArrowLeft,
    BriefcaseBusiness,
    CalendarClock,
    Inbox,
    MessageCircle,
    Settings2,
} from 'lucide-react';
import { Vazirmatn } from 'next/font/google';

import {
    getLawyerInvitations,
    getLawyerNegotiations,
    getLawyerProfile,
} from '@/lib/api/lawyer';
import { getLawyerCases } from '@/lib/api/lawyerCases';
import { getLawyerConsultations } from '@/lib/api/consultations';
import { formatPersianDate, formatTime24 } from '@/lib/persianDateTime';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

const fa = new Intl.NumberFormat('fa-IR');

export default function LawyerHomePage() {
    const [profile, setProfile] = useState(null);
    const [invitations, setInvitations] = useState([]);
    const [negotiations, setNegotiations] = useState([]);
    const [cases, setCases] = useState([]);
    const [consultations, setConsultations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let mounted = true;

        Promise.all([
            getLawyerProfile(),
            getLawyerInvitations({ per_page: 50 }),
            getLawyerNegotiations({ per_page: 50 }),
            getLawyerCases(),
            getLawyerConsultations(),
        ])
            .then(([profilePayload, invitationsPayload, negotiationsPayload, casesPayload, consultationsPayload]) => {
                if (!mounted) return;
                setProfile(profilePayload);
                setInvitations(invitationsPayload?.data ?? []);
                setNegotiations(negotiationsPayload?.data ?? []);
                setCases(casesPayload?.data ?? casesPayload ?? []);
                setConsultations(consultationsPayload ?? []);
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

    const pendingInvitations = invitations.filter((item) => item.status === 'pending');
    const activeNegotiations = negotiations.filter((item) =>
        ['active', 'proposal_submitted'].includes(item.status),
    );
    const activeCases = cases.filter(
        (item) =>
            !['closed', 'cancelled', 'completed'].includes(
                String(item.status || item.stage || '').toLowerCase(),
            ),
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

    const nextConsultation = upcomingConsultations[0] ?? null;

    const completionParts = [
        Boolean(profile?.first_name && profile?.last_name),
        Boolean(profile?.bio && profile.bio.trim().length >= 30),
        Boolean(profile?.specialties?.length),
        Boolean(profile?.service_areas?.length),
    ];
    const completion = Math.round(
        (completionParts.filter(Boolean).length / completionParts.length) * 100,
    );

    const stats = [
        { label: 'دعوت جدید', value: pendingInvitations.length, icon: Inbox, href: '/lawyer/invitations' },
        { label: 'مذاکره فعال', value: activeNegotiations.length, icon: MessageCircle, href: '/lawyer/negotiation' },
        { label: 'پرونده فعال', value: activeCases.length, icon: BriefcaseBusiness, href: '/lawyer/cases' },
        { label: 'مشاوره آینده', value: upcomingConsultations.length, icon: CalendarClock, href: '/lawyer/consultations' },
    ];

    return (
        <main dir="rtl" className={`${vazir.className} min-h-screen bg-[#f7faf8] px-5 py-8 lg:px-8`}>
            <div className="mx-auto max-w-[1250px]">
                <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-xs font-bold text-[#a17d37]">خانه وکیل</p>
                        <h1 className="mt-1 text-2xl font-black text-[#173f38]">
                            {loading ? 'در حال دریافت اطلاعات...' : `سلام ${profile?.full_name || 'وکیل'}`}
                        </h1>
                        <p className="mt-2 text-sm leading-7 text-[#71817c]">
                            دعوت‌ها، مذاکرات، پرونده‌ها و مشاوره‌های پیش رو را از اینجا دنبال کنید.
                        </p>
                    </div>

                    <span className={`inline-flex w-fit items-center rounded-full border px-4 py-2 text-xs font-black ${
                        profile?.is_available
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : 'border-slate-200 bg-slate-100 text-slate-600'
                    }`}>
                        {profile?.is_available ? 'پذیرش پرونده فعال' : 'پذیرش پرونده غیرفعال'}
                    </span>
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
                                    <span>موکل: <b>{nextConsultation.client?.name || 'موکل'}</b></span>
                                    <span>
                                        {formatPersianDate(nextConsultation.scheduled_start_at)} ساعت {formatTime24(nextConsultation.scheduled_start_at)}
                                    </span>
                                    <span>{nextConsultation.duration_minutes} دقیقه</span>
                                </div>
                            </div>

                            <Link href="/lawyer/consultations" className="inline-flex w-fit rounded-xl bg-[#123f37] px-5 py-3 text-sm font-bold text-white">
                                مشاهده مشاوره
                            </Link>
                        </div>
                    </section>
                ) : null}

                <div className="mt-5 grid gap-5 xl:grid-cols-3">
                    <DashboardList
                        title="دعوت‌های جدید"
                        href="/lawyer/invitations"
                        empty="دعوت جدیدی ندارید."
                        items={pendingInvitations.slice(0, 3)}
                        renderItem={(item) => ({
                            title: item.legal_request?.title || item.title || 'درخواست حقوقی',
                            meta: item.client?.name || item.legal_request?.legal_category?.name || 'در انتظار بررسی',
                        })}
                    />

                    <DashboardList
                        title="مذاکرات فعال"
                        href="/lawyer/negotiation"
                        empty="مذاکره فعالی ندارید."
                        items={activeNegotiations.slice(0, 3)}
                        renderItem={(item) => ({
                            title: item.legal_request?.title || item.title || 'مذاکره حقوقی',
                            meta: item.client?.name || (item.proposal?.status === 'submitted' ? 'پیشنهاد ارسال شده' : 'در حال مذاکره'),
                        })}
                    />

                    <DashboardList
                        title="پرونده‌های فعال"
                        href="/lawyer/cases"
                        empty="پرونده فعالی ندارید."
                        items={activeCases.slice(0, 3)}
                        renderItem={(item) => ({
                            title: item.legal_request?.title || item.title || 'پرونده حقوقی',
                            meta: item.client?.name || item.stage_label || item.stage || 'در حال پیگیری',
                        })}
                    />
                </div>

                {completion < 100 ? (
                    <section className="mt-5 flex flex-col gap-4 rounded-[18px] border border-[#eadfbe] bg-[#fffaf0] p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#9b772c]">
                                <Settings2 size={18} />
                            </span>
                            <div>
                                <h2 className="font-extrabold text-[#5d4c27]">
                                    پروفایل حرفه‌ای شما {fa.format(completion)}٪ تکمیل شده
                                </h2>
                                <p className="mt-1 text-xs leading-6 text-[#8b7440]">
                                    تکمیل تخصص‌ها، معرفی و محدوده فعالیت به Matching دقیق‌تر کمک می‌کند.
                                </p>
                            </div>
                        </div>

                        <Link href="/lawyer/profile-settings" className="inline-flex w-fit rounded-xl border border-[#d7bd82] bg-white px-4 py-2.5 text-xs font-bold text-[#70561e]">
                            تکمیل پروفایل
                        </Link>
                    </section>
                ) : null}
            </div>
        </main>
    );
}

function DashboardList({ title, href, empty, items, renderItem }) {
    return (
        <section className="overflow-hidden rounded-[18px] border border-[#dfe7e3] bg-white">
            <div className="flex items-center justify-between border-b border-[#edf1ef] px-5 py-4">
                <h2 className="font-extrabold text-[#173f38]">{title}</h2>
                <Link href={href} className="text-xs font-bold text-[#17634f]">مشاهده همه</Link>
            </div>

            {!items.length ? (
                <p className="px-5 py-10 text-center text-sm text-[#899691]">{empty}</p>
            ) : (
                <div className="divide-y divide-[#edf1ef]">
                    {items.map((item, index) => {
                        const view = renderItem(item);
                        return (
                            <div key={item.public_id || item.id || index} className="px-5 py-4">
                                <p className="truncate text-sm font-extrabold text-[#294e46]">{view.title}</p>
                                <p className="mt-1 truncate text-xs text-[#84918d]">{view.meta}</p>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
