'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Check,
    Clock3,
    MapPin,
    Scale,
    X,
} from 'lucide-react';
import { Vazirmatn } from 'next/font/google';

import {
    getLawyerInvitations,
    respondToLawyerInvitation,
} from '@/lib/api/lawyer';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
    display: 'swap',
});

const urgencyLabels = {
    low: 'کم',
    normal: 'عادی',
    high: 'زیاد',
    urgent: 'فوری',
};

const statusLabels = {
    pending: 'در انتظار پاسخ شما',
    negotiating: 'پذیرفته‌شده / مذاکره فعال',
    rejected: 'ردشده',
    expired: 'منقضی‌شده',
    closed: 'بسته‌شده',
};

function formatDate(value) {
    if (!value) return 'ثبت نشده';

    return new Intl.DateTimeFormat('fa-IR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value));
}

export default function LawyerInvitationsPage() {
    const router = useRouter();
    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState(null);
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            const response = await getLawyerInvitations({ per_page: 50 });
            setInvitations(response?.data ?? []);
        } catch (requestError) {
            setError(
                requestError?.message ||
                    'دریافت دعوت‌های وکالت با خطا مواجه شد.',
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const respond = async (invitation, action) => {
        if (busyId) return;

        setBusyId(invitation.distribution_id);
        setError('');

        try {
            const response = await respondToLawyerInvitation(
                invitation.distribution_id,
                action,
            );

            if (action === 'accept' && response?.negotiation?.public_id) {
                router.push(
                    `/lawyer/negotiation/${encodeURIComponent(
                        response.negotiation.public_id,
                    )}`,
                );
                return;
            }

            await load();
        } catch (requestError) {
            setError(
                requestError?.validationMessages?.[0] ||
                    requestError?.message ||
                    'ثبت پاسخ با خطا مواجه شد.',
            );
        } finally {
            setBusyId(null);
        }
    };

    return (
        <main
            dir="rtl"
            className={`${vazir.className} min-h-screen bg-[#f6f8f5] px-4 py-8 sm:px-6 lg:px-8 xl:px-10`}
        >
            <div className="mx-auto w-full max-w-[1300px]">
                <header className="mb-6">
                    <p className="text-sm font-bold text-[#a47b2c]">
                        پنل وکیل
                    </p>
                    <h1 className="mt-2 text-2xl font-black text-[#123e35] md:text-3xl">
                        دعوت‌های موکلان
                    </h1>
                    <p className="mt-2 text-sm leading-7 text-[#75847f]">
                        درخواست‌هایی که موکلان مستقیماً برای شما ارسال
                        کرده‌اند. قبول درخواست، یک مذاکره جدید باز می‌کند.
                    </p>
                </header>

                {error ? (
                    <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
                        {error}
                    </div>
                ) : null}

                {loading ? (
                    <div className="rounded-2xl border bg-white p-12 text-center text-[#81908b]">
                        در حال دریافت دعوت‌ها...
                    </div>
                ) : invitations.length === 0 ? (
                    <div className="rounded-2xl border bg-white p-12 text-center text-[#81908b]">
                        فعلاً دعوتی برای شما ثبت نشده است.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {invitations.map((invitation) => {
                            const request = invitation.legal_request ?? {};
                            const pending = invitation.status === 'pending';
                            const busy =
                                busyId === invitation.distribution_id;

                            return (
                                <article
                                    key={invitation.distribution_id}
                                    className="rounded-[20px] border border-[#dde5e1] bg-white p-5 shadow-[0_8px_30px_rgba(18,62,53,0.04)]"
                                >
                                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="rounded-full bg-[#edf5f2] px-3 py-1 text-xs font-bold text-[#315f54]">
                                                    {statusLabels[
                                                        invitation.status
                                                    ] ||
                                                        invitation.status}
                                                </span>
                                                <span className="rounded-full bg-[#fff8e9] px-3 py-1 text-xs font-bold text-[#896721]">
                                                    فوریت:{' '}
                                                    {urgencyLabels[
                                                        request.urgency
                                                    ] || 'نامشخص'}
                                                </span>
                                            </div>

                                            <h2 className="mt-4 text-lg font-black text-[#173f38]">
                                                {request.title ||
                                                    'درخواست حقوقی بدون عنوان'}
                                            </h2>

                                            <div className="mt-3 flex flex-wrap gap-3 text-xs text-[#788782]">
                                                <span className="inline-flex items-center gap-1.5">
                                                    <Scale size={15} />
                                                    {request.category ||
                                                        'موضوع ثبت نشده'}
                                                </span>
                                                <span className="inline-flex items-center gap-1.5">
                                                    <MapPin size={15} />
                                                    {[
                                                        request.province,
                                                        request.city,
                                                    ]
                                                        .filter(Boolean)
                                                        .join('، ') ||
                                                        'موقعیت ثبت نشده'}
                                                </span>
                                                <span className="inline-flex items-center gap-1.5">
                                                    <Clock3 size={15} />
                                                    {formatDate(
                                                        invitation.sent_at,
                                                    )}
                                                </span>
                                            </div>

                                            {request.description ? (
                                                <p className="mt-4 max-w-4xl whitespace-pre-wrap text-sm leading-8 text-[#60716b]">
                                                    {request.description}
                                                </p>
                                            ) : null}
                                        </div>

                                        <div className="flex shrink-0 flex-wrap gap-2">
                                            {pending ? (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            respond(
                                                                invitation,
                                                                'accept',
                                                            )
                                                        }
                                                        disabled={busy}
                                                        className="inline-flex items-center gap-2 rounded-xl bg-[#14594b] px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
                                                    >
                                                        <Check size={17} />
                                                        قبول و شروع مذاکره
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            respond(
                                                                invitation,
                                                                'reject',
                                                            )
                                                        }
                                                        disabled={busy}
                                                        className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-bold text-red-700 disabled:opacity-50"
                                                    >
                                                        <X size={17} />
                                                        رد درخواست
                                                    </button>
                                                </>
                                            ) : invitation.negotiation_public_id ? (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        router.push(
                                                            `/lawyer/negotiation/${encodeURIComponent(
                                                                invitation.negotiation_public_id,
                                                            )}`,
                                                        )
                                                    }
                                                    className="rounded-xl bg-[#14594b] px-5 py-3 text-sm font-bold text-white"
                                                >
                                                    ورود به مذاکره
                                                </button>
                                            ) : null}
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}
