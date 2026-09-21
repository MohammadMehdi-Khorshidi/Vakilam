'use client';

import { useEffect, useState } from 'react';
import { getAdminLegalRequests } from '@/lib/api/admin';

export default function LegalRequestsAdminPage() {
    const [items, setItems] = useState([]);
    useEffect(() => { getAdminLegalRequests().then(setItems); }, []);

    return <div dir="rtl" className="mx-auto w-full max-w-[1500px] px-5 py-7">
        <h1 className="text-3xl font-black text-[#10382f]">درخواست‌های حقوقی</h1>
        <p className="mt-2 text-sm text-[#788883]">نمای مدیریتی فقط‌خواندنی از درخواست‌های واقعی.</p>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-[#dce6e2] bg-white p-4">
            <table className="w-full min-w-[1000px] text-right text-sm"><thead><tr className="bg-[#f4f8f6] text-xs text-[#687a74]"><th className="p-3">موضوع</th><th className="p-3">موکل</th><th className="p-3">دسته</th><th className="p-3">موقعیت</th><th className="p-3">مسیر</th><th className="p-3">وضعیت</th></tr></thead>
            <tbody>{items.map((x)=><tr key={x.id} className="border-b border-[#edf2ef] last:border-0"><td className="p-3"><b>{x.title || 'درخواست حقوقی'}</b><div className="mt-1 max-w-md text-xs leading-6 text-[#82908b]">{x.description}</div></td><td className="p-3">{x.client?.name}<div className="text-xs text-[#8b9894]">{x.client?.phone}</div></td><td className="p-3">{x.category || '—'}</td><td className="p-3">{[x.province,x.city].filter(Boolean).join('، ') || '—'}</td><td className="p-3">{x.service_intent || '—'}</td><td className="p-3">{x.status}</td></tr>)}</tbody></table>
        </div>
    </div>;
}
