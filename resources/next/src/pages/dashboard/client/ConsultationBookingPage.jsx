'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CalendarDays, Check, Clock3, Star, X } from 'lucide-react';
import { Vazirmatn } from 'next/font/google';

import {
    getConsultationLawyers,
    getConsultationSlots,
    reserveConsultation,
} from '@/lib/api/consultations';

const vazir = Vazirmatn({ subsets: ['arabic'], weight: ['400','500','600','700','800'] });
const DURATIONS = [15,30,45,60];

function dayKey(value) {
    return new Date(value).toISOString().slice(0,10);
}

function formatDay(value) {
    return new Intl.DateTimeFormat('fa-IR', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    }).format(new Date(value));
}

function formatTime(value) {
    return new Intl.DateTimeFormat('fa-IR', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value));
}

export default function ConsultationBookingPage() {
    const params = useSearchParams();
    const router = useRouter();
    const legalRequestId = params.get('legal_request_id');

    const [lawyers, setLawyers] = useState([]);
    const [selectedLawyer, setSelectedLawyer] = useState(null);
    const [duration, setDuration] = useState(30);
    const [slots, setSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [loading, setLoading] = useState(true);
    const [slotLoading, setSlotLoading] = useState(false);
    const [booking, setBooking] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!legalRequestId) {
            setError('شناسه درخواست مشاوره مشخص نیست.');
            setLoading(false);
            return;
        }

        getConsultationLawyers(legalRequestId)
            .then((response) => setLawyers(response?.data ?? []))
            .catch((e) => setError(e?.message || 'دریافت وکلا انجام نشد.'))
            .finally(() => setLoading(false));
    }, [legalRequestId]);

    const loadSlots = useCallback(async (lawyer, nextDuration = duration) => {
        if (!lawyer || !legalRequestId) return;
        setSlotLoading(true);
        setSelectedSlot(null);
        setError('');
        try {
            const data = await getConsultationSlots(
                legalRequestId,
                lawyer.public_id,
                nextDuration,
            );
            setSlots(data ?? []);
        } catch (e) {
            setSlots([]);
            setError(e?.message || 'دریافت زمان‌های آزاد انجام نشد.');
        } finally {
            setSlotLoading(false);
        }
    }, [duration, legalRequestId]);

    function openLawyer(item) {
        const lawyer = item.lawyer;
        setSelectedLawyer(lawyer);
        setDuration(30);
        setSlots([]);
        setSelectedSlot(null);
        loadSlots(lawyer, 30);
    }

    async function changeDuration(value) {
        setDuration(value);
        await loadSlots(selectedLawyer, value);
    }

    const grouped = useMemo(() => {
        const map = new Map();
        slots.forEach((slot) => {
            const key = dayKey(slot.starts_at);
            if (!map.has(key)) map.set(key, []);
            map.get(key).push(slot);
        });
        return Array.from(map.entries());
    }, [slots]);

    async function confirmBooking() {
        if (!selectedLawyer || !selectedSlot || booking) return;

        setBooking(true);
        setError('');
        try {
            await reserveConsultation(legalRequestId, {
                lawyer_public_id: selectedLawyer.public_id,
                starts_at: selectedSlot.starts_at,
                duration_minutes: duration,
            });
            router.push('/client/consultations');
        } catch (e) {
            setError(e?.validationMessages?.[0] || e?.message || 'رزرو انجام نشد.');
            await loadSlots(selectedLawyer, duration);
        } finally {
            setBooking(false);
        }
    }

    return (
        <main dir="rtl" className={`${vazir.className} min-h-screen bg-[#f6f9f7] px-4 py-8 sm:px-6 lg:px-10`}>
            <div className="mx-auto max-w-[1180px]">
                <header>
                    <p className="text-sm font-bold text-[#a47b2c]">رزرو مشاوره</p>
                    <h1 className="mt-2 text-3xl font-black text-[#173f38]">انتخاب وکیل و زمان مشاوره</h1>
                    <p className="mt-2 text-sm leading-7 text-slate-500">
                        وکلا بر اساس موضوع و موقعیت درخواست شما مرتب شده‌اند. قبل از رزرو، زمان‌های آزاد واقعی وکیل را ببینید.
                    </p>
                    <p className="mt-2 text-xs font-bold text-amber-700">رزرو فقط تا حداقل ۶۰ دقیقه قبل از شروع جلسه ممکن است.</p>
                </header>

                {error ? <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div> : null}

                {loading ? <div className="mt-6 rounded-2xl border bg-white p-12 text-center text-slate-500">در حال دریافت وکلا...</div> :
                lawyers.length === 0 ? <div className="mt-6 rounded-2xl border bg-white p-12 text-center text-slate-500">وکیل مناسبی برای این درخواست پیدا نشد.</div> :
                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {lawyers.map((item)=> {
                        const lawyer = item.lawyer ?? {};
                        return (
                            <article key={lawyer.public_id} className="rounded-3xl border border-slate-200 bg-white p-5">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-bold text-[#a47b2c]">پیشنهاد #{item.rank}</p>
                                        <h2 className="mt-2 text-lg font-black text-[#173f38]">{lawyer.full_name || 'وکیل'}</h2>
                                    </div>
                                    {lawyer.average_rating ? <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700"><Star size={13}/>{lawyer.average_rating}</span> : null}
                                </div>
                                {lawyer.specialties?.length ? <p className="mt-3 line-clamp-2 text-xs leading-6 text-slate-500">{lawyer.specialties.map((s)=>s.name).filter(Boolean).join('، ')}</p> : null}
                                <button type="button" onClick={()=>openLawyer(item)} className="mt-5 w-full rounded-xl bg-[#173f38] px-4 py-3 text-sm font-black text-white">
                                    مشاهده زمان‌های آزاد
                                </button>
                            </article>
                        );
                    })}
                </div>}
            </div>

            {selectedLawyer ? (
                <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]">
                    <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-bold text-[#a47b2c]">انتخاب زمان</p>
                                <h2 className="mt-1 text-xl font-black text-[#173f38]">{selectedLawyer.full_name}</h2>
                            </div>
                            <button type="button" onClick={()=>setSelectedLawyer(null)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X size={20}/></button>
                        </div>

                        <div className="mt-5">
                            <p className="text-xs font-bold text-slate-600">مدت مشاوره</p>
                            <div className="mt-2 grid grid-cols-4 gap-2">
                                {DURATIONS.map((item)=>(
                                    <button key={item} type="button" onClick={()=>changeDuration(item)} className={`rounded-xl border px-2 py-3 text-xs font-black ${duration===item?'border-[#c7a154] bg-[#fff8e7] text-[#6e541d]':'border-slate-200 text-slate-500'}`}>
                                        {item} دقیقه
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mt-5">
                            {slotLoading ? <div className="rounded-xl bg-slate-50 p-10 text-center text-sm text-slate-500">در حال دریافت زمان‌های آزاد...</div> :
                            grouped.length === 0 ? <div className="rounded-xl bg-slate-50 p-10 text-center text-sm text-slate-500">برای این مدت، زمان آزادی در ۳۰ روز آینده وجود ندارد.</div> :
                            <div className="space-y-4">
                                {grouped.map(([key, items])=>(
                                    <section key={key} className="rounded-2xl border border-slate-200 p-4">
                                        <div className="flex items-center gap-2 font-black text-[#294e46]"><CalendarDays size={17}/>{formatDay(items[0].starts_at)}</div>
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {items.map((slot)=> {
                                                const active = selectedSlot?.starts_at === slot.starts_at;
                                                return (
                                                    <button key={slot.starts_at} type="button" onClick={()=>setSelectedSlot(slot)} className={`inline-flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-xs font-black ${active?'border-[#17634f] bg-[#edf7f3] text-[#17634f]':'border-slate-200 text-slate-600 hover:border-[#9dbbb3]'}`}>
                                                        {active ? <Check size={13}/> : <Clock3 size={13}/>}
                                                        {formatTime(slot.starts_at)}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </section>
                                ))}
                            </div>}
                        </div>

                        {selectedSlot ? (
                            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                                <p className="font-black text-emerald-800">خلاصه رزرو</p>
                                <p className="mt-2 text-sm leading-7 text-emerald-700">
                                    {selectedLawyer.full_name} • {formatDay(selectedSlot.starts_at)} ساعت {formatTime(selectedSlot.starts_at)} • {duration} دقیقه
                                </p>
                                <button type="button" disabled={booking} onClick={confirmBooking} className="mt-3 w-full rounded-xl bg-[#17634f] px-5 py-3 text-sm font-black text-white disabled:opacity-50">
                                    {booking ? 'در حال رزرو...' : 'تأیید رزرو'}
                                </button>
                            </div>
                        ) : null}
                    </div>
                </div>
            ) : null}
        </main>
    );
}
