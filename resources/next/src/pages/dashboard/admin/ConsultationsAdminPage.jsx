'use client';

import { useEffect, useState } from 'react';
import { getAdminConsultations } from '@/lib/api/admin';

export default function ConsultationsAdminPage() {
    const [items, setItems] = useState([]);
    useEffect(() => { getAdminConsultations().then(setItems); }, []);

    return <div dir="rtl" className="mx-auto w-full max-w-[1500px] px-5 py-7">
        <h1 className="text-3xl font-black text-[#10382f]">مشاوره‌ها</h1>
        <p className="mt-2 text-sm text-[#788883]">رزروهای مشاوره ثبت‌شده در سامانه.</p>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-[#dce6e2] bg-white p-4">
            <table className="w-full min-w-[1000px] text-right text-sm"><thead><tr className="bg-[#f4f8f6] text-xs text-[#687a74]"><th className="p-3">موضوع</th><th className="p-3">موکل</th><th className="p-3">وکیل</th><th className="p-3">زمان</th><th className="p-3">مدت</th><th className="p-3">مبلغ</th><th className="p-3">وضعیت</th></tr></thead>
            <tbody>{items.map((x)=><tr key={x.id} className="border-b border-[#edf2ef] last:border-0"><td className="p-3">{x.request_title || 'مشاوره حقوقی'}</td><td className="p-3">{x.client?.name}<div className="text-xs text-[#8b9894]">{x.client?.phone}</div></td><td className="p-3">{x.lawyer || '—'}</td><td className="p-3">{x.scheduled_start_at ? new Date(x.scheduled_start_at).toLocaleString('fa-IR') : '—'}</td><td className="p-3">{x.duration_minutes ? `${x.duration_minutes} دقیقه` : '—'}</td><td className="p-3">{x.price_rial ? `${Number(x.price_rial).toLocaleString('fa-IR')} ریال` : '—'}</td><td className="p-3">{x.status}</td></tr>)}</tbody></table>
        </div>
    </div>;
}
