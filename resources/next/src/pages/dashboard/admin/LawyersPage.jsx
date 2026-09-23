'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { BadgeCheck, MapPin, Star } from 'lucide-react';

import { getAdminLawyers, reviewAdminLawyer } from '@/lib/api/admin';
import AdminSearchBox from '@/features/admin/shared/AdminSearchBox';
import AdminSearchSelect from '@/features/admin/shared/AdminSearchSelect';
import { statusLabel } from '@/features/admin/shared/adminFormat';

const statusOptions = [
    { value: 'pending', label: 'در انتظار بررسی' },
    { value: 'approved', label: 'تأییدشده' },
    { value: 'rejected', label: 'ردشده' },
];

export default function LawyersPage() {
    const [items, setItems] = useState([]);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [notes, setNotes] = useState({});
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        try {
            setItems(await getAdminLawyers({ search, status }));
        } catch (error) {
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    }, [search, status]);

    useEffect(() => {
        const timer = window.setTimeout(load, 300);
        return () => window.clearTimeout(timer);
    }, [load]);

    const review = async (lawyer, nextStatus) => {
        if (!lawyer.verification?.id) {
            setMessage('برای این وکیل رکورد احراز هویت قابل بررسی وجود ندارد.');
            return;
        }

        const note = String(notes[lawyer.id] || '').trim();
        if (nextStatus === 'rejected' && !note) {
            setMessage('برای رد وکیل، دلیل الزامی است.');
            return;
        }

        setBusy(lawyer.id);
        try {
            await reviewAdminLawyer(lawyer.verification.id, nextStatus, note);
            setMessage(nextStatus === 'approved'
                ? 'وکیل تأیید شد و اعلان برای او ارسال شد.'
                : 'وکیل رد شد و دلیل برای او ارسال شد.');
            await load();
        } catch (error) {
            setMessage(error.message);
        } finally {
            setBusy('');
        }
    };

    return (
        <div dir="rtl" className="mx-auto w-full max-w-[1500px] px-5 py-7">
            <div className="flex items-start gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#174c42] text-[#e1c477]">
                    <BadgeCheck size={23} />
                </span>
                <div>
                    <h1 className="text-3xl font-black text-[#10382f]">بررسی وکلا</h1>
                    <p className="mt-2 text-sm text-[#788883]">
                        مشاهده پروفایل واقعی وکیل، سابقه احراز و تصمیم مدیریتی.
                    </p>
                </div>
            </div>

            <div className="mt-6 grid gap-3 lg:grid-cols-[minmax(320px,1fr)_260px]">
                <AdminSearchBox
                    value={search}
                    onChange={setSearch}
                    placeholder="جستجو با نام، موبایل، پروانه، تخصص یا شهر..."
                />
                <AdminSearchSelect
                    value={status}
                    onChange={setStatus}
                    options={statusOptions}
                    allLabel="همه وضعیت‌ها"
                    searchPlaceholder="جستجوی وضعیت..."
                />
            </div>

            {message ? (
                <div className="mt-4 rounded-2xl border border-[#dbe6e1] bg-white px-4 py-3 text-sm font-bold text-[#31564d]">
                    {message}
                </div>
            ) : null}

            <div className="mt-5 grid gap-4 xl:grid-cols-2">
                {loading ? (
                    <div className="col-span-full rounded-2xl border border-[#dce6e2] bg-white p-10 text-center text-sm text-[#83908c]">
                        در حال دریافت اطلاعات وکلا...
                    </div>
                ) : items.map((lawyer) => (
                    <article key={lawyer.id} className="flex min-h-[330px] flex-col rounded-2xl border border-[#dce6e2] bg-white p-5 shadow-[0_8px_28px_rgba(13,51,44,0.04)]">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h2 className="text-lg font-black text-[#174c42]">{lawyer.full_name || 'بدون نام'}</h2>
                                <p className="mt-1 text-sm text-[#71827c]">
                                    {lawyer.phone || 'بدون شماره'} · پروانه {lawyer.license_number || 'ثبت نشده'}
                                </p>
                            </div>
                            <span className="rounded-full bg-[#eef6f3] px-3 py-1 text-[11px] font-black text-[#31564d]">
                                {statusLabel(lawyer.verification_status)}
                            </span>
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            <div className="rounded-xl bg-[#f7faf8] p-3">
                                <p className="text-[11px] text-[#87958f]">تخصص‌ها</p>
                                <p className="mt-1 text-sm font-bold leading-6 text-[#31564d]">
                                    {(lawyer.specialties ?? []).join('، ') || 'ثبت نشده'}
                                </p>
                            </div>
                            <div className="rounded-xl bg-[#f7faf8] p-3">
                                <p className="flex items-center gap-1 text-[11px] text-[#87958f]"><MapPin size={13}/> محدوده فعالیت</p>
                                <p className="mt-1 text-sm font-bold leading-6 text-[#31564d]">
                                    {(lawyer.service_areas ?? []).map((area) => area.city || area.province).filter(Boolean).join('، ') || 'ثبت نشده'}
                                </p>
                            </div>
                        </div>

                        <div className="mt-3 flex items-center gap-4 text-xs text-[#71827c]">
                            <span className="flex items-center gap-1"><Star size={14}/> امتیاز: {lawyer.average_rating ? Number(lawyer.average_rating).toLocaleString('fa-IR') : 'بدون امتیاز'}</span>
                            <span>تعداد رأی: {Number(lawyer.rating_count || 0).toLocaleString('fa-IR')}</span>
                        </div>

                        {lawyer.verification_status === 'pending' ? (
                            <div className="mt-4">
                                <textarea
                                    value={notes[lawyer.id] || ''}
                                    onChange={(event) => setNotes((current) => ({
                                        ...current,
                                        [lawyer.id]: event.target.value,
                                    }))}
                                    placeholder="یادداشت بررسی؛ برای رد وکیل الزامی است"
                                    className="min-h-20 w-full rounded-xl border border-[#d8e2de] p-3 text-sm outline-none focus:border-[#abc5bc]"
                                />
                                <div className="mt-2 flex gap-2">
                                    <button disabled={busy === lawyer.id} onClick={() => review(lawyer, 'approved')} className="rounded-xl bg-[#174c42] px-4 py-2 text-xs font-black text-white disabled:opacity-50">
                                        تأیید وکیل
                                    </button>
                                    <button disabled={busy === lawyer.id} onClick={() => review(lawyer, 'rejected')} className="rounded-xl bg-red-600 px-4 py-2 text-xs font-black text-white disabled:opacity-50">
                                        رد با دلیل
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className="mt-4 rounded-xl bg-[#f8faf9] px-3 py-2 text-xs leading-6 text-[#71827c]">
                                یادداشت آخرین بررسی: {lawyer.verification?.review_note || 'ثبت نشده'}
                            </p>
                        )}

                        <div className="mt-auto pt-4">
                            <Link
                                href={`/admin/lawyersAdmin/${encodeURIComponent(lawyer.id)}`}
                                className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-[#c9a96e] bg-[#fffaf0] px-4 text-sm font-black text-[#76581d] transition hover:bg-[#fff4d8]"
                            >
                                مشاهده پروفایل کامل و سوابق
                            </Link>
                        </div>
                    </article>
                ))}

                {!loading && !items.length ? (
                    <div className="col-span-full rounded-2xl border border-[#dce6e2] bg-white p-10 text-center text-sm text-[#83908c]">
                        وکیلی با این فیلتر پیدا نشد.
                    </div>
                ) : null}
            </div>
        </div>
    );
}
