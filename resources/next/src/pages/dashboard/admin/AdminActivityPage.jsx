'use client';

import { useEffect, useState } from 'react';
import { getAdminActivity } from '@/lib/api/admin';

export default function AdminActivityPage() {
    const [items, setItems] = useState([]);
    useEffect(() => { getAdminActivity().then(setItems); }, []);

    return <div dir="rtl" className="mx-auto w-full max-w-[1500px] px-5 py-7">
        <h1 className="text-3xl font-black text-[#10382f]">لاگ مدیریتی</h1>
        <p className="mt-2 text-sm text-[#788883]">ثبت عملیات حساس مدیران برای پیگیری و Audit.</p>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-[#dce6e2] bg-white p-4">
            <table className="w-full min-w-[900px] text-right text-sm"><thead><tr className="bg-[#f4f8f6] text-xs text-[#687a74]"><th className="p-3">مدیر</th><th className="p-3">عملیات</th><th className="p-3">هدف</th><th className="p-3">دلیل</th><th className="p-3">زمان</th></tr></thead>
            <tbody>{items.map((x)=><tr key={x.id} className="border-b border-[#edf2ef] last:border-0"><td className="p-3">{x.admin?.name || '—'}</td><td className="p-3">{x.action_type}</td><td className="p-3">{x.target_type || '—'}</td><td className="p-3">{x.reason || '—'}</td><td className="p-3">{x.created_at ? new Date(x.created_at).toLocaleString('fa-IR') : '—'}</td></tr>)}</tbody></table>
        </div>
    </div>;
}
