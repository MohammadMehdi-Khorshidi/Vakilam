'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CalendarClock, Clock3, FilePlus2 } from 'lucide-react';
import { Vazirmatn } from 'next/font/google';

import { getClientConsultations } from '@/lib/api/consultations';

const vazir = Vazirmatn({ subsets: ['arabic'], weight: ['400','500','600','700','800'] });

const statusLabel = {
    requested: 'در انتظار نهایی‌شدن',
    reserved: 'رزرو شده',
    confirmed: 'تأیید شده',
    completed: 'برگزار شده',
    cancelled: 'لغو شده',
    no_show: 'عدم حضور',
};

function formatDate(value) {
    if (!value) return '—';
    return new Intl.DateTimeFormat('fa-IR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value));
}

export default function ClientConsultationsPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        getClientConsultations()
            .then((data) => setItems(data ?? []))
            .catch((e) => setError(e?.message || 'دریافت مشاوره‌ها انجام نشد.'))
            .finally(() => setLoading(false));
    }, []);

    return (
        <main dir="rtl" className={`${vazir.className} min-h-screen bg-[#f6f9f7] px-4 py-8 sm:px-6 lg:px-10`}>
            <div className="mx-auto max-w-[1100px]">
                <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <p className="text-sm font-bold text-[#a47b2c]">پنل موکل</p>
                        <h1 className="mt-2 text-3xl font-black text-[#173f38]">مشاوره‌های من</h1>
                        <p className="mt-2 text-sm leading-7 text-slate-500">زمان‌های رزروشده و سابقه مشاوره‌های حقوقی شما.</p>
                    </div>
                    <Link href="/client/legal-request" className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#173f38] px-5 py-3 text-sm font-black text-white">
                        <FilePlus2 size={17}/> ثبت درخواست مشاوره
                    </Link>
                </header>

                {error ? <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div> : null}

                <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white">
                    {loading ? <p className="p-12 text-center text-sm text-slate-500">در حال دریافت مشاوره‌ها...</p> :
                    items.length === 0 ? (
                        <div className="p-12 text-center">
                            <CalendarClock className="mx-auto text-slate-300" size={40}/>
                            <p className="mt-3 text-sm text-slate-500">هنوز مشاوره‌ای رزرو نکرده‌اید.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {items.map((item)=>(
                                <article key={item.public_id} className="p-5">
                                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                                        <div>
                                            <h2 className="font-black text-[#294e46]">{item.legal_request?.title || 'مشاوره حقوقی'}</h2>
                                            <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-500">
                                                <span>وکیل: <b>{item.lawyer?.full_name || '—'}</b></span>
                                                <span className="inline-flex items-center gap-1"><Clock3 size={13}/>{formatDate(item.scheduled_start_at)}</span>
                                                <span>{item.duration_minutes} دقیقه</span>
                                            </div>
                                        </div>
                                        <span className="w-fit rounded-full bg-[#edf6f2] px-3 py-1.5 text-xs font-bold text-[#17634f]">{statusLabel[item.status] || item.status}</span>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
