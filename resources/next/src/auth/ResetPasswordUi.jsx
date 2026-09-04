'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
    PASSWORD_RESET_STORAGE_KEY,
    passwordResetRequest,
} from './passwordResetApi';

export default function ResetPasswordUi() {
    const router = useRouter();
    const [phone, setPhone] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [password, setPassword] = useState('');
    const [confirmation, setConfirmation] = useState('');
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
                if (!saved?.phone || !saved?.resetToken) {
                    router.replace('/forgot-password');
                    return;
                }
                setPhone(saved.phone);
                setResetToken(saved.resetToken);
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

        if (password.length < 8) {
            setError('رمز عبور باید حداقل ۸ کاراکتر باشد.');
            return;
        }
        if (password !== confirmation) {
            setError('تکرار رمز عبور با رمز جدید یکسان نیست.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await passwordResetRequest('/auth/password/reset', {
                phone,
                reset_token: resetToken,
                password,
                password_confirmation: confirmation,
            });
            sessionStorage.removeItem(PASSWORD_RESET_STORAGE_KEY);
            router.replace('/login?password_reset=success');
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
                تعیین رمز عبور جدید
            </h1>
            <p className="mt-3 text-center text-sm leading-7 text-[#7c8985]">
                رمز جدید باید حداقل ۸ کاراکتر باشد.
            </p>

            <form className="mt-7 space-y-5" onSubmit={submit}>
                <input
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="رمز عبور جدید"
                    className="h-[52px] w-full rounded-[13px] border border-[#dfe7e4] bg-[#fafcfb] px-4 text-sm text-[#123c35] outline-none focus:border-[#1c554a] focus:ring-2 focus:ring-[#1c554a]/10"
                />
                <input
                    type="password"
                    autoComplete="new-password"
                    value={confirmation}
                    onChange={(event) => setConfirmation(event.target.value)}
                    placeholder="تکرار رمز عبور جدید"
                    className="h-[52px] w-full rounded-[13px] border border-[#dfe7e4] bg-[#fafcfb] px-4 text-sm text-[#123c35] outline-none focus:border-[#1c554a] focus:ring-2 focus:ring-[#1c554a]/10"
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
                    {loading ? 'در حال ثبت...' : 'ثبت رمز عبور جدید'}
                </button>
            </form>
        </section>
    );
}
