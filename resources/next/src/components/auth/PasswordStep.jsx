'use client';

import { useState } from 'react';

import AuthProgress from './AuthProgress';

export default function PasswordStep({
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    onSubmit,
    onBack,
    loading = false,
    externalError = '',
}) {
    const [error, setError] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();

        if (password.length < 8) {
            setError('رمز عبور باید حداقل ۸ کاراکتر باشد.');
            return;
        }

        if (password !== confirmPassword) {
            setError('تکرار رمز عبور با رمز عبور یکسان نیست.');
            return;
        }

        setError('');
        onSubmit();
    };

    const updatePassword = (value) => {
        setPassword(value);
        if (error) setError('');
    };

    const updateConfirmation = (value) => {
        setConfirmPassword(value);
        if (error) setError('');
    };

    return (
        <section className="rounded-[24px] border border-[#e4e9e7] bg-white px-5 py-8 shadow-[0_22px_60px_rgba(8,35,31,0.08)] sm:px-10 sm:py-10">
            <header className="text-center">
                <h1 className="text-2xl font-extrabold text-[#123c35] sm:text-[28px]">
                    ایجاد حساب کاربری
                </h1>
                <p className="mt-3 text-sm text-[#8a9591]">انتخاب رمز عبور</p>
            </header>

            <AuthProgress currentStep={4} totalSteps={4} />

            <p className="mt-8 text-center text-sm leading-7 text-[#8a9591]">
                برای حساب کاربری خود یک رمز عبور با حداقل ۸ کاراکتر انتخاب
                کنید.
            </p>

            <form onSubmit={handleSubmit} className="mt-7 space-y-5" noValidate>
                <div>
                    <label
                        htmlFor="register-password"
                        className="mb-2 block text-sm font-bold text-[#17483f]"
                    >
                        رمز عبور
                    </label>
                    <input
                        id="register-password"
                        type="password"
                        autoComplete="new-password"
                        value={password}
                        onChange={(event) => updatePassword(event.target.value)}
                        placeholder="حداقل ۸ کاراکتر"
                        className="h-14 w-full rounded-2xl border border-[#dfe7e4] bg-[#fbfcfb] px-5 text-left text-sm text-[#123c35] outline-none transition placeholder:text-right placeholder:text-[#a3aca9] focus:border-[#28685c] focus:ring-4 focus:ring-[#28685c]/10"
                        dir="ltr"
                    />
                </div>

                <div>
                    <label
                        htmlFor="register-password-confirmation"
                        className="mb-2 block text-sm font-bold text-[#17483f]"
                    >
                        تکرار رمز عبور
                    </label>
                    <input
                        id="register-password-confirmation"
                        type="password"
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(event) =>
                            updateConfirmation(event.target.value)
                        }
                        placeholder="رمز عبور را دوباره وارد کنید"
                        className="h-14 w-full rounded-2xl border border-[#dfe7e4] bg-[#fbfcfb] px-5 text-left text-sm text-[#123c35] outline-none transition placeholder:text-right placeholder:text-[#a3aca9] focus:border-[#28685c] focus:ring-4 focus:ring-[#28685c]/10"
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
                    {loading ? 'در حال ثبت‌نام...' : 'تکمیل ثبت‌نام'}
                </button>

                <button
                    type="button"
                    onClick={onBack}
                    disabled={loading}
                    className="w-full text-sm font-bold text-[#697570] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    بازگشت به مرحله قبل
                </button>
            </form>
        </section>
    );
}
