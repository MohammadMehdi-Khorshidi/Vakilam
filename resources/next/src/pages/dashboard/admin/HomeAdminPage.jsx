'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { getAdminDashboard } from '@/lib/api/admin';

const card = 'rounded-2xl border border-[#dce6e2] bg-white p-5 shadow-[0_8px_28px_rgba(13,51,44,0.045)]';

export default function HomeAdminPage() {
    const [data, setData] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        getAdminDashboard()
            .then(setData)
            .catch((e) => setError(e.message || 'دریافت اطلاعات مدیریت ناموفق بود.'));
    }, []);

    if (!data && !error) {
        return <div className="p-8 text-sm text-[#60756f]">در حال دریافت اطلاعات واقعی سامانه...</div>;
    }

    if (error) {
        return <div className="m-6 rounded-2xl border border-red-100 bg-white p-6 text-sm text-red-600">{error}</div>;
    }

    const stats = data.stats ?? {};

    return (
        <div dir="rtl" className="mx-auto w-full max-w-[1500px] px-5 py-7">
            <section className="rounded-[24px] border border-[#d8e4df] bg-[radial-gradient(circle_at_10%_0,#c9a96e24,transparent_26%),linear-gradient(145deg,#174b42,#0e332d)] p-7 text-white">
                <p className="text-xs font-bold text-[#dbc48e]">وکیلم · پنل مدیریت واقعی</p>
                <h1 className="mt-2 text-3xl font-black">مرکز مدیریت وکیلم</h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70">
                    این صفحه مستقیماً از دیتابیس پروژه خوانده می‌شود و فقط بخش‌های آماده نسخه فعلی را نشان می‌دهد.
                </p>
            </section>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                {[
                    ['کاربران فعال', stats.active_users],
                    ['کاربران تعلیق‌شده', stats.suspended_users],
                    ['وکلا در انتظار بررسی', stats.pending_lawyers],
                    ['درخواست‌های حقوقی', stats.legal_requests],
                    ['مشاوره‌ها', stats.consultations],
                ].map(([label, value]) => (
                    <div key={label} className={card}>
                        <p className="text-xs font-bold text-[#7a8a84]">{label}</p>
                        <p className="mt-3 text-3xl font-black text-[#174c42]">{Number(value ?? 0).toLocaleString('fa-IR')}</p>
                    </div>
                ))}
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-2">
                <section className={card}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="font-black text-[#173f38]">وکلا در انتظار بررسی</h2>
                            <p className="mt-1 text-xs text-[#82908b]">از اطلاعات واقعی احراز وکیل</p>
                        </div>
                        <Link href="/admin/lawyersAdmin" className="text-xs font-black text-[#9b762e]">مشاهده همه</Link>
                    </div>
                    <div className="mt-4">
                        {(data.pending_lawyers ?? []).length ? data.pending_lawyers.map((item) => (
                            <div key={item.id} className="flex items-center justify-between border-b border-[#edf2ef] py-3 last:border-0">
                                <div>
                                    <p className="text-sm font-extrabold text-[#294f46]">{item.full_name || 'وکیل بدون نام'}</p>
                                    <p className="mt-1 text-xs text-[#84928d]">پروانه: {item.license_number || 'ثبت نشده'}</p>
                                </div>
                                <span className="rounded-full bg-[#fff5dc] px-3 py-1 text-[11px] font-black text-[#8a671d]">در انتظار</span>
                            </div>
                        )) : <p className="py-8 text-center text-sm text-[#87958f]">موردی برای بررسی نیست.</p>}
                    </div>
                </section>

                <section className={card}>
                    <h2 className="font-black text-[#173f38]">آخرین فعالیت‌های مدیریتی</h2>
                    <p className="mt-1 text-xs text-[#82908b]">تمام اکشن‌های حساس ثبت می‌شوند.</p>
                    <div className="mt-4">
                        {(data.recent_actions ?? []).length ? data.recent_actions.map((item) => (
                            <div key={item.id} className="border-b border-[#edf2ef] py-3 last:border-0">
                                <p className="text-sm font-bold text-[#31564d]">{item.action_type}</p>
                                <p className="mt-1 text-xs text-[#899691]">{item.admin?.name || 'مدیر'} · {item.reason || 'بدون توضیح'}</p>
                            </div>
                        )) : <p className="py-8 text-center text-sm text-[#87958f]">هنوز فعالیتی ثبت نشده است.</p>}
                    </div>
                </section>
            </div>
        </div>
    );
}
