'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowRight,
    FileSignature,
    MessageCircleMore,
    ReceiptText,
    ShieldCheck,
    UserRound,
} from 'lucide-react';

import { getLawyerCase } from '@/lib/api/lawyerCases';

const money = new Intl.NumberFormat('fa-IR');

function Info({ label, children }) {
    return (
        <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-bold text-slate-400">{label}</p>
            <div className="mt-2 text-sm font-bold leading-7 text-slate-700">{children}</div>
        </div>
    );
}

export default function LawyerCaseDetailPage({ engagementId }) {
    const router = useRouter();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        getLawyerCase(engagementId)
            .then(setItem)
            .catch((e) => setError(e?.message || 'دریافت جزئیات پرونده انجام نشد.'))
            .finally(() => setLoading(false));
    }, [engagementId]);

    if (loading) {
        return <div dir="rtl" className="p-12 text-center text-slate-500">در حال دریافت پرونده...</div>;
    }

    if (!item) {
        return <div dir="rtl" className="m-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">{error || 'پرونده پیدا نشد.'}</div>;
    }

    return (
        <main dir="rtl" className="min-h-screen bg-[#f6f8f5] px-4 py-8 sm:px-6 lg:px-10">
            <div className="mx-auto max-w-6xl">
                <button
                    type="button"
                    onClick={() => router.push('/lawyer/cases')}
                    className="inline-flex items-center gap-2 text-sm font-bold text-slate-600"
                >
                    <ArrowRight size={17} />
                    پرونده‌های من
                </button>

                <header className="mt-4 rounded-3xl bg-[#173f38] p-6 text-white">
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-[#ead9aa]">
                        {item.stage_label}
                    </span>
                    <h1 className="mt-3 text-2xl font-black">{item.legal_request?.title || 'پرونده حقوقی'}</h1>
                    <div className="mt-4 flex flex-wrap gap-4 text-sm text-white/70">
                        <span className="inline-flex items-center gap-2"><UserRound size={16} /> موکل: {item.client?.full_name || '—'}</span>
                        <span>حق‌الزحمه: {money.format(item.agreement?.proposed_fee_rial || 0)} ریال</span>
                    </div>
                </header>

                <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_330px]">
                    <div className="space-y-5">
                        <section className="rounded-3xl border border-slate-200 bg-white p-5">
                            <div className="flex items-center gap-2">
                                <ShieldCheck size={20} className="text-emerald-700" />
                                <h2 className="font-black text-[#173f38]">خلاصه توافق</h2>
                            </div>
                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                <Info label="مبلغ توافق">{money.format(item.agreement?.proposed_fee_rial || 0)} ریال</Info>
                                <Info label="مدت برآوردشده">{money.format(item.agreement?.estimated_days || 0)} روز</Info>
                            </div>
                            <div className="mt-3">
                                <Info label="دامنه خدمات">
                                    <p className="whitespace-pre-wrap">{item.agreement?.service_scope || '—'}</p>
                                </Info>
                            </div>
                        </section>

                        <section className="rounded-3xl border border-slate-200 bg-white p-5">
                            <h2 className="font-black text-[#173f38]">شرح درخواست موکل</h2>
                            <p className="mt-3 whitespace-pre-wrap text-sm leading-8 text-slate-600">
                                {item.legal_request?.description || 'شرحی ثبت نشده است.'}
                            </p>
                        </section>

                        {item.execution_details?.start_plan ? (
                            <section className="rounded-3xl border border-slate-200 bg-white p-5">
                                <h2 className="font-black text-[#173f38]">برنامه اجرایی</h2>
                                <div className="mt-4 grid gap-3">
                                    <Info label="برنامه شروع و اجرای کار">{item.execution_details.start_plan}</Info>
                                    <Info label="مدارک و اقدامات موردنیاز از موکل">{item.execution_details.client_requirements || '—'}</Info>
                                    {item.execution_details.deliverables ? <Info label="خروجی‌ها">{item.execution_details.deliverables}</Info> : null}
                                </div>
                            </section>
                        ) : null}
                    </div>

                    <aside className="space-y-4">
                        <section className="rounded-3xl border border-slate-200 bg-white p-5">
                            <h2 className="font-black text-[#173f38]">ادامه فرآیند</h2>
                            <p className="mt-2 text-xs leading-6 text-slate-500">
                                تمام مراحل این همکاری از همین پرونده قابل دسترسی است.
                            </p>

                            <button
                                type="button"
                                onClick={() => router.push(`/lawyer/engagement/${encodeURIComponent(item.public_id)}`)}
                                className="mt-4 flex w-full items-center justify-between rounded-xl bg-[#c7a154] px-4 py-3 text-sm font-black text-[#173f38]"
                            >
                                <span className="inline-flex items-center gap-2">
                                    <FileSignature size={17} />
                                    {item.stage === 'pre_contract' ? 'تکمیل و ساخت قرارداد' : 'مشاهده قرارداد و توافق'}
                                </span>
                            </button>

                            {item.negotiation?.public_id ? (
                                <button
                                    type="button"
                                    onClick={() => router.push(`/lawyer/negotiation/${encodeURIComponent(item.negotiation.public_id)}`)}
                                    className="mt-2 flex w-full items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700"
                                >
                                    <MessageCircleMore size={17} />
                                    ادامه گفتگو با موکل
                                </button>
                            ) : null}
                        </section>

                        <section className="rounded-3xl border border-slate-200 bg-white p-5">
                            <h3 className="font-black text-[#173f38]">وضعیت مالی</h3>
                            <div className="mt-4 flex items-start gap-3">
                                <ReceiptText size={19} className="mt-1 text-[#a47b2c]" />
                                <div>
                                    <p className="text-xs text-slate-400">فاکتور</p>
                                    <p className="mt-1 text-sm font-bold text-slate-700">
                                        {item.invoice
                                            ? `${money.format(item.invoice.total_rial || 0)} ریال`
                                            : 'هنوز صادر نشده'}
                                    </p>
                                    {item.invoice ? (
                                        <p className="mt-1 text-xs text-slate-500">
                                            وضعیت: {item.invoice.status === 'paid' ? 'پرداخت‌شده' : 'در انتظار پرداخت'}
                                        </p>
                                    ) : null}
                                </div>
                            </div>
                        </section>
                    </aside>
                </div>
            </div>
        </main>
    );
}
