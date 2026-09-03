'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
    normalizeDigits,
    PASSWORD_RESET_STORAGE_KEY,
    passwordResetRequest,
} from './passwordResetApi';

export default function ForgotPasswordUi() {
    const router = useRouter();
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const submit = async (event) => {
        event.preventDefault();
        const normalizedPhone = normalizeDigits(phone).replace(/\D/g, '');

        if (!/^09\d{9}$/.test(normalizedPhone)) {
            setError('شماره موبایل باید با 09 شروع شود و ۱۱ رقم باشد.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const payload = await passwordResetRequest(
                '/auth/password/forgot/send-otp',
                { phone: normalizedPhone },
            );
            sessionStorage.setItem(
                PASSWORD_RESET_STORAGE_KEY,
                JSON.stringify({
                    phone: normalizedPhone,
                    resendAfter: payload.resend_after || 60,
                    sentAt: Date.now(),
                }),
            );
            router.push('/forgot-password/verify');
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section
            dir="rtl"
            className="w-full max-w-[535px] rounded-[22px] border border-[#dfe7e4] bg-white px-5 py-7 shadow-[0_15px_40px_rgba(18,60,53,0.08)] sm:px-8 sm:py-9"
        >
            <h1 className="text-center text-[24px] font-extrabold text-[#123c35]">
                بازیابی رمز عبور
            </h1>
            <p className="mt-3 text-center text-sm leading-7 text-[#7c8985]">
                شماره موبایل حساب خود را وارد کنید تا کد تأیید ارسال شود.
            </p>

            <form className="mt-7 space-y-5" onSubmit={submit}>
                <div>
                    <label
                        htmlFor="reset-phone"
                        className="mb-2 block text-[13px] font-bold text-[#123c35]"
                    >
                        شماره موبایل
                    </label>
                    <input
                        id="reset-phone"
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel"
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        placeholder="مثلاً 09123456789"
                        className="h-[52px] w-full rounded-[13px] border border-[#dfe7e4] bg-[#fafcfb] px-4 text-sm text-[#123c35] outline-none focus:border-[#1c554a] focus:ring-2 focus:ring-[#1c554a]/10"
                    />
                </div>

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
                    {loading ? 'در حال ارسال...' : 'ارسال کد تأیید'}
                </button>
            </form>

            <Link
                href="/login"
                className="mt-5 block text-center text-sm font-bold text-[#123c35]"
            >
                بازگشت به ورود
            </Link>
        </section>
    );
}
