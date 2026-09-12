'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ArrowRight,
    BadgeCheck,
    Check,
    CircleDollarSign,
    ClipboardCheck,
    Download,
    FileCheck2,
    FilePlus2,
    FileSignature,
    Loader2,
    LockKeyhole,
    MessageCircleMore,
    Paperclip,
    RefreshCw,
    Send,
    ShieldCheck,
    Trash2,
    UploadCloud,
    WalletCards,
    X,
} from 'lucide-react';

import {
    createEngagementDocumentRequest,
    deleteEngagementDocumentRequest,
    downloadDocument,
    getEngagementWorkspace,
    reviewEngagementDocument,
    saveEngagementExecution,
    sendEngagementContract,
    signContract,
    startInvoicePayment,
    uploadEngagementDocument,
} from '@/lib/api/workflow';

const money = new Intl.NumberFormat('fa-IR');

const documentStatus = {
    requested: ['در انتظار ارسال موکل', 'border-amber-200 bg-amber-50 text-amber-700'],
    uploaded: ['ارسال‌شده؛ در انتظار بررسی وکیل', 'border-blue-200 bg-blue-50 text-blue-700'],
    accepted: ['تأییدشده', 'border-emerald-200 bg-emerald-50 text-emerald-700'],
    needs_revision: ['نیاز به ارسال مجدد', 'border-red-200 bg-red-50 text-red-700'],
};

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

