'use client';

import { useCallback, useEffect, useState } from 'react';

import { getAdminUsers, setAdminUserStatus } from '@/lib/api/admin';

export default function AdminUsersPage() {
    const [items, setItems] = useState([]);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [reason, setReason] = useState({});
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        try {
            setItems(await getAdminUsers({ search, status }));
        } finally {
            setLoading(false);
        }
    }, [search, status]);

    useEffect(() => {
        const timer = window.setTimeout(load, 250);
        return () => window.clearTimeout(timer);
    }, [load]);

    const changeStatus = async (user, nextStatus) => {
        const text = String(reason[user.id] || '').trim();
        if (!text) {
            setMessage('برای تغییر وضعیت حساب، دلیل را وارد کنید.');
            return;
        }

        await setAdminUserStatus(user.id, nextStatus, text);
        setMessage(nextStatus === 'suspended' ? 'حساب تعلیق شد و به کاربر اعلان ارسال شد.' : 'حساب فعال شد و به کاربر اعلان ارسال شد.');
        await load();
    };

    return (
        <div dir="rtl" className="mx-auto w-full max-w-[1500px] px-5 py-7">
            <h1 className="text-3xl font-black text-[#10382f]">کاربران</h1>
            <p className="mt-2 text-sm text-[#788883]">اطلاعات واقعی کاربران و مدیریت وضعیت حساب.</p>

            <div className="mt-5 flex flex-wrap gap-3">
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="نام، موبایل یا شناسه" className="min-h-11 min-w-[280px] rounded-xl border border-[#d7e2dd] bg-white px-4 text-sm outline-none" />
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="min-h-11 rounded-xl border border-[#d7e2dd] bg-white px-4 text-sm">
                    <option value="">همه وضعیت‌ها</option><option value="active">فعال</option><option value="suspended">تعلیق‌شده</option><option value="closed">بسته</option>
                </select>
            </div>

            {message ? <div className="mt-4 rounded-xl border border-[#dce6e2] bg-white px-4 py-3 text-sm text-[#31564d]">{message}</div> : null}

            <div className="mt-5 overflow-x-auto rounded-2xl border border-[#dce6e2] bg-white p-4 shadow-sm">
                <table className="w-full min-w-[980px] text-right text-sm">
                    <thead><tr className="bg-[#f4f8f6] text-xs text-[#687a74]"><th className="p-3">کاربر</th><th className="p-3">موبایل</th><th className="p-3">نقش</th><th className="p-3">وضعیت</th><th className="p-3">آخرین ورود</th><th className="p-3">اقدام</th></tr></thead>
                    <tbody>
                    {loading ? <tr><td colSpan="6" className="p-8 text-center">در حال دریافت...</td></tr> : items.map((user) => (
                        <tr key={user.id} className="border-b border-[#edf2ef] last:border-0">
                            <td className="p-3"><b className="text-[#244d44]">{user.name}</b><div className="mt-1 text-[11px] text-[#92a09b]">{user.public_id}</div></td>
                            <td className="p-3">{user.phone}</td>
                            <td className="p-3">{(user.roles ?? []).join('، ') || '—'}</td>
                            <td className="p-3"><span className={`rounded-full px-3 py-1 text-xs font-bold ${user.status === 'suspended' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'}`}>{user.status}</span></td>
                            <td className="p-3">{user.last_login_at ? new Date(user.last_login_at).toLocaleString('fa-IR') : '—'}</td>
                            <td className="p-3">
                                <input value={reason[user.id] || ''} onChange={(e) => setReason((s) => ({ ...s, [user.id]: e.target.value }))} placeholder="دلیل تغییر" className="mb-2 min-h-10 w-full rounded-lg border border-[#d9e2de] px-3 text-xs" />
                                <button onClick={() => changeStatus(user, user.status === 'active' ? 'suspended' : 'active')} className={`rounded-lg px-3 py-2 text-xs font-black text-white ${user.status === 'active' ? 'bg-red-600' : 'bg-[#174c42]'}`}>
                                    {user.status === 'active' ? 'تعلیق حساب' : 'فعال‌سازی'}
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
