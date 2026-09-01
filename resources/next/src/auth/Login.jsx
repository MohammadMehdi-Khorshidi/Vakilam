'use client';

import { Vazirmatn } from 'next/font/google';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

const LoginUi = () => {
    const router = useRouter();

    const [form, setForm] = useState({
        phone: '',
        password: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError('');

        if (!form.phone.trim()) {
            setError('لطفاً شماره موبایل خود را وارد کنید.');
            return;
        }

        if (!form.password) {
            setError('لطفاً رمز عبور خود را وارد کنید.');
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                'http://127.0.0.1:8000/api/auth/login',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                    body: JSON.stringify({
                        phone: form.phone,
                        password: form.password,
                    }),
                },
            );

            const data = await response.json();

            console.log('Login Response:', data);

            if (!response.ok) {
                setError(
                    data.message || 'شماره موبایل یا رمز عبور اشتباه است.',
                );
                return;
            }

            /*
             * اگر API توکن برگرداند،
             * فعلاً آن را ذخیره می‌کنیم.
             */
            if (data.token) {
                localStorage.setItem('token', data.token);
            }

            /*
             * اگر توکن داخل data.data باشد
             */
            if (data.data?.token) {
                localStorage.setItem('token', data.data.token);
            }

            // بعداً مسیر داشبورد را بر اساس role تنظیم می‌کنیم
            router.push('/dashboard');
        } catch (error) {
            console.error('Login Error:', error);

            setError('ارتباط با سرور برقرار نشد.');
        } finally {
            setLoading(false);
        }
    };

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

            <form
                onSubmit={handleSubmit}
                className={`${vazir.className} mt-7 space-y-5`}
            >
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
                        placeholder="مثلاً 09123456789"
                        value={form.phone}
                        onChange={handleChange}
                        className="h-[52px] w-full rounded-[13px] border border-[#dfe7e4] bg-[#fafcfb] px-4 text-[14px] text-[#123c35] outline-none focus:border-[#1c554a] focus:ring-2 focus:ring-[#1c554a]/10"
                    />
                </div>

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
                        placeholder="رمز عبور خود را وارد کنید"
                        value={form.password}
                        onChange={handleChange}
                        className="h-[52px] w-full rounded-[13px] border border-[#dfe7e4] bg-[#fafcfb] px-4 text-[14px] text-[#123c35] outline-none focus:border-[#1c554a] focus:ring-2 focus:ring-[#1c554a]/10"
                    />
                    <div className="flex justify-start">
                        <button
                            type="button"
                            onClick={() => router.push('/forgot-password')}
                            className={`${vazir.className} text-[12px] font-bold text-[#123c35] transition hover:text-[#c9a96e]`}
                        >
                            رمز عبورم را فراموش کرده‌ام
                        </button>
                    </div>
                </div>

                {error && (
                    <p className="text-center text-[13px] font-medium text-red-500">
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="h-[52px] w-full rounded-[13px] bg-[#123c35] text-[14px] font-bold text-white transition hover:bg-[#1c554a] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? 'در حال ورود...' : 'ورود'}
                </button>
            </form>
        </div>
    );
};

export default LoginUi;
