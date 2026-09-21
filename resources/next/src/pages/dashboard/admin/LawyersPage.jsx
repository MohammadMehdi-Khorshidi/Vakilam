'use client';

import { useCallback, useEffect, useState } from 'react';

import { getAdminLawyers, reviewAdminLawyer } from '@/lib/api/admin';

export default function LawyersPage() {
    const [items, setItems] = useState([]);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [notes, setNotes] = useState({});
    const [message, setMessage] = useState('');

    const load = useCallback(async () => {
        setItems(await getAdminLawyers({ search, status }));
    }, [search, status]);

    useEffect(() => {
        const timer = window.setTimeout(load, 250);
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

        await reviewAdminLawyer(lawyer.verification.id, nextStatus, note);
        setMessage(nextStatus === 'approved' ? 'وکیل تأیید شد و به او اعلان ارسال شد.' : 'وکیل رد شد و دلیل برای او ارسال شد.');
        await load();
    };

    return (
        <div dir="rtl" className="mx-auto w-full max-w-[1500px] px-5 py-7">
            <h1 className="text-3xl font-black text-[#10382f]">بررسی وکلا</h1>
            <p className="mt-2 text-sm text-[#788883]">پروفایل، تخصص‌ها و وضعیت واقعی احراز وکیل.</p>

            <div className="mt-5 flex flex-wrap gap-3">
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="نام، موبایل یا شماره پروانه" className="min-h-11 min-w-[280px] rounded-xl border border-[#d7e2dd] bg-white px-4 text-sm" />
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="min-h-11 rounded-xl border border-[#d7e2dd] bg-white px-4 text-sm">
                    <option value="">همه</option><option value="pending">در انتظار</option><option value="approved">تأییدشده</option><option value="rejected">ردشده</option>
                </select>
            </div>

            {message ? <div className="mt-4 rounded-xl border border-[#dce6e2] bg-white px-4 py-3 text-sm text-[#31564d]">{message}</div> : null}

            <div className="mt-5 grid gap-4">
                {items.map((lawyer) => (
                    <section key={lawyer.id} className="rounded-2xl border border-[#dce6e2] bg-white p-5 shadow-sm">
                        <div className="flex flex-col justify-between gap-4 lg:flex-row">
                            <div>
                                <div className="flex items-center gap-3">
                                    <h2 className="text-lg font-black text-[#174c42]">{lawyer.full_name || 'بدون نام'}</h2>
                                    <span className="rounded-full bg-[#f1f6f4] px-3 py-1 text-xs font-bold text-[#526d65]">{lawyer.verification_status}</span>
                                </div>
                                <p className="mt-2 text-sm text-[#71827c]">موبایل: {lawyer.phone || '—'} · پروانه: {lawyer.license_number || '—'}</p>
                                <p className="mt-2 text-sm text-[#71827c]">تخصص‌ها: {(lawyer.specialties ?? []).join('، ') || 'ثبت نشده'}</p>
                            </div>

                            {lawyer.verification_status === 'pending' ? (
                                <div className="w-full lg:max-w-md">
                                    <textarea value={notes[lawyer.id] || ''} onChange={(e) => setNotes((s) => ({ ...s, [lawyer.id]: e.target.value }))} placeholder="یادداشت بررسی؛ برای رد اجباری است" className="min-h-20 w-full rounded-xl border border-[#d8e2de] p-3 text-sm" />
                                    <div className="mt-2 flex gap-2">
                                        <button onClick={() => review(lawyer, 'approved')} className="rounded-xl bg-[#174c42] px-4 py-2 text-xs font-black text-white">تأیید وکیل</button>
                                        <button onClick={() => review(lawyer, 'rejected')} className="rounded-xl bg-red-600 px-4 py-2 text-xs font-black text-white">رد با دلیل</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-sm text-[#71827c]">یادداشت بررسی: {lawyer.verification?.review_note || '—'}</div>
                            )}
                        </div>
                    </section>
                ))}
                {!items.length ? <div className="rounded-2xl border border-[#dce6e2] bg-white p-10 text-center text-sm text-[#83908c]">وکیلی پیدا نشد.</div> : null}
            </div>
        </div>
    );
}
