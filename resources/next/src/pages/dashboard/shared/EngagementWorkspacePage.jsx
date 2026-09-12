'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ArrowRight,
    BadgeCheck,
    Check,
    CircleDollarSign,
    ClipboardCheck,
    FileSignature,
    Loader2,
    LockKeyhole,
    Send,
    ShieldCheck,
    UserRound,
    WalletCards,
} from 'lucide-react';

import {
    getEngagementWorkspace,
    saveEngagementExecution,
    sendEngagementContract,
    signContract,
    startInvoicePayment,
} from '@/lib/api/workflow';

const money = new Intl.NumberFormat('fa-IR');

function formatDate(value) {
    if (!value) return '—';
    try {
        return new Intl.DateTimeFormat('fa-IR', {
            dateStyle: 'medium',
            timeStyle: 'short',
        }).format(new Date(value));
    } catch {
        return '—';
    }
}

function Step({ done, active, label, description }) {
    return (
        <div className="flex min-w-0 items-start gap-3">
            <div
                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
                    done
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : active
                          ? 'border-[#c7a154] bg-[#fff8e7] text-[#8b6a25]'
                          : 'border-slate-200 bg-white text-slate-400'
                }`}
            >
                {done ? <Check size={16} /> : <span className="h-2 w-2 rounded-full bg-current" />}
            </div>
            <div className="min-w-0">
                <p className={`text-sm font-black ${active ? 'text-[#173f38]' : 'text-slate-700'}`}>
                    {label}
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
            </div>
        </div>
    );
}

function AgreementCard({ data }) {
    const agreement = data?.agreement ?? {};
    return (
        <section className="rounded-3xl border border-emerald-200 bg-emerald-50/50 p-5">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-emerald-800">
                        <ShieldCheck size={20} />
                        <h2 className="font-black">شرایط توافق‌شده</h2>
                    </div>
                    <p className="mt-2 text-xs leading-6 text-emerald-700">
                        این بخش از Proposal پذیرفته‌شده آمده و در مرحله قرارداد قابل تغییر نیست.
                    </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[11px] font-bold text-emerald-700 shadow-sm">
                    <LockKeyhole size={12} />
                    قفل‌شده
                </span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white p-4">
                    <p className="text-xs text-slate-500">حق‌الزحمه</p>
                    <p className="mt-1 text-lg font-black text-[#173f38]">
                        {money.format(agreement.proposed_fee_rial || 0)} ریال
                    </p>
                </div>
                <div className="rounded-2xl bg-white p-4">
                    <p className="text-xs text-slate-500">مدت برآوردشده</p>
                    <p className="mt-1 text-lg font-black text-[#173f38]">
                        {money.format(agreement.estimated_days || 0)} روز
                    </p>
                </div>
            </div>

            <div className="mt-3 rounded-2xl bg-white p-4">
                <p className="text-xs font-bold text-slate-500">دامنه خدمات</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                    {agreement.service_scope || '—'}
                </p>
            </div>

            {agreement.summary ? (
                <div className="mt-3 rounded-2xl bg-white p-4">
                    <p className="text-xs font-bold text-slate-500">خلاصه پیشنهاد</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                        {agreement.summary}
                    </p>
                </div>
            ) : null}
        </section>
    );
}

export default function EngagementWorkspacePage({ engagementId, role }) {
    const [data, setData] = useState(null);
    const [form, setForm] = useState({
        start_plan: '',
        client_requirements: '',
        deliverables: '',
        execution_notes: '',
    });
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState('');
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');

    const load = useCallback(async () => {
        try {
            const result = await getEngagementWorkspace(engagementId);
            setData(result);
            setForm({
                start_plan: result?.execution_details?.start_plan ?? '',
                client_requirements: result?.execution_details?.client_requirements ?? '',
                deliverables: result?.execution_details?.deliverables ?? '',
                execution_notes: result?.execution_details?.execution_notes ?? '',
            });
            setError('');
        } catch (e) {
            setError(e?.message || 'خطا در دریافت اطلاعات توافق');
        } finally {
            setLoading(false);
        }
    }, [engagementId]);

    useEffect(() => {
        load();
    }, [load]);

    const signatures = data?.contract?.signatures ?? [];
    const ownSignature = signatures.find((item) => item.role === role);
    const clientSigned = signatures.some((item) => item.role === 'client' && item.status === 'signed');
    const lawyerSigned = signatures.some((item) => item.role === 'lawyer' && item.status === 'signed');
    const fullySigned = clientSigned && lawyerSigned;
    const invoice = data?.contract?.invoice;
    const paid = invoice?.status === 'paid';
    const paymentPending = invoice?.payments?.some((item) => ['created', 'pending'].includes(item.status));

    const step = useMemo(() => {
        if (paid || data?.status === 'active') return 4;
        if (invoice) return 3;
        if (data?.contract) return 2;
        return 1;
    }, [data, invoice, paid]);

    async function saveDetails() {
        setBusy('save');
        setError('');
        setNotice('');
        try {
            const result = await saveEngagementExecution(engagementId, form);
            setData(result);
            setNotice('اطلاعات اجرایی ذخیره شد.');
        } catch (e) {
            setError(e?.validationMessages?.[0] || e?.message || 'ذخیره اطلاعات انجام نشد.');
        } finally {
            setBusy('');
        }
    }

    async function sendContract() {
        setBusy('send');
        setError('');
        setNotice('');
        try {
            const result = await sendEngagementContract(engagementId);
            setData(result);
            setNotice('قرارداد برای امضای طرفین آماده و ارسال شد.');
        } catch (e) {
            setError(e?.validationMessages?.[0] || e?.message || 'ارسال قرارداد انجام نشد.');
        } finally {
            setBusy('');
        }
    }

    async function handleSign() {
        if (!data?.contract?.public_id) return;
        setBusy('sign');
        setError('');
        setNotice('');
        try {
            await signContract(data.contract.public_id);
            await load();
            setNotice('امضای شما با موفقیت ثبت شد.');
        } catch (e) {
            setError(e?.message || 'ثبت امضا انجام نشد.');
        } finally {
            setBusy('');
        }
    }

    async function handlePayment() {
        if (!invoice?.public_id) return;
        setBusy('pay');
        setError('');
        setNotice('');
        try {
            await startInvoicePayment(invoice.public_id);
            await load();
            setNotice(
                'درخواست پرداخت ایجاد شد. درگاه بانکی در مرحله اتصال به ارائه‌دهنده پرداخت قرار دارد.',
            );
        } catch (e) {
            setError(e?.message || 'ایجاد درخواست پرداخت انجام نشد.');
        } finally {
            setBusy('');
        }
    }

    if (loading) {
        return (
            <div dir="rtl" className="flex min-h-[55vh] items-center justify-center">
                <Loader2 className="animate-spin text-[#173f38]" />
            </div>
        );
    }

    if (!data) {
        return (
            <div dir="rtl" className="mx-auto mt-10 max-w-3xl rounded-2xl border bg-white p-6 text-sm text-red-600">
                {error || 'توافق پیدا نشد.'}
            </div>
        );
    }

    const isLawyer = role === 'lawyer';

    return (
        <main dir="rtl" className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
            <button
                type="button"
                onClick={() => window.history.back()}
                className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-[#173f38]"
            >
                <ArrowRight size={17} />
                بازگشت
            </button>

            <header className="rounded-3xl bg-[#173f38] p-6 text-white shadow-sm">
                <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
                    <div>
                        <div className="flex items-center gap-2 text-[#e7cf97]">
                            <BadgeCheck size={18} />
                            <span className="text-xs font-bold">
                                توافق ثبت‌شده و معتبر
                            </span>
                        </div>
                        <h1 className="mt-2 text-2xl font-black">
                            {isLawyer ? 'توافق و قرارداد موکل' : 'توافق و قرارداد با وکیل'}
                        </h1>
                        <p className="mt-2 text-sm text-white/70">
                            {data.legal_request?.title || 'درخواست حقوقی'}
                        </p>
                    </div>
                    <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm">
                        <p className="text-white/60">مهلت قرارداد و پرداخت</p>
                        <p className="mt-1 font-black">{formatDate(data.contract_due_at)}</p>
                    </div>
                </div>
            </header>

            <section className="mt-5 grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 md:grid-cols-4">
                <Step done={step > 1} active={step === 1} label="تکمیل توافق" description={isLawyer ? 'جزئیات اجرایی توسط وکیل' : 'در انتظار آماده‌سازی وکیل'} />
                <Step done={step > 2} active={step === 2} label="امضای قرارداد" description="بررسی و امضای هر دو طرف" />
                <Step done={step > 3} active={step === 3} label="پرداخت" description="صدور فاکتور پس از امضاها" />
                <Step done={step >= 4} active={step === 4} label="شروع پرونده" description="فعال شدن همکاری حقوقی" />
            </section>

            {error ? (
                <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
                    {error}
                </div>
            ) : null}
            {notice ? (
                <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">
                    {notice}
                </div>
            ) : null}

            <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_360px]">
                <div className="space-y-5">
                    <AgreementCard data={data} />

                    {isLawyer && !data.contract ? (
                        <section className="rounded-3xl border border-slate-200 bg-white p-5">
                            <div className="flex items-start gap-3">
                                <div className="rounded-xl bg-[#f5efe2] p-2 text-[#8b6a25]">
                                    <ClipboardCheck size={20} />
                                </div>
                                <div>
                                    <h2 className="font-black text-[#173f38]">
                                        تکمیل اطلاعات اجرایی
                                    </h2>
                                    <p className="mt-1 text-xs leading-6 text-slate-500">
                                        این اطلاعات وارد متن قرارداد می‌شوند، اما شرایط مالی و دامنه خدمات توافق‌شده را تغییر نمی‌دهند.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 grid gap-4">
                                <label>
                                    <span className="mb-2 block text-xs font-bold text-slate-600">
                                        برنامه شروع و اجرای کار *
                                    </span>
                                    <textarea
                                        value={form.start_plan}
                                        onChange={(e) => setForm((p) => ({ ...p, start_plan: e.target.value }))}
                                        rows={4}
                                        className="w-full rounded-2xl border border-slate-200 p-3 text-sm outline-none focus:border-[#c7a154]"
                                        placeholder="مثلاً بررسی مدارک در روز اول، تنظیم لایحه و پیگیری مرحله بعد..."
                                    />
                                </label>
                                <label>
                                    <span className="mb-2 block text-xs font-bold text-slate-600">
                                        مدارک و اقدامات موردنیاز از موکل *
                                    </span>
                                    <textarea
                                        value={form.client_requirements}
                                        onChange={(e) => setForm((p) => ({ ...p, client_requirements: e.target.value }))}
                                        rows={4}
                                        className="w-full rounded-2xl border border-slate-200 p-3 text-sm outline-none focus:border-[#c7a154]"
                                        placeholder="مدارک، مستندات یا اقداماتی که موکل باید انجام دهد..."
                                    />
                                </label>
                                <label>
                                    <span className="mb-2 block text-xs font-bold text-slate-600">
                                        خروجی‌ها و تحویل‌دادنی‌ها
                                    </span>
                                    <textarea
                                        value={form.deliverables}
                                        onChange={(e) => setForm((p) => ({ ...p, deliverables: e.target.value }))}
                                        rows={3}
                                        className="w-full rounded-2xl border border-slate-200 p-3 text-sm outline-none focus:border-[#c7a154]"
                                        placeholder="مثلاً تنظیم لایحه، بررسی قرارداد، حضور در جلسه..."
                                    />
                                </label>
                                <label>
                                    <span className="mb-2 block text-xs font-bold text-slate-600">
                                        توضیحات اجرایی تکمیلی
                                    </span>
                                    <textarea
                                        value={form.execution_notes}
                                        onChange={(e) => setForm((p) => ({ ...p, execution_notes: e.target.value }))}
                                        rows={3}
                                        className="w-full rounded-2xl border border-slate-200 p-3 text-sm outline-none focus:border-[#c7a154]"
                                    />
                                </label>
                            </div>

                            <div className="mt-5 flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    disabled={Boolean(busy)}
                                    onClick={saveDetails}
                                    className="rounded-xl border border-[#173f38] px-4 py-2.5 text-sm font-black text-[#173f38] disabled:opacity-50"
                                >
                                    {busy === 'save' ? 'در حال ذخیره...' : 'ذخیره اطلاعات'}
                                </button>
                                <button
                                    type="button"
                                    disabled={Boolean(busy)}
                                    onClick={async () => {
                                        await saveDetails();
                                        if (!error) await sendContract();
                                    }}
                                    className="inline-flex items-center gap-2 rounded-xl bg-[#c7a154] px-5 py-2.5 text-sm font-black text-[#173f38] disabled:opacity-50"
                                >
                                    <Send size={16} />
                                    آماده‌سازی و ارسال قرارداد
                                </button>
                            </div>
                        </section>
                    ) : null}

                    {!isLawyer && !data.contract ? (
                        <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
                            <div className="flex gap-3">
                                <FileSignature className="shrink-0 text-amber-700" />
                                <div>
                                    <h2 className="font-black text-amber-900">
                                        در انتظار تنظیم قرارداد توسط وکیل
                                    </h2>
                                    <p className="mt-2 text-sm leading-7 text-amber-800">
                                        توافق شما ثبت شده است. پس از تکمیل جزئیات اجرایی و ارسال قرارداد توسط وکیل، همین‌جا می‌توانید متن قرارداد را بررسی و امضا کنید.
                                    </p>
                                </div>
                            </div>
                        </section>
                    ) : null}

                    {data.contract ? (
                        <section className="rounded-3xl border border-slate-200 bg-white p-5">
                            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <FileSignature size={20} className="text-[#8b6a25]" />
                                        <h2 className="font-black text-[#173f38]">قرارداد</h2>
                                    </div>
                                    <p className="mt-1 text-xs text-slate-500">
                                        نسخه {money.format(data.contract.current_version || 1)} • صادرشده {formatDate(data.contract.issued_at)}
                                    </p>
                                </div>
                                <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                                    fullySigned
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : 'bg-amber-100 text-amber-700'
                                }`}>
                                    {fullySigned ? 'امضای دو طرف کامل است' : 'در انتظار امضا'}
                                </span>
                            </div>

                            <div className="mt-5 max-h-[440px] overflow-y-auto whitespace-pre-wrap rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-8 text-slate-700">
                                {data.contract.terms_text || 'متن قرارداد در دسترس نیست.'}
                            </div>

                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                <div className={`rounded-2xl border p-4 ${clientSigned ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200'}`}>
                                    <p className="text-xs text-slate-500">امضای موکل</p>
                                    <p className="mt-1 font-black text-slate-800">
                                        {clientSigned ? 'امضا شده' : 'در انتظار امضا'}
                                    </p>
                                </div>
                                <div className={`rounded-2xl border p-4 ${lawyerSigned ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200'}`}>
                                    <p className="text-xs text-slate-500">امضای وکیل</p>
                                    <p className="mt-1 font-black text-slate-800">
                                        {lawyerSigned ? 'امضا شده' : 'در انتظار امضا'}
                                    </p>
                                </div>
                            </div>

                            {ownSignature?.status !== 'signed' && data.contract.status === 'signing' ? (
                                <button
                                    type="button"
                                    disabled={Boolean(busy)}
                                    onClick={handleSign}
                                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#173f38] px-5 py-3 text-sm font-black text-white disabled:opacity-50"
                                >
                                    <FileSignature size={17} />
                                    {busy === 'sign' ? 'در حال ثبت...' : 'مطالعه کردم و قرارداد را امضا می‌کنم'}
                                </button>
                            ) : null}
                        </section>
                    ) : null}

                    {invoice ? (
                        <section className="rounded-3xl border border-[#ead9aa] bg-[#fffaf0] p-5">
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-[#c7a154]/20 p-2 text-[#8b6a25]">
                                    <WalletCards size={22} />
                                </div>
                                <div>
                                    <h2 className="font-black text-[#173f38]">مرحله پرداخت</h2>
                                    <p className="mt-1 text-xs text-slate-600">
                                        فاکتور پس از تکمیل امضای دو طرف صادر شده است.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 flex items-end justify-between rounded-2xl bg-white p-4">
                                <div>
                                    <p className="text-xs text-slate-500">مبلغ قابل پرداخت</p>
                                    <p className="mt-1 text-xl font-black text-[#173f38]">
                                        {money.format(invoice.total_rial || 0)} ریال
                                    </p>
                                </div>
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                                    {invoice.status === 'paid' ? 'پرداخت‌شده' : 'در انتظار پرداخت'}
                                </span>
                            </div>

                            {!isLawyer && invoice.status !== 'paid' ? (
                                <button
                                    type="button"
                                    disabled={Boolean(busy) || paymentPending}
                                    onClick={handlePayment}
                                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#c7a154] px-5 py-3 text-sm font-black text-[#173f38] disabled:opacity-50"
                                >
                                    <CircleDollarSign size={18} />
                                    {paymentPending
                                        ? 'درخواست پرداخت ایجاد شده'
                                        : busy === 'pay'
                                          ? 'در حال آماده‌سازی...'
                                          : 'ادامه به پرداخت'}
                                </button>
                            ) : null}
                        </section>
                    ) : null}
                </div>

                <aside className="space-y-4">
                    <section className="rounded-3xl border border-slate-200 bg-white p-5">
                        <p className="text-xs font-bold text-slate-500">طرفین همکاری</p>
                        <div className="mt-4 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-slate-100 p-2"><UserRound size={18} /></div>
                                <div>
                                    <p className="text-[11px] text-slate-500">موکل</p>
                                    <p className="text-sm font-black text-slate-800">{data.client?.full_name || '—'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-emerald-50 p-2 text-emerald-700"><BadgeCheck size={18} /></div>
                                <div>
                                    <p className="text-[11px] text-slate-500">وکیل منتخب</p>
                                    <p className="text-sm font-black text-slate-800">{data.lawyer?.full_name || '—'}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {data.execution_details?.start_plan ? (
                        <section className="rounded-3xl border border-slate-200 bg-white p-5">
                            <h3 className="font-black text-[#173f38]">جزئیات اجرایی</h3>
                            <div className="mt-4 space-y-4 text-sm leading-7 text-slate-700">
                                <div>
                                    <p className="text-xs font-bold text-slate-500">برنامه شروع کار</p>
                                    <p className="mt-1 whitespace-pre-wrap">{data.execution_details.start_plan}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500">نیازمندی‌های موکل</p>
                                    <p className="mt-1 whitespace-pre-wrap">{data.execution_details.client_requirements}</p>
                                </div>
                                {data.execution_details.deliverables ? (
                                    <div>
                                        <p className="text-xs font-bold text-slate-500">خروجی‌ها</p>
                                        <p className="mt-1 whitespace-pre-wrap">{data.execution_details.deliverables}</p>
                                    </div>
                                ) : null}
                            </div>
                        </section>
                    ) : null}
                </aside>
            </div>
        </main>
    );
}
