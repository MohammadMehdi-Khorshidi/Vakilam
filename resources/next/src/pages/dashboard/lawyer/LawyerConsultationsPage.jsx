'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    CalendarClock,
    Check,
    Clock3,
    Pencil,
    Plus,
    Trash2,
    X,
} from 'lucide-react';
import { Vazirmatn } from 'next/font/google';

import {
    createLawyerAvailability,
    deleteLawyerAvailability,
    getLawyerAvailabilities,
    getLawyerConsultations,
    updateLawyerAvailability,
} from '@/lib/api/consultations';

const vazir = Vazirmatn({ subsets: ['arabic'], weight: ['400','500','600','700','800'] });
const DURATIONS = [15, 30, 45, 60];

function localDateTime(date, time) {
    if (!date || !time) return null;
    const value = new Date(`${date}T${time}:00`);
    return Number.isNaN(value.getTime()) ? null : value.toISOString();
}

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

function splitForForm(value) {
    if (!value) return { date: '', time: '' };
    const date = new Date(value);
    const pad = (number) => String(number).padStart(2, '0');
    return {
        date: `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`,
        time: `${pad(date.getHours())}:${pad(date.getMinutes())}`,
    };
}

const statusLabel = {
    requested: 'در انتظار نهایی‌شدن',
    reserved: 'رزرو شده',
    confirmed: 'تأیید شده',
    completed: 'برگزار شده',
    cancelled: 'لغو شده',
    no_show: 'عدم حضور',
};

