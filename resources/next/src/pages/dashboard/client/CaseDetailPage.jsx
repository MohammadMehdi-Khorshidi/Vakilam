'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    ArrowRight,
    BriefcaseBusiness,
    CheckCircle2,
    Circle,
    Clock3,
    FileText,
    Handshake,
    MessageCircle,
    Scale,
    Send,
    WalletCards,
} from 'lucide-react';
import { Vazirmatn } from 'next/font/google';

import { apiRequest, unwrapData } from '@/lib/api/client';
import {
    getLegalRequest,
    getLegalRequestProposals,
} from '@/lib/api/legalRequests';

const vazirmatn = Vazirmatn({ subsets: ['arabic'], display: 'swap' });

const statusLabels = {
    draft: 'پیش‌نویس',
    submitted: 'در انتظار پاسخ وکلا',
    matched: 'در حال بررسی وکلا',
    active: 'در جریان',
    in_progress: 'در حال پیگیری',
    closed: 'بسته‌شده',
    cancelled: 'لغوشده',
};

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

function DetailItem({ label, value }) {
    return (
        <div className="rounded-xl bg-[#f8faf9] px-4 py-3">
            <p className="text-[11px] font-bold text-[#8a9793]">{label}</p>
            <p className="mt-1.5 text-sm font-extrabold text-[#31534b]">
                {value || 'ثبت نشده'}
            </p>
        </div>
    );
}

function SectionCard({ icon: Icon, title, description, children }) {
    return (
        <section className="rounded-[18px] border border-[#dfe7e3] bg-white p-5">
            <div className="flex items-start gap-3 border-b border-[#e8eeeb] pb-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edf5f2] text-[#174c42]">
                    <Icon size={19} />
                </div>
                <div>
                    <h2 className="font-extrabold text-[#173f38]">{title}</h2>
                    {description ? (
                        <p className="mt-1 text-xs leading-6 text-[#7e8d88]">
                            {description}
                        </p>
                    ) : null}
                </div>
            </div>
            <div className="pt-4">{children}</div>
        </section>
    );
}

