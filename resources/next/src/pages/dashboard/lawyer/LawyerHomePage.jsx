'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    Inbox,
    MessageCircle,
    Send,
    UserRound,
} from 'lucide-react';
import { Vazirmatn } from 'next/font/google';

import { apiRequest, unwrapData } from '@/lib/api/client';
import {
    getLawyerInvitations,
    getLawyerNegotiations,
} from '@/lib/api/lawyer';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
    display: 'swap',
});

export default function LawyerDashboard() {
    const [user, setUser] = useState(null);
    const [invitations, setInvitations] = useState([]);
    const [negotiations, setNegotiations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        async function load() {
            try {
                const [userPayload, invitationsPayload, negotiationsPayload] =
                    await Promise.all([
                        apiRequest('user'),
                        getLawyerInvitations({ per_page: 50 }),
                        getLawyerNegotiations({ per_page: 50 }),
                    ]);

                if (!mounted) return;

                setUser(unwrapData(userPayload) ?? userPayload);
                setInvitations(invitationsPayload?.data ?? []);
                setNegotiations(negotiationsPayload?.data ?? []);
            } finally {
                if (mounted) setLoading(false);
            }
        }

        load();

        return () => {
            mounted = false;
        };
    }, []);

    const pendingInvitations = invitations.filter(
        (item) => item.status === 'pending',
    ).length;
    const activeNegotiations = negotiations.filter((item) =>
        ['active', 'proposal_submitted'].includes(item.status),
    ).length;
    const submittedProposals = negotiations.filter(
        (item) => item.proposal?.status === 'submitted',
    ).length;

    const fullName =
        [user?.name, user?.last_name].filter(Boolean).join(' ') || 'وکیل';

    const stats = [
        {
            label: 'دعوت‌های در انتظار',
            value: pendingInvitations,
            icon: Inbox,
            href: '/lawyer/invitations',
        },
        {
            label: 'مذاکرات باز',
            value: activeNegotiations,
            icon: MessageCircle,
            href: '/lawyer/negotiation',
        },
        {
            label: 'پیشنهادهای ارسال‌شده',
            value: submittedProposals,
            icon: Send,
            href: '/lawyer/negotiation',
        },
    ];

    return (
        <main
            dir="rtl"
            className={`${vazir.className} min-h-screen bg-[#f6f8f5] px-4 py-8 sm:px-6 lg:px-8 xl:px-10`}
        >
            <div className="mx-auto max-w-[1300px]">
                <header className="mb-7 rounded-[22px] border border-[#dce5e1] bg-white p-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#174c42] text-white">
                            <UserRound size={22} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-[#9b7a32]">
                                پنل وکیل
                            </p>
                            <h1 className="mt-1 text-2xl font-black text-[#173f38]">
                                {loading
                                    ? 'در حال دریافت اطلاعات...'
                                    : `سلام ${fullName}`}
                            </h1>
                        </div>
                    </div>
                    <p className="mt-4 text-sm leading-7 text-[#71817b]">
                        دعوت‌های جدید را بررسی کنید، وارد مذاکره شوید و پیشنهاد
                        رسمی همکاری را از داخل گفت‌وگو ارسال کنید.
                    </p>
                </header>

                <div className="grid gap-4 md:grid-cols-3">
                    {stats.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <Link
                                key={stat.label}
                                href={stat.href}
                                className="rounded-[20px] border border-[#dce5e1] bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf5f2] text-[#174c42]">
                                        <Icon size={19} />
                                    </div>
                                    <ArrowLeft
                                        size={18}
                                        className="text-[#91a09b]"
                                    />
                                </div>
                                <p className="mt-5 text-3xl font-black text-[#173f38]">
                                    {loading ? '—' : stat.value}
                                </p>
                                <p className="mt-1 text-sm font-bold text-[#6e7e78]">
                                    {stat.label}
                                </p>
                            </Link>
                        );
                    })}
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                    <section className="rounded-[20px] border border-[#dce5e1] bg-white p-5">
                        <h2 className="font-black text-[#173f38]">
                            دعوت‌های جدید
                        </h2>
                        <p className="mt-2 text-sm leading-7 text-[#788782]">
                            درخواست‌های مستقیم موکلان را قبول یا رد کنید. با
                            قبول هر درخواست، مذاکره همان لحظه باز می‌شود.
                        </p>
                        <Link
                            href="/lawyer/invitations"
                            className="mt-5 inline-flex rounded-xl bg-[#174c42] px-5 py-3 text-sm font-bold text-white"
                        >
                            مشاهده دعوت‌ها
                        </Link>
                    </section>

                    <section className="rounded-[20px] border border-[#dce5e1] bg-white p-5">
                        <h2 className="font-black text-[#173f38]">
                            مذاکرات فعال
                        </h2>
                        <p className="mt-2 text-sm leading-7 text-[#788782]">
                            پیام‌های موکل را پاسخ دهید و در زمان مناسب پیشنهاد
                            رسمی شامل مبلغ، مدت و محدوده خدمات ثبت کنید.
                        </p>
                        <Link
                            href="/lawyer/negotiation"
                            className="mt-5 inline-flex rounded-xl bg-[#174c42] px-5 py-3 text-sm font-bold text-white"
                        >
                            مشاهده مذاکرات
                        </Link>
                    </section>
                </div>
            </div>
        </main>
    );
}