export default function LawyerConsultationsPage() {
    const [availabilities, setAvailabilities] = useState([]);
    const [consultations, setConsultations] = useState([]);
    const [form, setForm] = useState({
        date: '',
        start: '',
        end: '',
        durations: [30, 60],
        note: '',
    });
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState('');
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');

    const load = useCallback(async () => {
        try {
            const [windows, bookings] = await Promise.all([
                getLawyerAvailabilities(),
                getLawyerConsultations(),
            ]);
            setAvailabilities(windows ?? []);
            setConsultations(bookings ?? []);
            setError('');
        } catch (e) {
            setError(e?.message || 'دریافت اطلاعات مشاوره انجام نشد.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const upcoming = useMemo(
        () => consultations.filter((item) =>
            ['requested','reserved','confirmed'].includes(item.status)
            && new Date(item.scheduled_end_at) > new Date()
        ),
        [consultations],
    );

    function toggleDuration(duration) {
        setForm((previous) => ({
            ...previous,
            durations: previous.durations.includes(duration)
                ? previous.durations.filter((item) => item !== duration)
                : [...previous.durations, duration].sort((a,b) => a-b),
        }));
    }

    function resetForm() {
        setEditingId(null);
        setForm({ date: '', start: '', end: '', durations: [30,60], note: '' });
    }

    function edit(item) {
        const start = splitForForm(item.starts_at);
        const end = splitForForm(item.ends_at);
        setEditingId(item.id);
        setForm({
            date: start.date,
            start: start.time,
            end: end.time,
            durations: item.allowed_durations ?? [15,30,45,60],
            note: item.note ?? '',
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    async function submit() {
        const startsAt = localDateTime(form.date, form.start);
        const endsAt = localDateTime(form.date, form.end);

        if (!startsAt || !endsAt || form.durations.length === 0) {
            setError('تاریخ، ساعت شروع و پایان و حداقل یک مدت مشاوره را مشخص کنید.');
            return;
        }

        setBusy('save');
        setError('');
        setNotice('');

        try {
            const payload = {
                starts_at: startsAt,
                ends_at: endsAt,
                allowed_durations: form.durations,
                note: form.note.trim() || null,
            };

            if (editingId) {
                await updateLawyerAvailability(editingId, payload);
                setNotice('بازه آزاد ویرایش شد.');
            } else {
                await createLawyerAvailability(payload);
                setNotice('بازه آزاد جدید ثبت شد.');
            }

            resetForm();
            await load();
        } catch (e) {
            setError(e?.validationMessages?.[0] || e?.message || 'ثبت بازه آزاد انجام نشد.');
        } finally {
            setBusy('');
        }
    }

    async function remove(id) {
        if (!window.confirm('این بازه آزاد حذف شود؟')) return;
        setBusy(id);
        try {
            await deleteLawyerAvailability(id);
            await load();
        } catch (e) {
            setError(e?.message || 'حذف بازه انجام نشد.');
        } finally {
            setBusy('');
        }
    }

    return (
        <main dir="rtl" className={`${vazir.className} min-h-screen bg-[#f6f9f7] px-4 py-8 sm:px-6 lg:px-10`}>
            <div className="mx-auto max-w-[1180px]">
                <header>
                    <p className="text-sm font-bold text-[#a47b2c]">پنل وکیل</p>
                    <h1 className="mt-2 text-3xl font-black text-[#173f38]">مشاوره‌های من</h1>
                    <p className="mt-2 text-sm leading-7 text-slate-500">
                        بازه‌های آزاد را ثبت کنید؛ سیستم زمان‌های ۱۵ دقیقه‌ای قابل رزرو را به‌صورت خودکار از این بازه‌ها می‌سازد.
                    </p>
                </header>

                {error ? <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div> : null}
                {notice ? <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">{notice}</div> : null}

                <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 md:p-6">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h2 className="font-black text-[#173f38]">{editingId ? 'ویرایش بازه آزاد' : 'افزودن بازه آزاد'}</h2>
                            <p className="mt-1 text-xs leading-6 text-slate-500">بازه‌های همپوشان از سمت سرور هم رد می‌شوند.</p>
                        </div>
                        {editingId ? (
                            <button type="button" onClick={resetForm} className="inline-flex items-center gap-1 text-xs font-bold text-slate-500">
                                <X size={15}/> انصراف از ویرایش
                            </button>
                        ) : <Plus className="text-[#a47b2c]" />}
                    </div>

                    <div className="mt-5 grid gap-4 md:grid-cols-3">
                        <label className="text-xs font-bold text-slate-600">
                            تاریخ
                            <input type="date" value={form.date} onChange={(e)=>setForm(p=>({...p,date:e.target.value}))} className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#76a99c]"/>
                        </label>
                        <label className="text-xs font-bold text-slate-600">
                            از ساعت
                            <input type="time" step="900" value={form.start} onChange={(e)=>setForm(p=>({...p,start:e.target.value}))} className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#76a99c]"/>
                        </label>
                        <label className="text-xs font-bold text-slate-600">
                            تا ساعت
                            <input type="time" step="900" value={form.end} onChange={(e)=>setForm(p=>({...p,end:e.target.value}))} className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#76a99c]"/>
                        </label>
                    </div>

                    <div className="mt-5">
                        <p className="text-xs font-bold text-slate-600">مدت‌های قابل رزرو</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {DURATIONS.map((duration) => {
                                const active = form.durations.includes(duration);
                                return (
                                    <button key={duration} type="button" onClick={()=>toggleDuration(duration)} className={`inline-flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-xs font-black transition ${active ? 'border-[#c7a154] bg-[#fff8e7] text-[#6e541d]' : 'border-slate-200 bg-white text-slate-500'}`}>
                                        {active ? <Check size={14}/> : null}
                                        {duration} دقیقه
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <label className="mt-5 block text-xs font-bold text-slate-600">
                        یادداشت داخلی (اختیاری)
                        <input value={form.note} onChange={(e)=>setForm(p=>({...p,note:e.target.value}))} placeholder="مثلاً فقط مشاوره آنلاین" className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#76a99c]"/>
                    </label>

                    <button type="button" disabled={busy==='save'} onClick={submit} className="mt-5 rounded-xl bg-[#173f38] px-6 py-3 text-sm font-black text-white disabled:opacity-50">
                        {busy==='save' ? 'در حال ثبت...' : editingId ? 'ذخیره تغییرات' : 'ثبت بازه آزاد'}
                    </button>
                </section>

                <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white">
                    <div className="border-b border-slate-100 p-5">
                        <h2 className="font-black text-[#173f38]">بازه‌های آزاد آینده</h2>
                    </div>
                    {loading ? <p className="p-10 text-center text-sm text-slate-500">در حال دریافت...</p> :
                     availabilities.length === 0 ? <p className="p-10 text-center text-sm text-slate-500">هنوز بازه آزادی ثبت نکرده‌اید.</p> :
                     <div className="divide-y divide-slate-100">
                        {availabilities.map((item) => (
                            <article key={item.id} className="flex flex-col justify-between gap-4 p-5 md:flex-row md:items-center">
                                <div>
                                    <p className="font-black text-[#294e46]">{formatDate(item.starts_at)}</p>
                                    <p className="mt-2 text-xs text-slate-500">
                                        تا {new Intl.DateTimeFormat('fa-IR',{hour:'2-digit',minute:'2-digit'}).format(new Date(item.ends_at))}
                                        {' '}• مدت‌ها: {(item.allowed_durations ?? []).map((d)=>`${d} دقیقه`).join('، ')}
                                    </p>
                                    {item.note ? <p className="mt-2 text-xs text-slate-400">{item.note}</p> : null}
                                </div>
                                <div className="flex gap-2">
                                    <button type="button" onClick={()=>edit(item)} className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600"><Pencil size={14}/> ویرایش</button>
                                    <button type="button" disabled={busy===item.id} onClick={()=>remove(item.id)} className="inline-flex items-center gap-1 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700"><Trash2 size={14}/> حذف</button>
                                </div>
                            </article>
                        ))}
                     </div>}
                </section>

                <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white">
                    <div className="border-b border-slate-100 p-5">
                        <h2 className="font-black text-[#173f38]">رزروهای آینده</h2>
                    </div>
                    {upcoming.length === 0 ? <p className="p-10 text-center text-sm text-slate-500">رزرو فعالی ندارید.</p> :
                    <div className="divide-y divide-slate-100">
                        {upcoming.map((item)=>(
                            <article key={item.public_id} className="p-5">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <p className="font-black text-[#294e46]">{item.legal_request?.title || 'مشاوره حقوقی'}</p>
                                        <p className="mt-2 text-xs text-slate-500">{item.client?.name || 'موکل'} • {formatDate(item.scheduled_start_at)} • {item.duration_minutes} دقیقه</p>
                                    </div>
                                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">{statusLabel[item.status] || item.status}</span>
                                </div>
                            </article>
                        ))}
                    </div>}
                </section>
            </div>
        </main>
    );
}