function Timeline({ isActiveMatter, status }) {
    const steps = isActiveMatter
        ? [
              'درخواست ثبت شد',
              'مذاکره با وکیل',
              'پیشنهاد پذیرفته شد',
              'قرارداد و پرداخت',
              'پرونده در جریان',
          ]
        : [
              'درخواست ثبت شد',
              'ارسال برای وکلا',
              'مذاکره',
              'پیشنهاد وکیل',
              'قرارداد و پرداخت',
          ];

    const currentIndex = isActiveMatter
        ? 4
        : status === 'matched'
          ? 1
          : 0;

    return (
        <div className="grid gap-3 md:grid-cols-5">
            {steps.map((step, index) => {
                const done = index <= currentIndex;

                return (
                    <div
                        key={step}
                        className={`rounded-xl border p-3 ${
                            done
                                ? 'border-[#c7dfd7] bg-[#f1f8f5]'
                                : 'border-[#e4e9e7] bg-[#fbfcfc]'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            {done ? (
                                <CheckCircle2
                                    size={17}
                                    className="text-[#1e705e]"
                                />
                            ) : (
                                <Circle
                                    size={17}
                                    className="text-[#a8b2ae]"
                                />
                            )}
                            <span
                                className={`text-xs font-bold ${
                                    done
                                        ? 'text-[#315f54]'
                                        : 'text-[#8c9995]'
                                }`}
                            >
                                {step}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function ProposalCard({ proposal }) {
    return (
        <article className="rounded-2xl border border-[#e4ddc6] bg-[#fffdf6] p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <p className="text-xs font-bold text-[#907849]">
                        پیشنهاد رسمی وکیل
                    </p>
                    <h3 className="mt-1 font-extrabold text-[#4d4a3b]">
                        {proposal.lawyer?.full_name || 'وکیل'}
                    </h3>
                </div>
                <span className="w-fit rounded-full bg-[#f3ecd8] px-3 py-1 text-xs font-bold text-[#79602f]">
                    {proposal.status || 'ثبت‌شده'}
                </span>
            </div>

            {proposal.summary ? (
                <p className="mt-4 text-sm leading-7 text-[#626056]">
                    {proposal.summary}
                </p>
            ) : null}

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <DetailItem
                    label="مبلغ پیشنهادی"
                    value={
                        proposal.proposed_fee_rial
                            ? `${faNumber.format(
                                  proposal.proposed_fee_rial,
                              )} ریال`
                            : 'ثبت نشده'
                    }
                />
                <DetailItem
                    label="زمان تقریبی"
                    value={
                        proposal.estimated_days
                            ? `${faNumber.format(
                                  proposal.estimated_days,
                              )} روز`
                            : 'ثبت نشده'
                    }
                />
            </div>
        </article>
    );
}

export default function CaseDetailPage({ caseId }) {
    const searchParams = useSearchParams();
    const type = searchParams.get('type') === 'case' ? 'case' : 'request';

    const [item, setItem] = useState(null);
    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let mounted = true;

        async function load() {
            setLoading(true);
            setError('');

            try {
                if (type === 'case') {
                    const response = await apiRequest('client/dashboard');
                    const dashboard = unwrapData(response);
                    const cases = dashboard?.active_cases || [];
                    const found = cases.find(
                        (entry) =>
                            String(entry.id) === String(caseId) ||
                            String(entry.public_id) === String(caseId),
                    );

                    if (!found) {
                        throw new Error('پرونده موردنظر پیدا نشد.');
                    }

                    if (mounted) {
                        setItem(found);
                        setProposals([]);
                    }
                    return;
                }

                const [request, requestProposals] = await Promise.all([
                    getLegalRequest(caseId),
                    getLegalRequestProposals(caseId).catch(() => []),
                ]);

                if (mounted) {
                    setItem(request);
                    setProposals(
                        Array.isArray(requestProposals)
                            ? requestProposals
                            : [],
                    );
                }
            } catch (requestError) {
                if (mounted) {
                    setError(
                        requestError?.message ||
                            'دریافت جزئیات با خطا مواجه شد.',
                    );
                }
            } finally {
                if (mounted) setLoading(false);
            }
        }

        load();

        return () => {
            mounted = false;
        };
    }, [caseId, type]);

    const isActiveMatter = type === 'case';

    const pageTitle = useMemo(
        () => item?.title || 'موضوع حقوقی بدون عنوان',
        [item],
    );

    if (loading) {
        return (
            <main
                dir="rtl"
                className={`${vazirmatn.className} min-h-screen bg-[#f7faf8]`}
            >
                <div className="mx-auto mt-12 max-w-[1180px] px-5 py-7">
                    <div className="rounded-[18px] border border-[#dfe7e3] bg-white py-20 text-center text-[#899691]">
                        در حال دریافت جزئیات...
                    </div>
                </div>
            </main>
        );
    }

    if (error || !item) {
        return (
            <main
                dir="rtl"
                className={`${vazirmatn.className} min-h-screen bg-[#f7faf8]`}
            >
                <div className="mx-auto mt-12 max-w-[1180px] px-5 py-7">
                    <Link
                        href="/client/cases"
                        className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-[#315f54]"
                    >
                        <ArrowRight size={17} />
                        بازگشت به پرونده‌های من
                    </Link>
                    <div className="rounded-[18px] border border-red-200 bg-red-50 p-5 text-red-700">
                        {error || 'پرونده موردنظر پیدا نشد.'}
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main
            dir="rtl"
            className={`${vazirmatn.className} min-h-screen bg-[#f7faf8]`}
        >
            <div className="mx-auto mt-12 max-w-[1180px] px-5 py-7">
                <Link
                    href="/client/cases"
                    className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-[#42685e] transition hover:text-[#174c42]"
                >
                    <ArrowRight size={17} />
                    بازگشت به پرونده‌های من
                </Link>

                <header className="mb-5 rounded-[20px] border border-[#dbe6e2] bg-white p-5 md:p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                            <p className="text-xs font-bold text-[#87958f]">
                                {isActiveMatter
                                    ? 'پرونده در جریان'
                                    : 'درخواست حقوقی'}
                            </p>
                            <h1 className="mt-2 text-xl font-black text-[#173f38] md:text-2xl">
                                {pageTitle}
                            </h1>
                            <div className="mt-3 flex flex-wrap gap-3 text-xs text-[#84918d]">
                                {item.public_id ? (
                                    <span>
                                        شناسه:
                                        <b
                                            dir="ltr"
                                            className="mr-1 text-[#596b65]"
                                        >
                                            {item.public_id}
                                        </b>
                                    </span>
                                ) : null}
                                <span className="inline-flex items-center gap-1.5">
                                    <Clock3 size={14} />
                                    آخرین بروزرسانی:
                                    {formatDate(item.updated_at)}
                                </span>
                            </div>
                        </div>

                        <span className="w-fit rounded-full border border-[#d6e4df] bg-[#f2f8f5] px-4 py-2 text-xs font-extrabold text-[#35665a]">
                            {statusLabels[item.status] ||
                                item.status ||
                                'نامشخص'}
                        </span>
                    </div>

                    {!isActiveMatter ? (
                        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <DetailItem
                                label="فوریت"
                                value={urgencyLabels[item.urgency]}
                            />
                            <DetailItem
                                label="نوع خدمت"
                                value={
                                    serviceIntentLabels[item.service_intent]
                                }
                            />
                            <DetailItem
                                label="تاریخ ثبت"
                                value={formatDate(
                                    item.submitted_at || item.created_at,
                                )}
                            />
                            <DetailItem
                                label="وضعیت"
                                value={
                                    statusLabels[item.status] || item.status
                                }
                            />
                        </div>
                    ) : (
                        <div className="mt-5 grid gap-3 sm:grid-cols-3">
                            <DetailItem
                                label="تاریخ شروع"
                                value={formatDate(item.opened_at)}
                            />
                            <DetailItem
                                label="آخرین بروزرسانی"
                                value={formatDate(item.updated_at)}
                            />
                            <DetailItem
                                label="وضعیت"
                                value={
                                    statusLabels[item.status] || item.status
                                }
                            />
                        </div>
                    )}
                </header>

                <div className="space-y-5">
                    <SectionCard
                        icon={Scale}
                        title="روند پرونده"
                        description="موقعیت فعلی این درخواست در فرایند انتخاب وکیل تا شروع پرونده."
                    >
                        <Timeline
                            isActiveMatter={isActiveMatter}
                            status={item.status}
                        />
                    </SectionCard>

                    {!isActiveMatter ? (
                        <>
                            <SectionCard
                                icon={MessageCircle}
                                title="وکلا و مذاکرات"
                                description="پاسخ وکلا، گفتگوها و مذاکرات مربوط به این درخواست از این بخش مدیریت می‌شود."
                            >
                                <div className="rounded-xl border border-dashed border-[#d4dfdb] bg-[#fafcfb] p-4">
                                    <p className="text-sm leading-7 text-[#65756f]">
                                        در این مرحله می‌توانید وکلای دعوت‌شده و
                                        وضعیت مذاکره با هرکدام را دنبال کنید.
                                        نمایش مستقیم گفتگوها در مرحله بعد به همین
                                        بخش متصل می‌شود.
                                    </p>

                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <Link
                                            href={`/client/lawyersAdmin?legal_request_id=${encodeURIComponent(
                                                item.id,
                                            )}`}
                                            className="inline-flex items-center gap-2 rounded-xl bg-[#174c42] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#103b33]"
                                        >
                                            <Send size={16} />
                                            مدیریت وکلا
                                        </Link>
                                    </div>
                                </div>
                            </SectionCard>

                            <SectionCard
                                icon={Handshake}
                                title="پیشنهادهای رسمی"
                                description="پیشنهادهای مالی و اجرایی وکلا در طول مذاکره اینجا نگهداری می‌شود."
                            >
                                {proposals.length === 0 ? (
                                    <div className="rounded-xl bg-[#fafcfb] px-4 py-8 text-center text-sm text-[#87958f]">
                                        هنوز پیشنهاد رسمی از طرف وکیلی ثبت نشده
                                        است.
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {proposals.map((proposal) => (
                                            <ProposalCard
                                                key={
                                                    proposal.public_id ||
                                                    proposal.id
                                                }
                                                proposal={proposal}
                                            />
                                        ))}
                                    </div>
                                )}
                            </SectionCard>

                            <SectionCard
                                icon={FileText}
                                title="قرارداد"
                                description="پس از پذیرش پیشنهاد نهایی وکیل، قرارداد همکاری از این بخش دنبال می‌شود."
                            >
                                <p className="rounded-xl bg-[#fafcfb] px-4 py-5 text-sm leading-7 text-[#7b8984]">
                                    هنوز قرارداد فعالی برای این درخواست ایجاد
                                    نشده است.
                                </p>
                            </SectionCard>

                            <SectionCard
                                icon={WalletCards}
                                title="پرداخت"
                                description="بعد از نهایی‌شدن قرارداد، صورتحساب و پرداخت در همین صفحه در دسترس خواهد بود."
                            >
                                <p className="rounded-xl bg-[#fafcfb] px-4 py-5 text-sm leading-7 text-[#7b8984]">
                                    پرداخت بعد از نهایی‌شدن قرارداد فعال می‌شود.
                                </p>
                            </SectionCard>
                        </>
                    ) : (
                        <SectionCard
                            icon={BriefcaseBusiness}
                            title="پرونده فعال"
                            description="این پرونده مرحله درخواست و پرداخت را پشت سر گذاشته و وارد فرایند ارائه خدمت شده است."
                        >
                            <p className="rounded-xl bg-[#f3f8f6] px-4 py-5 text-sm leading-7 text-[#587168]">
                                جزئیات اجرایی پرونده، اسناد، جلسات و ارتباط با
                                وکیل در مراحل بعدی به همین صفحه اضافه می‌شود.
                            </p>
                        </SectionCard>
                    )}
                </div>
            </div>
        </main>
    );
}
