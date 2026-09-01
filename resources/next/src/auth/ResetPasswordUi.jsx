'use client';

import { Vazirmatn } from 'next/font/google';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

const ResetPasswordUi = () => {
    const router = useRouter();

    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError('');
        setSuccess('');

        if (!password) {
            setError('لطفاً رمز عبور جدید را وارد کنید.');
            return;
        }

        if (password.length < 8) {
            setError('رمز عبور باید حداقل ۸ کاراکتر باشد.');
            return;
        }

        if (!passwordConfirmation) {
            setError('لطفاً تکرار رمز عبور را وارد کنید.');
            return;
        }

        if (password !== passwordConfirmation) {
            setError('رمز عبور و تکرار آن یکسان نیستند.');
            return;
        }

        const resetToken = sessionStorage.getItem('password_reset_token');

        if (!resetToken) {
            setError(
                'توکن بازیابی پیدا نشد. لطفاً دوباره درخواست بازیابی رمز کنید.',
            );
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                'http://127.0.0.1:8000/api/auth/password/reset',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                    body: JSON.stringify({
                        reset_token: resetToken,
                        password: password,
                        password_confirmation: passwordConfirmation,
                    }),
                },
            );

            const data = await response.json();

            console.log('Reset Password Response:', data);

            if (!response.ok) {
                if (data.errors?.reset_token?.length) {
                    setError(data.errors.reset_token[0]);
                } else if (data.errors?.password?.length) {
                    setError(data.errors.password[0]);
                } else {
                    setError(data.message || 'تغییر رمز عبور انجام نشد.');
                }

                return;
            }

            setSuccess(data.message || 'رمز عبور شما با موفقیت تغییر کرد.');

            // پاک کردن اطلاعات بازیابی
            sessionStorage.removeItem('password_reset_token');

            sessionStorage.removeItem('forgot_password_phone');

            sessionStorage.removeItem('forgot_password_expires_in');

            sessionStorage.removeItem('password_verify_response');

            // رفتن به Login
            setTimeout(() => {
                router.push('/login');
            }, 1200);
        } catch (error) {
            console.error('Reset Password Error:', error);

            setError('ارتباط با سرور برقرار نشد. لطفاً دوباره تلاش کنید.');
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
                    ثبت رمز عبور جدید
                </h1>

                <p className="mt-2.5 text-[13px] font-medium leading-6 text-[#7c8985] sm:text-[14px]">
                    رمز عبور جدید خود را وارد کنید.
                </p>
            </header>

            <form
                onSubmit={handleSubmit}
                className={`${vazir.className} mt-7 space-y-5`}
            >
                {/* رمز جدید */}
                <div>
                    <label
                        htmlFor="password"
                        className="mb-2 block text-[13px] font-bold text-[#123c35]"
                    >
                        رمز عبور جدید
                    </label>

                    <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        placeholder="رمز عبور جدید را وارد کنید"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-[52px] w-full rounded-[13px] border border-[#dfe7e4] bg-[#fafcfb] px-4 text-[14px] text-[#123c35] outline-none transition focus:border-[#1c554a] focus:ring-2 focus:ring-[#1c554a]/10"
                    />
                </div>

                {/* تکرار رمز */}
                <div>
                    <label
                        htmlFor="password_confirmation"
                        className="mb-2 block text-[13px] font-bold text-[#123c35]"
                    >
                        تکرار رمز عبور
                    </label>

                    <input
                        id="password_confirmation"
                        name="password_confirmation"
                        type="password"
                        autoComplete="new-password"
                        placeholder="رمز عبور را دوباره وارد کنید"
                        value={passwordConfirmation}
                        onChange={(e) =>
                            setPasswordConfirmation(e.target.value)
                        }
                        className="h-[52px] w-full rounded-[13px] border border-[#dfe7e4] bg-[#fafcfb] px-4 text-[14px] text-[#123c35] outline-none transition focus:border-[#1c554a] focus:ring-2 focus:ring-[#1c554a]/10"
                    />
                </div>

                {error && (
                    <div
                        className={`${vazir.className} rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-center text-[12px] font-medium leading-6 text-red-600`}
                    >
                        {error}
                    </div>
                )}

                {success && (
                    <div
                        className={`${vazir.className} rounded-[12px] border border-green-200 bg-green-50 px-4 py-3 text-center text-[12px] font-medium leading-6 text-green-700`}
                    >
                        {success}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="h-[52px] w-full rounded-[13px] bg-[#123c35] text-[14px] font-bold text-white transition hover:bg-[#1c554a] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? 'در حال تغییر رمز...' : 'ثبت رمز جدید'}
                </button>

                <button
                    type="button"
                    onClick={() => router.push('/login')}
                    className="h-[45px] w-full rounded-[13px] border border-[#dfe7e4] bg-white text-[13px] font-bold text-[#123c35] transition hover:border-[#1c554a] hover:bg-[#fafcfb]"
                >
                    بازگشت به ورود
                </button>
            </form>
        </div>
    );
};

export default ResetPasswordUi;
