'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
    normalizeDigits,
    PASSWORD_RESET_STORAGE_KEY,
    passwordResetRequest,
} from './passwordResetApi';

export default function ForgotPasswordOtp() {
    const router = useRouter();
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            try {
                const saved = JSON.parse(
                    sessionStorage.getItem(PASSWORD_RESET_STORAGE_KEY) ||
                        'null',
                );
                if (!saved?.phone) {
                    router.replace('/forgot-password');
                    return;
                }
                setPhone(saved.phone);
                setReady(true);
            } catch {
                sessionStorage.removeItem(PASSWORD_RESET_STORAGE_KEY);
                router.replace('/forgot-password');
            }
        }, 0);

        return () => window.clearTimeout(timer);
    }, [router]);

    const submit = async (event) => {
        event.preventDefault();
        const normalizedOtp = normalizeDigits(otp).replace(/\D/g, '');

        if (!/^\d{6}$/.test(normalizedOtp)) {
            setError('کد تأیید باید ۶ رقم باشد.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const payload = await passwordResetRequest(
                '/auth/password/forgot/verify-otp',
                { phone, otp: normalizedOtp },
            );
            sessionStorage.setItem(
                PASSWORD_RESET_STORAGE_KEY,
                JSON.stringify({
                    phone,
                    resetToken: payload.reset_token,
                }),
            );
            router.push('/forgot-password/reset');
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setLoading(false);
        }
    };

    if (!ready) return null;

    return (
        <section
            dir="rtl"
            className="w-full max-w-[535px] rounded-[22px] border border-[#dfe7e4] bg-white px-5 py-7 shadow-[0_15px_40px_rgba(18,60,53,0.08)] sm:px-8 sm:py-9"
        >
            <h1 className="text-center text-[24px] font-extrabold text-[#123c35]">
                تأیید شماره موبایل
            </h1>
            <p className="mt-3 text-center text-sm leading-7 text-[#7c8985]">
                کد ارسال‌شده به {phone} را وارد کنید.
            </p>

            <form className="mt-7 space-y-5" onSubmit={submit}>
                <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={otp}
                    onChange={(event) => setOtp(event.target.value)}
                    placeholder="کد ۶ رقمی"
                    className="h-[52px] w-full rounded-[13px] border border-[#dfe7e4] bg-[#fafcfb] px-4 text-center text-lg tracking-[0.4em] text-[#123c35] outline-none focus:border-[#1c554a] focus:ring-2 focus:ring-[#1c554a]/10"
                />

                {error && (
                    <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="h-[52px] w-full rounded-[13px] bg-[#123c35] text-sm font-bold text-white transition hover:bg-[#1c554a] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? 'در حال بررسی...' : 'تأیید کد'}
                </button>
                <button
                    type="button"
                    onClick={() => router.push('/forgot-password')}
                    className="w-full text-sm font-bold text-[#123c35]"
                >
                    اصلاح شماره یا ارسال مجدد
                </button>
            </form>
        </section>
    );
}
