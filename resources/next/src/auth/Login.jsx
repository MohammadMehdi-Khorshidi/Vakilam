'use client';

import { Vazirmatn } from 'next/font/google';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { dashboardPathForUser } from '@/lib/api/client';
import { useAuth } from '@/auth/AuthProvider';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

const LoginUi = () => {
    const router = useRouter();
    const { login } = useAuth();
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleLogin(e) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const user = await login({ phone, password });
            router.replace(dashboardPathForUser(user));
            router.refresh();
        } catch (err) {
            setError(err.message || 'ورود ناموفق بود.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div
            dir="rtl"
            className="w-full max-w-[535px] rounded-[22px] border border-[#dfe7e4] bg-white px-5 py-7 shadow-[0_15px_40px_rgba(18,60,53,0.08)] sm:px-8 sm:py-9"
        >
            <header className={`${vazir.className} text-center`}>
                <h1 className="text-[22px] font-extrabold leading-9 text-[#123c35] sm:text-[25px]">
                    ورود به حساب کاربری
                </h1>

                <p className="mt-2.5 text-[13px] font-medium leading-6 text-[#7c8985] sm:text-[14px]">
                    شماره موبایل و رمز عبور خود را وارد کنید.
                </p>
            </header>

            <form onSubmit={handleLogin} className={`${vazir.className} mt-7 space-y-5`}>
                {/* شماره موبایل */}

                <div>
                    <label
                        htmlFor="phone"
                        className="mb-2 block text-[13px] font-bold text-[#123c35]"
                    >
                        شماره موبایل
                    </label>

                    <input
                        id="phone"
                        name="phone"
                        type="tel"
                        inputMode="numeric"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                        autoComplete="tel"
                        placeholder="مثلاً 09123456789"
                        className="h-[52px] w-full rounded-[13px] border border-[#dfe7e4] bg-[#fafcfb] px-4 text-[14px] text-[#123c35] outline-none transition focus:border-[#1c554a] focus:ring-2 focus:ring-[#1c554a]/10"
                    />
                </div>

                {/* رمز عبور */}

                <div>
                    <label
                        htmlFor="password"
                        className="mb-2 block text-[13px] font-bold text-[#123c35]"
                    >
                        رمز عبور
                    </label>

                    <input
                        id="password"
                        name="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        placeholder="رمز عبور خود را وارد کنید"
                        className="h-[52px] w-full rounded-[13px] border border-[#dfe7e4] bg-[#fafcfb] px-4 text-[14px] text-[#123c35] outline-none transition focus:border-[#1c554a] focus:ring-2 focus:ring-[#1c554a]/10"
                    />

                    <div className="mt-2 flex justify-start">
                        <Link
                            href="/forgot-password"
                            className={`${vazir.className} text-[12px] font-bold text-[#123c35] transition hover:text-[#c9a96e]`}
                        >
                            رمز عبورم را فراموش کرده‌ام
                        </Link>
                    </div>
                </div>

                {/* دکمه ورود */}

                <button
                    type="submit"
                    disabled={loading}
                    className="h-[52px] w-full rounded-[13px] bg-[#123c35] text-[14px] font-bold text-white transition hover:bg-[#1c554a] active:scale-[0.99]"
                >
                    {loading ? "در حال ورود..." : "ورود"}
                </button>
                {error && <p className="text-center text-sm text-red-600">{error}</p>}
            </form>

            <p className={`${vazir.className} mt-5 text-center text-[13px] text-[#7c8985]`}>
                حساب کاربری ندارید؟
                <Link
                    href="/register"
                    className="mr-1 font-bold text-[#123c35] hover:text-[#c9a96e]"
                >
                    ثبت نام کنید
                </Link>
            </p>
        </div>
    );
};

export default LoginUi;
