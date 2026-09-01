'use client';

import { Vazirmatn } from 'next/font/google';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

const ForgotPasswordUi = () => {
    const router = useRouter();

    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError('');
        setSuccess('');

        if (!phone.trim()) {
            setError('لطفاً شماره موبایل خود را وارد کنید.');
            return;
        }

        if (!/^09\d{9}$/.test(phone)) {
            setError('شماره موبایل وارد شده صحیح نیست.');
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                'http://127.0.0.1:8000/api/auth/password/forgot/send-otp',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                    body: JSON.stringify({
                        phone: phone,
                    }),
                },
            );

            const data = await response.json();

            console.log('Forgot Password Response:', data);

            if (!response.ok) {
                if (data.errors?.phone?.length) {
                    setError(data.errors.phone[0]);
                } else {
                    setError(
                        data.message || 'ارسال کد بازیابی رمز عبور انجام نشد.',
                    );
                }

                return;
            }

            setSuccess(
                data.message || 'کد بازیابی رمز عبور برای شما ارسال شد.',
            );

            /*
             * شماره موبایل را موقتاً ذخیره می‌کنیم
             * تا صفحه OTP بتواند از آن استفاده کند.
             */
            sessionStorage.setItem('forgot_password_phone', phone);

            /*
             * زمان اعتبار کد
             */
            if (data.expires_in) {
                sessionStorage.setItem(
                    'forgot_password_expires_in',
                    String(data.expires_in),
                );
            }

            /*
             * رفتن به صفحه وارد کردن OTP
             */
            setTimeout(() => {
                router.push('/forgot-password/verify');
            }, 800);
        } catch (error) {
            console.error('Forgot Password Error:', error);

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
                    فراموشی رمز عبور
                </h1>

                <p className="mt-2.5 text-[13px] font-medium leading-6 text-[#7c8985] sm:text-[14px]">
                    شماره موبایل خود را وارد کنید تا کد بازیابی برای شما ارسال
                    شود.
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
                        autoComplete="tel"
                        placeholder="مثلاً 09123456789"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
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
                    {loading ? 'در حال ارسال کد...' : 'ارسال کد بازیابی'}
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

export default ForgotPasswordUi;
