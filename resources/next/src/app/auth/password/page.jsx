'use client';

import { Vazirmatn } from 'next/font/google';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

export default function PasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const role = searchParams.get('role');
    const phone = searchParams.get('phone');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        setError('');

        // بررسی حداقل طول رمز
        if (password.length < 6) {
            setError('رمز عبور باید حداقل ۶ کاراکتر باشد.');
            return;
        }

        // بررسی یکسان بودن رمزها
        if (password !== confirmPassword) {
            setError('رمز عبور و تکرار آن یکسان نیستند.');
            return;
        }

        // اطلاعات کاربر
        console.log({
            phone,
            role,
            password,
        });

        if (role === 'client') {
            router.push('/client');
            return;
        }

        if (role === 'lawyer') {
            router.push('/lawyer');
            return;
        }

        if (role === 'admin') {
            router.push('/admin');
            return;
        }

        setError('نقش کاربر مشخص نیست.');
    };

    const handleLogin = () => {
        router.push('/auth/login');
    };

    const handleForgotPassword = () => {
        router.push('/auth/forgot-password');
    };

    return (
        <div
            dir="rtl"
            className={`${vazir.className} flex min-h-screen items-center justify-center bg-[#f8faf9] px-5 py-10`}
        >
            <div className="w-full max-w-[535px] rounded-[22px] border border-[#dfe7e4] bg-white px-5 py-8 shadow-[0_15px_40px_rgba(18,60,53,0.08)] sm:px-8 sm:py-9">
                <div className="text-center">
                    <h1 className="text-[22px] font-extrabold text-[#123c35] sm:text-[25px]">
                        ایجاد رمز عبور
                    </h1>

                    <p className="mt-2.5 text-[13px] leading-6 text-[#7c8985] sm:text-[14px]">
                        برای حساب کاربری خود یک رمز عبور انتخاب کنید.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-7 space-y-5">
                    <div>
                        <label
                            htmlFor="password"
                            className="mb-2 block text-[13px] font-bold text-[#123c35]"
                        >
                            رمز عبور
                        </label>

                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError('');
                            }}
                            placeholder="رمز عبور خود را وارد کنید"
                            required
                            autoComplete="new-password"
                            className="h-[52px] w-full rounded-[13px] border border-[#dfe7e4] bg-[#fafcfb] px-4 text-[14px] text-[#123c35] outline-none transition placeholder:text-[#a0aaa7] focus:border-[#1c554a] focus:ring-2 focus:ring-[#1c554a]/10"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="confirmPassword"
                            className="mb-2 block text-[13px] font-bold text-[#123c35]"
                        >
                            تکرار رمز عبور
                        </label>

                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => {
                                setConfirmPassword(e.target.value);
                                setError('');
                            }}
                            placeholder="رمز عبور را دوباره وارد کنید"
                            required
                            autoComplete="new-password"
                            className="h-[52px] w-full rounded-[13px] border border-[#dfe7e4] bg-[#fafcfb] px-4 text-[14px] text-[#123c35] outline-none transition placeholder:text-[#a0aaa7] focus:border-[#1c554a] focus:ring-2 focus:ring-[#1c554a]/10"
                        />
                    </div>

                    {error && (
                        <div className="rounded-[12px] bg-red-50 px-4 py-3 text-center text-[12px] font-medium leading-5 text-red-600">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="h-[52px] w-full rounded-[13px] bg-[#123c35] text-[14px] font-bold text-white transition hover:bg-[#1c554a] active:scale-[0.99]"
                    >
                        ثبت رمز عبور
                    </button>
                </form>

                <button
                    type="button"
                    onClick={handleLogin}
                    className="mt-5 w-full text-center text-[12px] font-bold text-[#c9a96e] hover:underline"
                >
                    ورود به حساب کاربری
                </button>

                <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="mt-3 w-full text-center text-[12px] font-bold text-[#7c8985] hover:text-[#123c35] hover:underline"
                >
                    فراموشی رمز عبور
                </button>
            </div>
        </div>
    );
}
