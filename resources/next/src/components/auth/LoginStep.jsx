'use client';

import { useState } from 'react';

const normalizeDigits = (value) =>
    value
        .replace(/[۰-۹]/g, (digit) =>
            String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit))
        )
        .replace(/[٠-٩]/g, (digit) =>
            String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit))
        );

export default function LoginStep({
    phone,
    setPhone,
    onSubmit,
    onGoToRegister,
    loading = false,
    externalError = '',
}) {
    const [error, setError] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();

        const normalizedPhone = normalizeDigits(phone).replace(/\D/g, '');

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
                    ورود به حساب کاربری
                </h1>

                <p className="mt-3 text-sm text-[#8a9591]">
                    شماره موبایل خود را وارد کنید تا کد ورود برای شما ارسال شود.
                </p>
            </header>

            <form
                onSubmit={handleSubmit}
                className="mt-8 space-y-5"
                noValidate
            >
                <div>
                    <label
                        htmlFor="login-phone"
                        className="mb-2 block text-sm font-bold text-[#17483f]"
                    >
                        شماره موبایل
                    </label>

                    <input
                        id="login-phone"
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel"
                        value={phone}
                        onChange={(event) => {
                            setPhone(event.target.value);
                            if (error) setError('');
                        }}
                        placeholder="مثلاً 09123456789"
                        className="h-14 w-full rounded-2xl border border-[#dfe7e4] bg-[#f7f9ff] px-5 text-left text-sm text-[#123c35] outline-none transition placeholder:text-[#a3aca9] focus:border-[#28685c] focus:ring-4 focus:ring-[#28685c]/10"
                        dir="ltr"
                    />
                </div>

                {(error || externalError) && (
                    <p
                        role="alert"
                        className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
                    >
                        {error || externalError}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="h-14 w-full rounded-2xl bg-[#155447] text-sm font-extrabold text-white transition hover:bg-[#1c6557] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? 'در حال بررسی...' : 'دریافت کد ورود'}
                </button>
            </form>

            <p className="mt-5 text-center text-xs leading-6 text-[#9aa39f]">
                اگر حساب نداشته باشید، وارد بخش ثبت‌نام می‌شوید.
            </p>

            <p className="mt-6 text-center text-sm text-[#8a9591]">
                حساب کاربری ندارید؟{' '}
                <button
                    type="button"
                    onClick={onGoToRegister}
                    className="font-extrabold text-[#28685c] underline decoration-[#c5a35a] decoration-2 underline-offset-4"
                >
                    ثبت‌نام کنید
                </button>
            </p>
        </section>
    );
}