function fileSize(bytes) {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function Step({ done, active, label, description }) {
    return (
        <div className="flex min-w-0 items-start gap-3">
            <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
                done
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : active
                      ? 'border-[#c7a154] bg-[#fff8e7] text-[#8b6a25]'
                      : 'border-slate-200 bg-white text-slate-400'
            }`}>
                {done ? <Check size={16} /> : <span className="h-2 w-2 rounded-full bg-current" />}
            </div>
            <div>
                <p className={`text-sm font-black ${active ? 'text-[#173f38]' : 'text-slate-700'}`}>{label}</p>
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
                        مبلغ، دامنه خدمات و مدت از Proposal پذیرفته‌شده آمده و قابل تغییر نیست.
                    </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[11px] font-bold text-emerald-700 shadow-sm">
                    <LockKeyhole size={12} /> قفل‌شده
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
        </section>
    );
}

function DocumentRequestCard({
    item,
    role,
    busy,
    onUpload,
    onReview,
    onDelete,
    onDownload,
}) {
    const [note, setNote] = useState('');
    const [file, setFile] = useState(null);
    const [showRevision, setShowRevision] = useState(false);
    const [label, style] = documentStatus[item.status] || [item.status, 'border-slate-200 bg-slate-50 text-slate-600'];
    const canUpload = role === 'client' && ['requested', 'needs_revision', 'uploaded'].includes(item.status);

    return (
        <article className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-black text-[#173f38]">{item.title}</h3>
                        {item.is_required ? (
                            <span className="rounded-full bg-red-50 px-2 py-1 text-[10px] font-bold text-red-600">الزامی</span>
                        ) : (
                            <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500">اختیاری</span>
                        )}
                    </div>
                    {item.instructions ? (
                        <p className="mt-2 whitespace-pre-wrap text-xs leading-6 text-slate-500">{item.instructions}</p>
                    ) : null}
                </div>
                <span className={`w-fit rounded-full border px-3 py-1 text-[11px] font-bold ${style}`}>{label}</span>
            </div>

            {item.review_note ? (
                <div className="mt-3 rounded-xl border border-red-100 bg-red-50 p-3 text-xs leading-6 text-red-700">
                    <strong>توضیح وکیل:</strong> {item.review_note}
                </div>
            ) : null}

            {item.document ? (
                <div className="mt-3 flex flex-col justify-between gap-3 rounded-xl bg-slate-50 p-3 sm:flex-row sm:items-center">
                    <div className="flex min-w-0 items-center gap-2">
                        <Paperclip size={16} className="shrink-0 text-slate-500" />
                        <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-slate-700">{item.document.file_name || item.document.title}</p>
                            <p className="mt-1 text-[10px] text-slate-400">{fileSize(item.document.size_bytes)}</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => onDownload(item.document.public_id)}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:border-[#7aa99e] hover:text-[#173f38]"
                    >
                        <Download size={14} /> دریافت فایل
                    </button>
                </div>
            ) : null}

            {canUpload && item.status !== 'accepted' ? (
                <div className="mt-3 rounded-xl border border-dashed border-[#b8cec7] bg-[#f8fbfa] p-3">
                    <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="block w-full text-xs text-slate-600 file:ml-3 file:rounded-lg file:border-0 file:bg-[#173f38] file:px-3 file:py-2 file:font-bold file:text-white"
                    />
                    <div className="mt-2 flex items-center justify-between gap-3">
                        <p className="text-[10px] text-slate-400">PDF / JPG / PNG — حداکثر ۵ مگابایت</p>
                        <button
                            type="button"
                            disabled={!file || busy}
                            onClick={() => onUpload(item.public_id, file)}
                            className="inline-flex items-center gap-2 rounded-lg bg-[#173f38] px-3 py-2 text-xs font-bold text-white disabled:opacity-40"
                        >
                            <UploadCloud size={14} />
                            {item.document ? 'ارسال نسخه جدید' : 'ارسال مدرک'}
                        </button>
                    </div>
                </div>
            ) : null}

            {role === 'lawyer' && item.status === 'uploaded' ? (
                <div className="mt-3">
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            disabled={busy}
                            onClick={() => onReview(item.public_id, 'accepted', '')}
                            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
                        >
                            <FileCheck2 size={14} /> تأیید مدرک
                        </button>
                        <button
                            type="button"
                            disabled={busy}
                            onClick={() => setShowRevision((v) => !v)}
                            className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700"
                        >
                            <RefreshCw size={14} /> درخواست ارسال مجدد
                        </button>
                    </div>
                    {showRevision ? (
                        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                            <input
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="دلیل یا توضیح لازم برای ارسال مجدد..."
                                className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-red-300"
                            />
                            <button
                                type="button"
                                disabled={!note.trim() || busy}
                                onClick={() => onReview(item.public_id, 'needs_revision', note)}
                                className="rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-40"
                            >
                                ثبت درخواست
                            </button>
                        </div>
                    ) : null}
                </div>
            ) : null}

            {role === 'lawyer' && item.status === 'requested' && !item.document ? (
                <button
                    type="button"
                    disabled={busy}
                    onClick={() => onDelete(item.public_id)}
                    className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-red-600"
                >
                    <Trash2 size={13} /> حذف این درخواست
                </button>
            ) : null}
        </article>
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
    const [docForm, setDocForm] = useState({
        title: '',
        instructions: '',
        is_required: true,
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

    useEffect(() => { load(); }, [load]);

    const isLawyer = role === 'lawyer';
    const docs = data?.document_requests ?? [];
    const requiredDocs = docs.filter((item) => item.is_required);
    const acceptedRequired = requiredDocs.filter((item) => item.status === 'accepted').length;
    const requiredReady = requiredDocs.length === acceptedRequired;

    const signatures = data?.contract?.signatures ?? [];
    const ownSignature = signatures.find((item) => item.role === role);
    const clientSigned = signatures.some((item) => item.role === 'client' && item.status === 'signed');
    const lawyerSigned = signatures.some((item) => item.role === 'lawyer' && item.status === 'signed');
    const fullySigned = clientSigned && lawyerSigned;
    const invoice = data?.contract?.invoice;
    const paid = invoice?.status === 'paid';
    const paymentPending = invoice?.payments?.some((item) => ['created', 'pending'].includes(item.status));

    const step = useMemo(() => {
        if (paid || data?.status === 'active') return 5;
        if (invoice) return 4;
        if (data?.contract) return 3;
        if (docs.length > 0 || data?.prepared_at) return 2;
        return 1;
    }, [data, docs.length, invoice, paid]);

    function flashError(e, fallback) {
        setError(e?.validationMessages?.[0] || e?.message || fallback);
        setNotice('');
    }

    async function saveDetails() {
        setBusy('save');
        try {
            const result = await saveEngagementExecution(engagementId, form);
            setData(result);
            setNotice('اطلاعات اجرایی ذخیره شد.');
            setError('');
            return true;
        } catch (e) {
            flashError(e, 'ذخیره اطلاعات انجام نشد.');
            return false;
        } finally {
            setBusy('');
        }
    }

    async function addDocumentRequest() {
        if (!docForm.title.trim()) return;
        setBusy('doc-create');
        try {
            await createEngagementDocumentRequest(engagementId, docForm);
            setDocForm({ title: '', instructions: '', is_required: true });
            await load();
            setNotice('مدرک موردنیاز به چک‌لیست موکل اضافه شد.');
        } catch (e) {
            flashError(e, 'ثبت مدرک موردنیاز انجام نشد.');
        } finally {
            setBusy('');
        }
    }

    async function removeDocumentRequest(publicId) {
        setBusy(`delete-${publicId}`);
        try {
            await deleteEngagementDocumentRequest(publicId);
            await load();
        } catch (e) {
            flashError(e, 'حذف درخواست مدرک انجام نشد.');
        } finally {
            setBusy('');
        }
    }

    async function uploadDocument(publicId, file) {
        setBusy(`upload-${publicId}`);
        try {
            await uploadEngagementDocument(publicId, file);
            await load();
            setNotice('فایل با موفقیت برای وکیل ارسال شد.');
        } catch (e) {
            flashError(e, 'ارسال فایل انجام نشد.');
        } finally {
            setBusy('');
        }
    }

    async function reviewDocument(publicId, status, note) {
        setBusy(`review-${publicId}`);
        try {
            await reviewEngagementDocument(publicId, status, note);
            await load();
            setNotice(status === 'accepted' ? 'مدرک تأیید شد.' : 'درخواست ارسال مجدد برای موکل ثبت شد.');
        } catch (e) {
            flashError(e, 'ثبت بررسی مدرک انجام نشد.');
        } finally {
            setBusy('');
        }
    }

    async function handleDownload(publicId) {
        try {
            await downloadDocument(publicId);
        } catch (e) {
            flashError(e, 'دریافت فایل انجام نشد.');
        }
    }

    async function sendContract() {
        setBusy('send');
        try {
            const result = await sendEngagementContract(engagementId);
            setData(result);
            setNotice('قرارداد برای امضای طرفین آماده و ارسال شد.');
            setError('');
        } catch (e) {
            flashError(e, 'ارسال قرارداد انجام نشد.');
        } finally {
            setBusy('');
        }
    }

    async function handleSign() {
        if (!data?.contract?.public_id) return;
        setBusy('sign');
        try {
            await signContract(data.contract.public_id);
            await load();
            setNotice('امضای شما با موفقیت ثبت شد.');
        } catch (e) {
            flashError(e, 'ثبت امضا انجام نشد.');
        } finally {
            setBusy('');
        }
    }

    async function handlePayment() {
        if (!invoice?.public_id) return;
        setBusy('pay');
        try {
            await startInvoicePayment(invoice.public_id);
            await load();
            setNotice('درخواست پرداخت ایجاد شد. اتصال نهایی درگاه بانکی هنوز در پروژه فعال نشده است.');
        } catch (e) {
            flashError(e, 'ایجاد درخواست پرداخت انجام نشد.');
        } finally {
            setBusy('');
        }
    }

    if (loading) {
        return <div dir="rtl" className="flex min-h-[55vh] items-center justify-center"><Loader2 className="animate-spin text-[#173f38]" /></div>;
    }

    if (!data) {
        return <div dir="rtl" className="mx-auto mt-10 max-w-3xl rounded-2xl border bg-white p-6 text-sm text-red-600">{error || 'توافق پیدا نشد.'}</div>;
    }

    return (
        <main dir="rtl" className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <button type="button" onClick={() => window.history.back()} className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-[#173f38]">
                    <ArrowRight size={17} /> بازگشت
                </button>
                {data.negotiation?.public_id ? (
                    <button
                        type="button"
                        onClick={() => window.location.href = `/${role}/negotiation/${data.negotiation.public_id}`}
                        className="inline-flex items-center gap-2 rounded-xl border border-[#c7d8d2] bg-white px-4 py-2.5 text-xs font-black text-[#173f38] transition hover:-translate-y-0.5 hover:border-[#76a397] hover:bg-[#f3f9f6] hover:shadow-sm"
                    >
                        <MessageCircleMore size={16} /> ادامه گفتگو
                    </button>
                ) : null}
            </div>

            <header className="rounded-3xl bg-[#173f38] p-6 text-white shadow-sm">
                <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
                    <div>
                        <div className="flex items-center gap-2 text-[#e7cf97]">
                            <BadgeCheck size={18} />
                            <span className="text-xs font-bold">توافق ثبت‌شده و معتبر</span>
                        </div>
                        <h1 className="mt-2 text-2xl font-black">
                            {isLawyer ? 'مدیریت همکاری با موکل' : 'همکاری و قرارداد با وکیل'}
                        </h1>
                        <p className="mt-2 text-sm text-white/70">{data.legal_request?.title || 'درخواست حقوقی'}</p>
                    </div>
                    <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm">
                        <p className="text-white/60">مهلت قرارداد و پرداخت</p>
                        <p className="mt-1 font-black">{formatDate(data.contract_due_at)}</p>
                    </div>
                </div>
            </header>

            <section className="mt-5 grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 md:grid-cols-5">
                <Step done={step > 1} active={step === 1} label="اطلاعات اجرایی" description={isLawyer ? 'تنظیم مسیر همکاری' : 'آماده‌سازی توسط وکیل'} />
                <Step done={step > 2} active={step === 2} label="مدارک" description={requiredDocs.length ? `${money.format(acceptedRequired)} از ${money.format(requiredDocs.length)} تأیید` : 'بدون مدرک الزامی'} />
                <Step done={step > 3} active={step === 3} label="قرارداد و امضا" description="بررسی و امضای طرفین" />
                <Step done={step > 4} active={step === 4} label="پرداخت" description="پرداخت حق‌الزحمه" />
                <Step done={step >= 5} active={step === 5} label="پرونده فعال" description="شروع ارائه خدمت" />
            </section>

            {error ? <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div> : null}
            {notice ? <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">{notice}</div> : null}

            <div className="mt-5 space-y-5">
                <AgreementCard data={data} />

                {isLawyer && !data.contract ? (
                    <section className="rounded-3xl border border-slate-200 bg-white p-5">
                        <div className="flex items-start gap-3">
                            <div className="rounded-xl bg-[#f5efe2] p-2 text-[#8b6a25]"><ClipboardCheck size={20} /></div>
                            <div>
                                <h2 className="font-black text-[#173f38]">اطلاعات اجرایی همکاری</h2>
                                <p className="mt-1 text-xs leading-6 text-slate-500">
                                    اقدامات کلی را اینجا بنویسید؛ فایل‌های مشخص را پایین‌تر به‌صورت چک‌لیست از موکل درخواست کنید.
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 grid gap-4 md:grid-cols-2">
                            <label>
                                <span className="mb-2 block text-xs font-bold text-slate-600">برنامه شروع و اجرای کار *</span>
                                <textarea value={form.start_plan} onChange={(e) => setForm((p) => ({ ...p, start_plan: e.target.value }))} rows={4} className="w-full rounded-2xl border border-slate-200 p-3 text-sm outline-none focus:border-[#c7a154]" />
                            </label>
                            <label>
                                <span className="mb-2 block text-xs font-bold text-slate-600">اقدامات کلی موردنیاز از موکل *</span>
                                <textarea value={form.client_requirements} onChange={(e) => setForm((p) => ({ ...p, client_requirements: e.target.value }))} rows={4} className="w-full rounded-2xl border border-slate-200 p-3 text-sm outline-none focus:border-[#c7a154]" placeholder="مثلاً حضور در جلسه، اعلام اطلاعات تکمیلی و..." />
                            </label>
                            <label>
                                <span className="mb-2 block text-xs font-bold text-slate-600">خروجی‌ها و تحویل‌دادنی‌ها</span>
                                <textarea value={form.deliverables} onChange={(e) => setForm((p) => ({ ...p, deliverables: e.target.value }))} rows={3} className="w-full rounded-2xl border border-slate-200 p-3 text-sm outline-none focus:border-[#c7a154]" />
                            </label>
                            <label>
                                <span className="mb-2 block text-xs font-bold text-slate-600">توضیحات اجرایی تکمیلی</span>
                                <textarea value={form.execution_notes} onChange={(e) => setForm((p) => ({ ...p, execution_notes: e.target.value }))} rows={3} className="w-full rounded-2xl border border-slate-200 p-3 text-sm outline-none focus:border-[#c7a154]" />
                            </label>
                        </div>
                        <button type="button" disabled={Boolean(busy)} onClick={saveDetails} className="mt-4 rounded-xl border border-[#173f38] px-4 py-2.5 text-sm font-black text-[#173f38] hover:bg-[#f3f8f6] disabled:opacity-50">
                            {busy === 'save' ? 'در حال ذخیره...' : 'ذخیره اطلاعات اجرایی'}
                        </button>
                    </section>
                ) : null}

                {!isLawyer && data.execution_details?.start_plan ? (
                    <section className="rounded-3xl border border-slate-200 bg-white p-5">
                        <h2 className="font-black text-[#173f38]">برنامه همکاری اعلام‌شده توسط وکیل</h2>
                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                            <div className="rounded-2xl bg-slate-50 p-4">
                                <p className="text-xs font-bold text-slate-400">برنامه شروع کار</p>
                                <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">{data.execution_details.start_plan}</p>
                            </div>
                            <div className="rounded-2xl bg-slate-50 p-4">
                                <p className="text-xs font-bold text-slate-400">اقدامات موردنیاز از شما</p>
                                <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">{data.execution_details.client_requirements}</p>
                            </div>
                        </div>
                    </section>
                ) : null}

                <section className="rounded-3xl border border-slate-200 bg-[#fbfdfc] p-5">
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                        <div>
                            <div className="flex items-center gap-2 text-[#173f38]">
                                <Paperclip size={20} />
                                <h2 className="font-black">مدارک موردنیاز</h2>
                            </div>
                            <p className="mt-2 text-xs leading-6 text-slate-500">
                                {isLawyer
                                    ? 'هر مدرک را جدا درخواست کنید تا موکل همان‌جا فایل را ارسال کند و وضعیت بررسی مشخص باشد.'
                                    : 'فایل را دقیقاً مقابل مدرک خواسته‌شده ارسال کنید. وکیل بعد از بررسی آن را تأیید می‌کند یا توضیح ارسال مجدد می‌دهد.'}
                            </p>
                        </div>
                        {requiredDocs.length > 0 ? (
                            <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${requiredReady ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                {requiredReady ? 'همه مدارک الزامی تأیید شده' : `${money.format(acceptedRequired)} از ${money.format(requiredDocs.length)} مدرک الزامی تأیید`}
                            </span>
                        ) : null}
                    </div>

                    {isLawyer && !data.contract ? (
                        <div className="mt-5 rounded-2xl border border-dashed border-[#cbdad5] bg-white p-4">
                            <div className="grid gap-3 md:grid-cols-[1fr_1.5fr_auto]">
                                <input
                                    value={docForm.title}
                                    onChange={(e) => setDocForm((p) => ({ ...p, title: e.target.value }))}
                                    placeholder="نام مدرک، مثلاً تصویر کارت ملی"
                                    className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#c7a154]"
                                />
                                <input
                                    value={docForm.instructions}
                                    onChange={(e) => setDocForm((p) => ({ ...p, instructions: e.target.value }))}
                                    placeholder="توضیح کوتاه برای موکل (اختیاری)"
                                    className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#c7a154]"
                                />
                                <button
                                    type="button"
                                    disabled={!docForm.title.trim() || Boolean(busy)}
                                    onClick={addDocumentRequest}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#173f38] px-4 py-2.5 text-xs font-black text-white disabled:opacity-40"
                                >
                                    <FilePlus2 size={15} /> افزودن
                                </button>
                            </div>
                            <label className="mt-3 inline-flex cursor-pointer items-center gap-2 text-xs font-bold text-slate-600">
                                <input type="checkbox" checked={docForm.is_required} onChange={(e) => setDocForm((p) => ({ ...p, is_required: e.target.checked }))} />
                                این مدرک برای ارسال قرارداد الزامی باشد
                            </label>
                        </div>
                    ) : null}

                    <div className="mt-4 grid gap-3">
                        {docs.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-400">
                                {isLawyer ? 'هنوز مدرکی از موکل درخواست نکرده‌اید.' : 'وکیل هنوز مدرک مشخصی از شما درخواست نکرده است.'}
                            </div>
                        ) : docs.map((item) => (
                            <DocumentRequestCard
                                key={item.public_id}
                                item={item}
                                role={role}
                                busy={Boolean(busy)}
                                onUpload={uploadDocument}
                                onReview={reviewDocument}
                                onDelete={removeDocumentRequest}
                                onDownload={handleDownload}
                            />
                        ))}
                    </div>
                </section>

                {!data.contract && isLawyer ? (
                    <section className="rounded-3xl border border-[#ead9aa] bg-[#fffaf0] p-5">
                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                            <div>
                                <h2 className="font-black text-[#173f38]">آماده ارسال قرارداد؟</h2>
                                <p className="mt-1 text-xs leading-6 text-slate-600">
                                    قبل از ارسال، اطلاعات اجرایی را ذخیره کنید و تمام مدارک الزامی باید توسط شما تأیید شده باشند.
                                </p>
                            </div>
                            <button
                                type="button"
                                disabled={Boolean(busy) || !requiredReady}
                                onClick={async () => {
                                    const saved = await saveDetails();
                                    if (saved) await sendContract();
                                }}
                                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#c7a154] px-5 py-3 text-sm font-black text-[#173f38] transition hover:bg-[#d4b56f] disabled:cursor-not-allowed disabled:opacity-45"
                            >
                                <Send size={17} /> آماده‌سازی و ارسال قرارداد
                            </button>
                        </div>
                    </section>
                ) : null}

                {!isLawyer && !data.contract ? (
                    <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
                        <h2 className="font-black text-amber-900">
                            {docs.some((item) => ['requested', 'needs_revision'].includes(item.status))
                                ? 'مدارک درخواستی را تکمیل کنید'
                                : 'در انتظار تنظیم قرارداد توسط وکیل'}
                        </h2>
                        <p className="mt-2 text-sm leading-7 text-amber-800">
                            {docs.some((item) => ['requested', 'needs_revision'].includes(item.status))
                                ? 'بعد از ارسال مدارک و تأیید آن‌ها توسط وکیل، قرارداد برای امضا در همین صفحه ظاهر می‌شود.'
                                : 'پس از آماده‌شدن قرارداد، متن آن را همین‌جا بررسی و امضا می‌کنید.'}
                        </p>
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
                                <p className="mt-1 text-xs text-slate-500">نسخه {money.format(data.contract.current_version || 1)} • {formatDate(data.contract.issued_at)}</p>
                            </div>
                            <span className={`rounded-full px-3 py-1 text-xs font-bold ${fullySigned ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                {fullySigned ? 'امضای دو طرف کامل است' : 'در انتظار تکمیل امضا'}
                            </span>
                        </div>

                        <div className="mt-5 max-h-[440px] overflow-y-auto whitespace-pre-wrap rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-8 text-slate-700">
                            {data.contract.terms_text || 'متن قرارداد در دسترس نیست.'}
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            <div className={`rounded-2xl border p-4 ${clientSigned ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200'}`}>
                                <p className="text-xs text-slate-500">امضای موکل</p>
                                <p className="mt-1 font-black text-slate-800">{clientSigned ? 'امضا شده' : 'در انتظار امضا'}</p>
                            </div>
                            <div className={`rounded-2xl border p-4 ${lawyerSigned ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200'}`}>
                                <p className="text-xs text-slate-500">امضای وکیل</p>
                                <p className="mt-1 font-black text-slate-800">{lawyerSigned ? 'امضا شده' : 'در انتظار امضا'}</p>
                            </div>
                        </div>

                        {ownSignature?.status !== 'signed' && data.contract.status === 'signing' ? (
                            <button type="button" disabled={Boolean(busy)} onClick={handleSign} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#173f38] px-5 py-3 text-sm font-black text-white disabled:opacity-50">
                                <FileSignature size={17} /> {busy === 'sign' ? 'در حال ثبت...' : 'قرارداد را مطالعه کردم و امضا می‌کنم'}
                            </button>
                        ) : null}
                    </section>
                ) : null}

                {invoice ? (
                    <section className="rounded-3xl border border-[#ead9aa] bg-[#fffaf0] p-5">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-[#c7a154]/20 p-2 text-[#8b6a25]"><WalletCards size={22} /></div>
                            <div>
                                <h2 className="font-black text-[#173f38]">مرحله پرداخت</h2>
                                <p className="mt-1 text-xs text-slate-600">پس از امضای کامل قرارداد، فاکتور صادر می‌شود.</p>
                            </div>
                        </div>
                        <div className="mt-4 flex items-end justify-between rounded-2xl bg-white p-4">
                            <div>
                                <p className="text-xs text-slate-500">مبلغ قابل پرداخت</p>
                                <p className="mt-1 text-xl font-black text-[#173f38]">{money.format(invoice.total_rial || 0)} ریال</p>
                            </div>
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                                {invoice.status === 'paid' ? 'پرداخت‌شده' : 'در انتظار پرداخت'}
                            </span>
                        </div>
                        {!isLawyer && invoice.status !== 'paid' ? (
                            <button type="button" disabled={Boolean(busy) || paymentPending} onClick={handlePayment} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#c7a154] px-5 py-3 text-sm font-black text-[#173f38] disabled:opacity-50">
                                <CircleDollarSign size={18} />
                                {paymentPending ? 'درخواست پرداخت ایجاد شده' : busy === 'pay' ? 'در حال آماده‌سازی...' : 'ادامه به پرداخت'}
                            </button>
                        ) : null}
                    </section>
                ) : null}
            </div>
        </main>
    );
}
