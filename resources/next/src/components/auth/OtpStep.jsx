'use client';

import { useEffect, useState } from 'react';

import AuthProgress from './AuthProgress';

const normalizeDigits = (value) =>
    value
        .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
        .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
        .replace(/\D/g, '')
        .slice(0, 6);

export default function OtpStep({
    phone,
    onVerify,
    onCodeChange,
    onChangePhone,
    onResend,
    isLogin = false,
    loading = false,
    externalError = '',
}) {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [seconds, setSeconds] = useState(60);
    const [resending, setResending] = useState(false);

    useEffect(() => {
        if (seconds <= 0) return undefined;

        const timer = window.setInterval(() => {
            setSeconds((current) => current - 1);
        }, 1000);

        return () => window.clearInterval(timer);
    }, [seconds]);

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!/^\d{6}$/.test(code)) {
            setError('کد تأیید باید ۶ رقم باشد.');
            return;
        }

        setError('');
        onVerify(code);
    };

    const handleResend = async () => {
        setResending(true);
        setError('');

        try {
            await onResend?.();
            setSeconds(60);
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setResending(false);
        }
    };

    return (
        <section className="rounded-[24px] border border-[#e4e9e7] bg-white px-5 py-8 shadow-[0_22px_60px_rgba(8,35,31,0.08)] sm:px-10 sm:py-10">
            <header className="text-center">
                <h1 className="text-2xl font-extrabold text-[#123c35] sm:text-[28px]">
                    {isLogin ? 'ورود به حساب کاربری' : 'ایجاد حساب کاربری'}
                </h1>
                <p className="mt-3 text-sm text-[#8a9591]">تأیید شماره موبایل</p>
            </header>

            {!isLogin && <AuthProgress currentStep={2} totalSteps={4} />}

            <div className="mt-7 rounded-xl bg-[#effbf7] px-4 py-4 text-center text-sm font-bold text-[#2e8a70]">
                کد تأیید ارسال شد
            </div>

            <p className="mt-8 text-center text-sm leading-7 text-[#8a9591]">
                کد ۶ رقمی ارسال‌شده به{' '}
                <strong className="text-[#28685c]" dir="ltr">
                    {phone}
                </strong>{' '}
                را وارد کنید.
            </p>

            <form onSubmit={handleSubmit} className="mt-7" noValidate>
                <label
                    htmlFor="otp-code"
                    className="mb-2 block text-sm font-bold text-[#17483f]"
                >
                    کد تأیید
                </label>
                <input
                    id="otp-code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={code}
                    onChange={(event) => {
                        setCode(normalizeDigits(event.target.value));
                        setError('');
                        onCodeChange?.();
                    }}
                    placeholder="کد ۶ رقمی"
                    className="h-14 w-full rounded-2xl border border-[#dfe7e4] bg-[#fbfcfb] px-5 text-center text-lg tracking-[0.45em] text-[#123c35] outline-none transition placeholder:text-sm placeholder:tracking-normal placeholder:text-[#a3aca9] focus:border-[#28685c] focus:ring-4 focus:ring-[#28685c]/10"
                    dir="ltr"
                />

                {(error || externalError) && (
                    <p role="alert" className="mt-3 text-sm font-medium text-red-700">
                        {error || externalError}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="mt-5 h-14 w-full rounded-2xl bg-[#155447] text-sm font-extrabold text-white transition hover:bg-[#1c6557] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? 'در حال تأیید...' : 'تأیید کد'}
                </button>
            </form>

            <div className="mt-6 space-y-4 text-center text-sm">
                {seconds > 0 ? (
                    <p className="text-[#8a9591]">ارسال مجدد تا {seconds} ثانیه دیگر</p>
                ) : (
                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={resending}
                        className="font-bold text-[#28685c] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {resending ? 'در حال ارسال...' : 'ارسال مجدد کد'}
                    </button>
                )}
                <button
                    type="button"
                    onClick={onChangePhone}
                    className="block w-full font-bold text-[#697570]"
                >
                    اصلاح شماره موبایل
                </button>
            </div>
        </section>
    );
}
