'use client';

import { useCallback, useEffect, useState } from 'react';

import { getAdminUsers, setAdminUserStatus } from '@/lib/api/admin';
import AdminSearchBox from '@/features/admin/shared/AdminSearchBox';
import AdminSearchSelect from '@/features/admin/shared/AdminSearchSelect';
import { faDate, roleLabel, statusLabel } from '@/features/admin/shared/adminFormat';

const statusOptions = [
    { value: 'active', label: 'فعال' },
    { value: 'suspended', label: 'تعلیق‌شده' },
    { value: 'closed', label: 'بسته' },
];

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

    const changeStatus = async (user, nextStatus) => {
        const text = String(reason[user.id] || '').trim();
        if (!text) {
            setMessage('برای تغییر وضعیت حساب، دلیل را وارد کنید.');
            return;
        }

        try {
            await setAdminUserStatus(user.id, nextStatus, text);
            setMessage(nextStatus === 'suspended'
                ? 'حساب تعلیق شد و به کاربر اعلان ارسال شد.'
                : 'حساب فعال شد و به کاربر اعلان ارسال شد.');
            await load();
        } catch (error) {
            setMessage(error.message);
        }
    };

    return (
        <div dir="rtl" className="mx-auto w-full max-w-[1500px] px-5 py-7">
            <h1 className="text-3xl font-black text-[#10382f]">کاربران</h1>
            <p className="mt-2 text-sm text-[#788883]">جستجو، فیلتر و مدیریت وضعیت حساب‌های واقعی سامانه.</p>

            <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_250px]">
                <AdminSearchBox value={search} onChange={setSearch} placeholder="جستجو با نام، موبایل یا شناسه..." />
                <AdminSearchSelect value={status} onChange={setStatus} options={statusOptions} allLabel="همه وضعیت‌ها" />
            </div>

            {message ? <div className="mt-4 rounded-2xl border border-[#dce6e2] bg-white px-4 py-3 text-sm font-bold text-[#31564d]">{message}</div> : null}

            <div className="mt-5 overflow-x-auto rounded-2xl border border-[#dce6e2] bg-white p-4 shadow-sm">
                <table className="w-full min-w-[1000px] text-right text-sm">
                    <thead><tr className="bg-[#f4f8f6] text-xs text-[#687a74]"><th className="rounded-r-xl p-3">کاربر</th><th className="p-3">موبایل</th><th className="p-3">نقش</th><th className="p-3">وضعیت</th><th className="p-3">آخرین ورود</th><th className="rounded-l-xl p-3">اقدام</th></tr></thead>
                    <tbody>
                    {loading ? <tr><td colSpan="6" className="p-8 text-center text-[#83908c]">در حال دریافت...</td></tr> : items.map((user) => (
                        <tr key={user.id} className="border-b border-[#edf2ef] last:border-0">
                            <td className="p-3"><b className="text-[#244d44]">{user.name}</b><div className="mt-1 text-[11px] text-[#92a09b]">{user.public_id}</div></td>
                            <td className="p-3">{user.phone}</td>
                            <td className="p-3">{(user.roles ?? []).map(roleLabel).join('، ') || '—'}</td>
                            <td className="p-3"><span className={`rounded-full px-3 py-1 text-xs font-black ${user.status === 'suspended' ? 'bg-red-50 text-red-600' : 'bg-[#eef6f3] text-[#31564d]'}`}>{statusLabel(user.status)}</span></td>
                            <td className="p-3">{faDate(user.last_login_at)}</td>
                            <td className="p-3">
                                {user.status === 'active' || user.status === 'suspended' ? (
                                    <>
                                        <input value={reason[user.id] || ''} onChange={(e) => setReason((s) => ({ ...s, [user.id]: e.target.value }))} placeholder="دلیل تغییر وضعیت" className="mb-2 min-h-10 w-full rounded-xl border border-[#d9e2de] px-3 text-xs outline-none" />
                                        <button onClick={() => changeStatus(user, user.status === 'active' ? 'suspended' : 'active')} className={`rounded-xl px-3 py-2 text-xs font-black text-white ${user.status === 'active' ? 'bg-red-600' : 'bg-[#174c42]'}`}>
                                            {user.status === 'active' ? 'تعلیق حساب' : 'فعال‌سازی حساب'}
                                        </button>
                                    </>
                                ) : <span className="text-xs text-[#8b9894]">عملیاتی ندارد</span>}
                            </td>
                        </tr>
                    ))}
                    {!loading && !items.length ? <tr><td colSpan="6" className="p-8 text-center text-[#83908c]">کاربری پیدا نشد.</td></tr> : null}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
