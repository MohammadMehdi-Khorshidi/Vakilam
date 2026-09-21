'use client';

import { useEffect, useState } from 'react';
import { getAdmins, setAdminRole } from '@/lib/api/admin';

export default function AdminsPage() {
    const [items, setItems] = useState([]);
    const [reason, setReason] = useState({});
    const load = async () => setItems(await getAdmins());
    useEffect(() => { load(); }, []);

    const revoke = async (user) => {
        await setAdminRole(user.id, false, reason[user.id] || '');
        await load();
    };

    return <div dir="rtl" className="mx-auto w-full max-w-[1500px] px-5 py-7">
        <h1 className="text-3xl font-black text-[#10382f]">مدیران سامانه</h1>
        <p className="mt-2 text-sm text-[#788883]">فقط Super Admin این صفحه را می‌بیند. ساخت Super Admin جدید همچنان فقط از CLI انجام می‌شود.</p>
        <div className="mt-5 grid gap-4">
            {items.map((x)=><section key={x.id} className="rounded-2xl border border-[#dce6e2] bg-white p-5">
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                    <div><h2 className="font-black text-[#174c42]">{x.name}</h2><p className="mt-1 text-sm text-[#788883]">{x.phone} · {(x.roles ?? []).join('، ')}</p></div>
                    {!(x.roles ?? []).includes('super_admin') ? <div className="flex gap-2"><input value={reason[x.id] || ''} onChange={(e)=>setReason(s=>({...s,[x.id]:e.target.value}))} placeholder="دلیل لغو دسترسی" className="rounded-xl border border-[#d8e2de] px-3 text-sm"/><button onClick={()=>revoke(x)} className="rounded-xl bg-red-600 px-4 py-2 text-xs font-black text-white">لغو Admin</button></div> : <span className="rounded-full bg-[#fff5dc] px-3 py-1 text-xs font-black text-[#8a671d]">Super Admin</span>}
                </div>
            </section>)}
        </div>
    </div>;
}
