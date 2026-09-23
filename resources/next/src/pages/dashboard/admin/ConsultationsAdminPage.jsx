'use client';

import { useCallback, useEffect, useState } from 'react';

import { getAdminConsultations } from '@/lib/api/admin';
import AdminSearchBox from '@/features/admin/shared/AdminSearchBox';
import AdminSearchSelect from '@/features/admin/shared/AdminSearchSelect';
import { faDate, statusLabel } from '@/features/admin/shared/adminFormat';

const statusOptions = [
    { value: 'held', label: 'رزرو موقت' },
    { value: 'confirmed', label: 'تأییدشده' },
    { value: 'completed', label: 'انجام‌شده' },
    { value: 'cancelled', label: 'لغوشده' },
];

export default function ConsultationsAdminPage() {
    const [items, setItems] = useState([]);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            setItems(await getAdminConsultations({ search, status }));
        } finally {
            setLoading(false);
        }
    }, [search, status]);

    useEffect(() => {
        const timer = window.setTimeout(load, 300);
        return () => window.clearTimeout(timer);
    }, [load]);

    return (
        <div dir="rtl" className="mx-auto w-full max-w-[1500px] px-5 py-7">
            <h1 className="text-3xl font-black text-[#10382f]">مشاوره‌ها</h1>
            <p className="mt-2 text-sm text-[#788883]">جستجو و بررسی رزروهای مشاوره ثبت‌شده.</p>

            <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_250px]">
                <AdminSearchBox value={search} onChange={setSearch} placeholder="جستجو با نام موکل، موبایل، وکیل یا موضوع..." />
                <AdminSearchSelect value={status} onChange={setStatus} options={statusOptions} allLabel="همه وضعیت‌ها" />
            </div>

            <div className="mt-5 overflow-x-auto rounded-2xl border border-[#dce6e2] bg-white p-4 shadow-sm">
                <table className="w-full min-w-[1000px] text-right text-sm">
                    <thead><tr className="bg-[#f4f8f6] text-xs text-[#687a74]"><th className="rounded-r-xl p-3">موضوع</th><th className="p-3">موکل</th><th className="p-3">وکیل</th><th className="p-3">زمان</th><th className="p-3">مدت</th><th className="p-3">مبلغ</th><th className="rounded-l-xl p-3">وضعیت</th></tr></thead>
                    <tbody>
                    {loading ? <tr><td colSpan="7" className="p-8 text-center text-[#83908c]">در حال دریافت...</td></tr> : items.map((item) => (
                        <tr key={item.id} className="border-b border-[#edf2ef] last:border-0">
                            <td className="p-3 font-bold text-[#31564d]">{item.request_title || 'مشاوره حقوقی'}</td>
                            <td className="p-3">{item.client?.name || '—'}<div className="mt-1 text-xs text-[#8b9894]">{item.client?.phone || '—'}</div></td>
                            <td className="p-3">{item.lawyer || '—'}</td>
                            <td className="p-3">{faDate(item.scheduled_start_at)}</td>
                            <td className="p-3">{item.duration_minutes ? `${Number(item.duration_minutes).toLocaleString('fa-IR')} دقیقه` : '—'}</td>
                            <td className="p-3">{item.price_rial ? `${Number(item.price_rial).toLocaleString('fa-IR')} ریال` : '—'}</td>
                            <td className="p-3"><span className="rounded-full bg-[#eef6f3] px-3 py-1 text-xs font-black text-[#31564d]">{statusLabel(item.status)}</span></td>
                        </tr>
                    ))}
                    {!loading && !items.length ? <tr><td colSpan="7" className="p-8 text-center text-[#83908c]">مشاوره‌ای پیدا نشد.</td></tr> : null}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
