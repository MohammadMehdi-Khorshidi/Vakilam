'use client';

import { useState } from 'react';

import AuthProgress from './AuthProgress';

const normalizeDigits = (value) =>
    value
        .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
        .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
        .replace(/\D/g, '');

export default function PhoneStep({ phone, setPhone, onSubmit, onGoToLogin }) {
    const [error, setError] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();

        const normalizedPhone = normalizeDigits(phone);

        if (!/^09\d{9}$/.test(normalizedPhone)) {
            setError('شماره موبایل را به‌صورت صحیح وارد کنید.');
            return;
        }

        setError('');
        setPhone(normalizedPhone);
        onSubmit(normalizedPhone);
    };

    return (
        <section className="rounded-[24px] border border-[#e4e9e7] bg-white px-5 py-8 shadow-[0_22px_60px_rgba(8,35,31,0.08)] sm:px-10 sm:py-10">
            <header className="text-center">
                <h1 className="text-2xl font-extrabold text-[#123c35] sm:text-[28px]">
                    ایجاد حساب کاربری
                </h1>
                <p className="mt-3 text-sm text-[#8a9591]">شماره موبایل</p>
            </header>

            <AuthProgress currentStep={1} totalSteps={3} />

            <p className="mt-10 text-center text-sm leading-7 text-[#8a9591]">
                برای شروع ثبت‌نام، شماره موبایل خود را وارد کنید.
            </p>

            <form onSubmit={handleSubmit} className="mt-7" noValidate>
                <label
                    htmlFor="register-phone"
                    className="mb-2 block text-sm font-bold text-[#17483f]"
                >
                    شماره موبایل
                </label>
                <input
                    id="register-phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="مثلاً 09123456789"
                    className="h-14 w-full rounded-2xl border border-[#dfe7e4] bg-[#fbfcfb] px-5 text-left text-sm text-[#123c35] outline-none transition placeholder:text-[#a3aca9] focus:border-[#28685c] focus:ring-4 focus:ring-[#28685c]/10"
                    dir="ltr"
                />

                {error && (
                    <p role="alert" className="mt-3 text-sm font-medium text-red-700">
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    className="mt-5 h-14 w-full rounded-2xl bg-[#155447] text-sm font-extrabold text-white transition hover:bg-[#1c6557] active:scale-[0.99]"
                >
                    دریافت کد تأیید
                </button>
            </form>

            <p className="mt-7 text-center text-sm text-[#8a9591]">
                قبلاً ثبت‌نام کرده‌اید؟{' '}
                <button
                    type="button"
                    onClick={onGoToLogin}
                    className="font-extrabold text-[#ad8b43]"
                >
                    ورود
                </button>
            </p>
        </section>
    );
}
