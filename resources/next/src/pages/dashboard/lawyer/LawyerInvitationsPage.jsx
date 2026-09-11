'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Check,
    Clock3,
    FileText,
    MapPin,
    Scale,
    Users,
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

const serviceIntentLabels = {
    consultation: 'مشاوره حقوقی',
    lawyer_selection: 'انتخاب وکیل',
};

const partyRoleLabels = {
    plaintiff: 'خواهان',
    defendant: 'خوانده',
    claimant: 'شاکی',
    accused: 'متهم',
    client: 'موکل',
    opponent: 'طرف مقابل',
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

    try {
        return new Intl.DateTimeFormat('fa-IR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(value));
    } catch {
        return 'ثبت نشده';
    }
}

function InfoItem({ label, value }) {
    return (
        <div className="rounded-xl bg-[#f7faf8] px-4 py-3">
            <p className="text-[11px] font-bold text-[#8b9994]">{label}</p>
            <p className="mt-1.5 text-sm font-extrabold text-[#36584f]">
                {value || 'ثبت نشده'}
            </p>
        </div>
    );
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
                        جزئیات درخواست را کامل بررسی کنید و بعد درباره قبول
                        یا رد آن تصمیم بگیرید.
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
                    <div className="space-y-5">
                        {invitations.map((invitation) => {
                            const request = invitation.legal_request ?? {};
                            const pending = invitation.status === 'pending';
                            const busy =
                                busyId === invitation.distribution_id;
                            const parties = request.parties ?? [];
                            const documents = request.documents ?? [];

                            return (
                                <article
                                    key={invitation.distribution_id}
                                    className="rounded-[22px] border border-[#d9e4df] bg-white p-5 shadow-[0_8px_30px_rgba(18,62,53,0.04)] md:p-6"
                                >
                                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="rounded-full bg-[#edf5f2] px-3 py-1 text-xs font-bold text-[#315f54]">
                                                    {statusLabels[
                                                        invitation.status
                                                    ] || invitation.status}
                                                </span>
                                                <span className="rounded-full bg-[#fff8e9] px-3 py-1 text-xs font-bold text-[#896721]">
                                                    فوریت:{' '}
                                                    {urgencyLabels[
                                                        request.urgency
                                                    ] || 'نامشخص'}
                                                </span>
                                            </div>

                                            <h2 className="mt-4 text-xl font-black text-[#173f38]">
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
                                                    ثبت:{' '}
                                                    {formatDate(
                                                        request.submitted_at ||
                                                            request.created_at,
                                                    )}
                                                </span>
                                            </div>
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

                                    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                        <InfoItem
                                            label="موضوع حقوقی"
                                            value={request.category}
                                        />
                                        <InfoItem
                                            label="نوع خدمت"
                                            value={
                                                serviceIntentLabels[
                                                    request.service_intent
                                                ]
                                            }
                                        />
                                        <InfoItem
                                            label="استان و شهر"
                                            value={[
                                                request.province,
                                                request.city,
                                            ]
                                                .filter(Boolean)
                                                .join('، ')}
                                        />
                                        <InfoItem
                                            label="تاریخ ارسال دعوت"
                                            value={formatDate(
                                                invitation.sent_at,
                                            )}
                                        />
                                    </div>

                                    <section className="mt-5 rounded-2xl border border-[#e2e9e6] bg-[#fbfdfc] p-4">
                                        <div className="flex items-center gap-2 font-extrabold text-[#31534b]">
                                            <FileText size={18} />
                                            شرح کامل درخواست
                                        </div>
                                        <p className="mt-3 whitespace-pre-wrap text-sm leading-8 text-[#60716b]">
                                            {request.description ||
                                                'شرحی ثبت نشده است.'}
                                        </p>
                                    </section>

                                    <div className="mt-5 grid gap-4 lg:grid-cols-2">
                                        <section className="rounded-2xl border border-[#e2e9e6] p-4">
                                            <div className="flex items-center gap-2 font-extrabold text-[#31534b]">
                                                <Users size={18} />
                                                طرفین ثبت‌شده
                                            </div>

                                            {parties.length === 0 ? (
                                                <p className="mt-3 text-sm text-[#899691]">
                                                    طرفی ثبت نشده است.
                                                </p>
                                            ) : (
                                                <div className="mt-3 space-y-2">
                                                    {parties.map((party) => (
                                                        <div
                                                            key={party.id}
                                                            className="rounded-xl bg-[#f8faf9] p-3"
                                                        >
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <span className="font-bold text-[#405b53]">
                                                                    {party.full_name ||
                                                                        'بدون نام'}
                                                                </span>
                                                                <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-[#74847e]">
                                                                    {partyRoleLabels[
                                                                        party
                                                                            .party_role
                                                                    ] ||
                                                                        party.party_role ||
                                                                        'طرف پرونده'}
                                                                </span>
                                                                {party.is_client ? (
                                                                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                                                                        موکل
                                                                    </span>
                                                                ) : null}
                                                            </div>
                                                            {party.relation_note ? (
                                                                <p className="mt-2 text-xs leading-6 text-[#7f8d88]">
                                                                    {
                                                                        party.relation_note
                                                                    }
                                                                </p>
                                                            ) : null}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </section>

                                        <section className="rounded-2xl border border-[#e2e9e6] p-4">
                                            <div className="flex items-center gap-2 font-extrabold text-[#31534b]">
                                                <FileText size={18} />
                                                مدارک ثبت‌شده
                                            </div>

                                            {documents.length === 0 ? (
                                                <p className="mt-3 text-sm text-[#899691]">
                                                    مدرکی ثبت نشده است.
                                                </p>
                                            ) : (
                                                <div className="mt-3 space-y-2">
                                                    {documents.map(
                                                        (document) => (
                                                            <div
                                                                key={
                                                                    document.id ||
                                                                    document.public_id
                                                                }
                                                                className="rounded-xl bg-[#f8faf9] p-3"
                                                            >
                                                                <p className="font-bold text-[#405b53]">
                                                                    {document.title ||
                                                                        document
                                                                            .current_file
                                                                            ?.original_name ||
                                                                        'مدرک'}
                                                                </p>
                                                                <p className="mt-1 text-xs text-[#7f8d88]">
                                                                    {document
                                                                        .document_type
                                                                        ?.name ||
                                                                        document
                                                                            .current_file
                                                                            ?.original_name ||
                                                                        'فایل ثبت‌شده'}
                                                                </p>
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            )}
                                        </section>
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
