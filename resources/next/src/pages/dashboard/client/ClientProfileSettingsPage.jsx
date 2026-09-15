'use client';

import { useEffect, useState } from 'react';
import { CircleUserRound, ShieldCheck } from 'lucide-react';
import { Vazirmatn } from 'next/font/google';

import { apiRequest, unwrapData } from '@/lib/api/client';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

export default function ClientProfileSettingsPage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        apiRequest('user')
            .then((payload) => setUser(unwrapData(payload) ?? payload))
            .catch((e) => setError(e?.message || 'دریافت اطلاعات حساب انجام نشد.'))
            .finally(() => setLoading(false));
    }, []);

    return (
        <main dir="rtl" className={`${vazir.className} min-h-screen bg-[#f7faf8] px-5 py-8 lg:px-8`}>
            <div className="mx-auto max-w-[1000px]">
                <header className="mb-6">
                    <h1 className="text-2xl font-extrabold text-[#173f38]">پروفایل و تنظیمات</h1>
                    <p className="mt-2 text-sm leading-7 text-[#71817c]">
                        اطلاعات حساب کاربری و وضعیت امنیت ورود شما.
                    </p>
                </header>

                {loading ? (
                    <div className="rounded-[18px] border border-[#dfe7e3] bg-white py-14 text-center text-[#899691]">
                        در حال دریافت اطلاعات...
                    </div>
                ) : error ? (
                    <div className="rounded-[18px] border border-red-200 bg-red-50 p-5 text-sm font-bold text-red-700">
                        {error}
                    </div>
                ) : (
                    <div className="space-y-5">
                        <section className="rounded-[18px] border border-[#dfe7e3] bg-white p-5 md:p-6">
                            <div className="flex items-start gap-3">
                                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eff8f4] text-[#17634f]">
                                    <CircleUserRound size={19} />
                                </span>
                                <div>
                                    <h2 className="font-extrabold text-[#173f38]">اطلاعات حساب</h2>
                                    <p className="mt-1 text-xs leading-6 text-[#7d8a86]">اطلاعات هویتی فعلی حساب شما.</p>
                                </div>
                            </div>

                            <div className="mt-5 grid gap-4 md:grid-cols-2">
                                <Info label="نام" value={user?.name || '—'} />
                                <Info label="نام خانوادگی" value={user?.last_name || '—'} />
                                <Info label="شماره موبایل" value={user?.phone || '—'} />
                                <Info label="ایمیل" value={user?.email || 'ثبت نشده'} />
                            </div>
                        </section>

                        <section className="rounded-[18px] border border-[#d6e7e0] bg-[#eff8f4] p-5 md:p-6">
                            <div className="flex items-start gap-3">
                                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#17634f]">
                                    <ShieldCheck size={19} />
                                </span>
                                <div>
                                    <h2 className="font-extrabold text-[#173f38]">امنیت حساب</h2>
                                    <p className="mt-2 text-sm leading-7 text-[#60736d]">
                                        ورود حساب با شماره موبایل و احراز هویت انجام می‌شود. اطلاعات حساس حساب از این صفحه قابل تغییر مستقیم نیست.
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </main>
    );
}

function Info({ label, value }) {
    return (
        <div className="rounded-xl border border-[#e3ebe8] bg-[#fbfdfc] p-4">
            <p className="text-xs font-bold text-[#81908b]">{label}</p>
            <p className="mt-2 font-extrabold text-[#294e46]">{value}</p>
        </div>
    );
}
