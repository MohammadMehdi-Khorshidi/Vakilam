'use client';

import { useCallback, useEffect, useState } from 'react';

import { getAdminLegalRequests } from '@/lib/api/admin';
import AdminSearchBox from '@/features/admin/shared/AdminSearchBox';
import AdminSearchSelect from '@/features/admin/shared/AdminSearchSelect';
import { serviceIntentLabel, statusLabel, urgencyLabel } from '@/features/admin/shared/adminFormat';

const statusOptions = [
    { value: 'draft', label: 'پیش‌نویس' },
    { value: 'submitted', label: 'ثبت‌شده' },
    { value: 'matching', label: 'در حال تطبیق' },
    { value: 'accepted', label: 'پذیرفته‌شده' },
    { value: 'cancelled', label: 'لغوشده' },
];

const intentOptions = [
    { value: 'lawyer_selection', label: 'انتخاب وکیل' },
    { value: 'consultation', label: 'مشاوره حقوقی' },
];

export default function LegalRequestsAdminPage() {
    const [items, setItems] = useState([]);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [intent, setIntent] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            setItems(await getAdminLegalRequests({
                search,
                status,
                service_intent: intent,
            }));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [search, status, intent]);

    useEffect(() => {
        const timer = window.setTimeout(load, 300);
        return () => window.clearTimeout(timer);
    }, [load]);

    return (
        <div dir="rtl" className="mx-auto w-full max-w-[1500px] px-5 py-7">
            <h1 className="text-3xl font-black text-[#10382f]">درخواست‌های حقوقی</h1>
            <p className="mt-2 text-sm text-[#788883]">جستجو و بررسی فقط‌خواندنی درخواست‌های واقعی سامانه.</p>

            <div className="mt-6 grid gap-3 xl:grid-cols-[1fr_230px_230px]">
                <AdminSearchBox
                    value={search}
                    onChange={setSearch}
                    placeholder="جستجو در عنوان، شرح، نام موکل، موبایل، دسته یا شهر..."
                />
                <AdminSearchSelect value={status} onChange={setStatus} options={statusOptions} allLabel="همه وضعیت‌ها" />
                <AdminSearchSelect value={intent} onChange={setIntent} options={intentOptions} allLabel="همه مسیرها" />
            </div>

            {error ? <div className="mt-4 rounded-2xl border border-red-100 bg-white p-4 text-sm text-red-600">{error}</div> : null}

            <div className="mt-5 grid gap-4">
                {loading ? (
                    <div className="rounded-2xl border border-[#dce6e2] bg-white p-10 text-center text-sm text-[#83908c]">در حال دریافت...</div>
                ) : items.map((item) => (
                    <article key={item.id} className="rounded-2xl border border-[#dce6e2] bg-white p-5 shadow-sm">
                        <div className="flex flex-col justify-between gap-4 lg:flex-row">
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="font-black text-[#174c42]">{item.title || 'درخواست حقوقی'}</h2>
                                    <span className="rounded-full bg-[#eef6f3] px-3 py-1 text-[11px] font-black text-[#31564d]">{statusLabel(item.status)}</span>
                                </div>
                                <p className="mt-3 max-w-4xl text-sm leading-7 text-[#697c75]">{item.description || 'شرحی ثبت نشده است.'}</p>
                            </div>
                            <div className="grid min-w-[280px] grid-cols-2 gap-2 text-xs">
                                <div className="rounded-xl bg-[#f7faf8] p-3"><span className="text-[#87958f]">موکل</span><p className="mt-1 font-black text-[#31564d]">{item.client?.name || '—'}</p></div>
                                <div className="rounded-xl bg-[#f7faf8] p-3"><span className="text-[#87958f]">دسته</span><p className="mt-1 font-black text-[#31564d]">{item.category || '—'}</p></div>
                                <div className="rounded-xl bg-[#f7faf8] p-3"><span className="text-[#87958f]">مسیر</span><p className="mt-1 font-black text-[#31564d]">{serviceIntentLabel(item.service_intent)}</p></div>
                                <div className="rounded-xl bg-[#f7faf8] p-3"><span className="text-[#87958f]">فوریت</span><p className="mt-1 font-black text-[#31564d]">{urgencyLabel(item.urgency)}</p></div>
                            </div>
                        </div>
                        <div className="mt-4 border-t border-[#edf2ef] pt-3 text-xs text-[#7c8c87]">
                            موقعیت: {[item.province, item.city].filter(Boolean).join('، ') || 'ثبت نشده'} · موبایل موکل: {item.client?.phone || '—'}
                        </div>
                    </article>
                ))}
                {!loading && !items.length ? <div className="rounded-2xl border border-[#dce6e2] bg-white p-10 text-center text-sm text-[#83908c]">درخواستی پیدا نشد.</div> : null}
            </div>
        </div>
    );
}
