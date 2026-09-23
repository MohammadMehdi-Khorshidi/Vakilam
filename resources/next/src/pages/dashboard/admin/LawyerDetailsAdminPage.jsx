'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, BadgeCheck, MapPin, Star, UserRound } from 'lucide-react';

import { getAdminLawyer } from '@/lib/api/admin';
import { faDate, statusLabel } from '@/features/admin/shared/adminFormat';

export default function LawyerDetailsAdminPage({ lawyerId }) {
    const [lawyer, setLawyer] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        getAdminLawyer(lawyerId)
            .then(setLawyer)
            .catch((err) => setError(err.message));
    }, [lawyerId]);

    if (error) {
        return <div className="m-6 rounded-2xl border border-red-100 bg-white p-6 text-sm text-red-600">{error}</div>;
    }

    if (!lawyer) {
        return <div className="p-8 text-sm text-[#71827c]">در حال دریافت پروفایل وکیل...</div>;
    }

    return (
        <div dir="rtl" className="mx-auto w-full max-w-[1300px] px-5 py-7">
            <Link href="/admin/lawyersAdmin" className="inline-flex items-center gap-2 text-sm font-black text-[#9b762e]">
                <ArrowRight size={17} /> بازگشت به بررسی وکلا
            </Link>

            <section className="mt-5 rounded-[24px] border border-[#dce6e2] bg-white p-6 shadow-sm">
                <div className="flex flex-col justify-between gap-5 lg:flex-row">
                    <div className="flex items-start gap-4">
                        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#174c42] text-[#e1c477]">
                            <UserRound size={27} />
                        </span>
                        <div>
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-2xl font-black text-[#10382f]">{lawyer.full_name || 'بدون نام'}</h1>
                                <span className="rounded-full bg-[#eef6f3] px-3 py-1 text-xs font-black text-[#31564d]">
                                    {statusLabel(lawyer.verification_status)}
                                </span>
                            </div>
                            <p className="mt-2 text-sm text-[#71827c]">
                                شماره پروانه: {lawyer.license_number || 'ثبت نشده'}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3 text-xs">
                        <div className="rounded-xl bg-[#f7faf8] px-4 py-3">
                            <p className="text-[#87958f]">امتیاز</p>
                            <p className="mt-1 flex items-center gap-1 font-black text-[#31564d]"><Star size={14}/>{lawyer.average_rating || '—'}</p>
                        </div>
                        <div className="rounded-xl bg-[#f7faf8] px-4 py-3">
                            <p className="text-[#87958f]">وضعیت حساب</p>
                            <p className="mt-1 font-black text-[#31564d]">{statusLabel(lawyer.user?.status)}</p>
                        </div>
                    </div>
                </div>
            </section>

            <div className="mt-5 grid gap-5 xl:grid-cols-2">
                <section className="rounded-2xl border border-[#dce6e2] bg-white p-5 shadow-sm">
                    <h2 className="font-black text-[#174c42]">اطلاعات حساب</h2>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {[
                            ['نام و نام خانوادگی', lawyer.user?.name || lawyer.full_name],
                            ['شماره موبایل', lawyer.user?.phone],
                            ['ایمیل', lawyer.user?.email],
                            ['آخرین ورود', faDate(lawyer.user?.last_login_at)],
                            ['تاریخ عضویت', faDate(lawyer.user?.created_at)],
                            ['دسترسی پذیرش پرونده', lawyer.is_available ? 'فعال' : 'غیرفعال'],
                        ].map(([label, value]) => (
                            <div key={label} className="rounded-xl bg-[#f7faf8] p-3">
                                <p className="text-[11px] text-[#87958f]">{label}</p>
                                <p className="mt-1 text-sm font-bold text-[#31564d]">{value || '—'}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4">
                        <p className="text-xs font-black text-[#536b64]">معرفی وکیل</p>
                        <p className="mt-2 rounded-xl bg-[#f7faf8] p-4 text-sm leading-7 text-[#60736d]">
                            {lawyer.bio || 'متن معرفی ثبت نشده است.'}
                        </p>
                    </div>
                </section>

                <section className="rounded-2xl border border-[#dce6e2] bg-white p-5 shadow-sm">
                    <h2 className="font-black text-[#174c42]">تخصص و محدوده فعالیت</h2>

                    <div className="mt-4">
                        <p className="text-xs font-black text-[#536b64]">تخصص‌ها</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {(lawyer.specialty_details ?? []).length ? lawyer.specialty_details.map((item) => (
                                <span key={item.id} className="rounded-full border border-[#dce6e2] bg-[#f8faf9] px-3 py-2 text-xs font-bold text-[#31564d]">
                                    {item.name} {item.years_experience ? `· ${Number(item.years_experience).toLocaleString('fa-IR')} سال سابقه` : ''}
                                </span>
                            )) : <span className="text-sm text-[#83908c]">تخصصی ثبت نشده است.</span>}
                        </div>
                    </div>

                    <div className="mt-5">
                        <p className="flex items-center gap-1 text-xs font-black text-[#536b64]"><MapPin size={14}/> محدوده‌های خدمت</p>
                        <div className="mt-2 grid gap-2 sm:grid-cols-2">
                            {(lawyer.service_areas ?? []).length ? lawyer.service_areas.map((area) => (
                                <div key={area.id} className="rounded-xl bg-[#f7faf8] px-3 py-3 text-sm font-bold text-[#31564d]">
                                    {area.province || '—'}{area.city ? ` · ${area.city}` : ' · کل استان'}
                                </div>
                            )) : <span className="text-sm text-[#83908c]">محدوده فعالیت ثبت نشده است.</span>}
                        </div>
                    </div>
                </section>
            </div>

            <section className="mt-5 rounded-2xl border border-[#dce6e2] bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2">
                    <BadgeCheck size={19} className="text-[#9b762e]" />
                    <h2 className="font-black text-[#174c42]">سوابق احراز هویت وکالت</h2>
                </div>

                <div className="mt-4 grid gap-3">
                    {(lawyer.verifications ?? []).length ? lawyer.verifications.map((item) => (
                        <article key={item.id} className="grid gap-4 rounded-2xl border border-[#e2e9e6] bg-[#fbfdfc] p-4 md:grid-cols-[180px_1fr]">
                            <div>
                                <span className="rounded-full bg-[#eef6f3] px-3 py-1 text-xs font-black text-[#31564d]">
                                    {statusLabel(item.status)}
                                </span>
                                <p className="mt-3 text-xs text-[#81908b]">ارسال: {faDate(item.submitted_at)}</p>
                                <p className="mt-1 text-xs text-[#81908b]">بررسی: {faDate(item.reviewed_at)}</p>
                            </div>
                            <div>
                                <p className="text-xs font-black text-[#536b64]">یادداشت مدیر</p>
                                <p className="mt-2 text-sm leading-7 text-[#60736d]">{item.review_note || 'یادداشتی ثبت نشده است.'}</p>
                                {item.reviewer ? <p className="mt-2 text-xs text-[#8b9894]">بررسی‌کننده: {item.reviewer}</p> : null}
                            </div>
                        </article>
                    )) : <p className="py-6 text-center text-sm text-[#83908c]">سابقه احراز ثبت نشده است.</p>}
                </div>
            </section>
        </div>
    );
}
