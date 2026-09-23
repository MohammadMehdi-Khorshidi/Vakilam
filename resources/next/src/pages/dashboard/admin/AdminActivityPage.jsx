'use client';

import { useCallback, useEffect, useState } from 'react';

import { getAdminActivity } from '@/lib/api/admin';
import AdminSearchBox from '@/features/admin/shared/AdminSearchBox';
import { actionLabel, faDate, targetLabel } from '@/features/admin/shared/adminFormat';

export default function AdminActivityPage() {
    const [items, setItems] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            setItems(await getAdminActivity({ search }));
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => {
        const timer = window.setTimeout(load, 300);
        return () => window.clearTimeout(timer);
    }, [load]);

    return (
        <div dir="rtl" className="mx-auto w-full max-w-[1500px] px-5 py-7">
            <h1 className="text-3xl font-black text-[#10382f]">لاگ مدیریتی</h1>
            <p className="mt-2 text-sm text-[#788883]">عملیات حساس مدیران با عنوان‌های فارسی و قابل جستجو.</p>

            <AdminSearchBox value={search} onChange={setSearch} placeholder="جستجو در مدیر، عملیات، هدف یا دلیل..." className="mt-6 max-w-2xl" />

            <div className="mt-5 overflow-x-auto rounded-2xl border border-[#dce6e2] bg-white p-4 shadow-sm">
                <table className="w-full min-w-[900px] text-right text-sm">
                    <thead><tr className="bg-[#f4f8f6] text-xs text-[#687a74]"><th className="rounded-r-xl p-3">مدیر</th><th className="p-3">عملیات</th><th className="p-3">هدف</th><th className="p-3">دلیل</th><th className="rounded-l-xl p-3">زمان</th></tr></thead>
                    <tbody>
                    {loading ? <tr><td colSpan="5" className="p-8 text-center text-[#83908c]">در حال دریافت...</td></tr> : items.map((item) => (
                        <tr key={item.id} className="border-b border-[#edf2ef] last:border-0">
                            <td className="p-3 font-bold text-[#31564d]">{item.admin?.name || '—'}</td>
                            <td className="p-3">{actionLabel(item.action_type)}</td>
                            <td className="p-3">{targetLabel(item.target_type)}</td>
                            <td className="p-3">{item.reason || 'بدون توضیح'}</td>
                            <td className="p-3">{faDate(item.created_at)}</td>
                        </tr>
                    ))}
                    {!loading && !items.length ? <tr><td colSpan="5" className="p-8 text-center text-[#83908c]">لاگی پیدا نشد.</td></tr> : null}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
