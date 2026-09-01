'use client';

import { Vazirmatn } from 'next/font/google';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

const ForgotPasswordOtp = () => {
    const router = useRouter();

    const [otp, setOtp] = useState('');
    const [phone, setPhone] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // گرفتن شماره موبایل ذخیره‌شده
    useEffect(() => {
        const savedPhone = sessionStorage.getItem('forgot_password_phone');

        if (!savedPhone) {
            router.replace('/forgot-password');
            return;
        }

        setPhone(savedPhone);
    }, [router]);

    // تغییر OTP
    const handleChange = (e) => {
        const value = e.target.value.replace(/\D/g, '');

        if (value.length <= 6) {
            setOtp(value);
        }
    };

    // ارسال OTP برای تأیید
    const handleSubmit = async (e) => {
        e.preventDefault();

        setError('');
        setSuccess('');

        // بررسی خالی نبودن OTP
        if (!otp) {
            setError('لطفاً کد تأیید را وارد کنید.');
            return;
        }

        // بررسی ۶ رقمی بودن
        if (otp.length !== 6) {
            setError('کد تأیید باید ۶ رقمی باشد.');
            return;
        }

        // اگر شماره موبایل وجود نداشت
        if (!phone) {
            setError('شماره موبایل پیدا نشد. لطفاً دوباره درخواست کد کنید.');
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                'http://127.0.0.1:8000/api/auth/password/forgot/verify-otp',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                    body: JSON.stringify({
                        phone: phone,
                        otp: otp,
                    }),
                },
            );

            const data = await response.json();

            console.log('Verify OTP Response:', data);

            // =========================
            // خطا
            // =========================

            if (!response.ok) {
                if (data.errors?.otp?.length) {
                    setError(data.errors.otp[0]);
                } else if (data.errors?.phone?.length) {
                    setError(data.errors.phone[0]);
                } else {
                    setError(data.message || 'کد تأیید صحیح نیست.');
                }

                return;
            }

            // =========================
            // موفقیت
            // =========================

            setSuccess(data.message || 'کد تأیید با موفقیت تأیید شد.');

            // =========================
            // ذخیره reset_token
            // =========================

            if (data.reset_token) {
                sessionStorage.setItem(
                    'password_reset_token',
                    data.reset_token,
                );
            }

            if (data.data?.reset_token) {
                sessionStorage.setItem(
                    'password_reset_token',
                    data.data.reset_token,
                );
            }

            // =========================
            // ذخیره شماره موبایل
            // =========================

            sessionStorage.setItem('forgot_password_phone', phone);

            // ذخیره کل response برای بررسی در صورت نیاز
            sessionStorage.setItem(
                'password_verify_response',
                JSON.stringify(data),
            );

            // =========================
            // رفتن به صفحه ثبت رمز جدید
            // =========================

            setTimeout(() => {
                router.push('/forgot-password/reset');
            }, 800);
        } catch (error) {
            console.error('Verify OTP Error:', error);

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
            {/* ================= Header ================= */}

            <header className={`${vazir.className} text-center`}>
                <h1 className="text-[22px] font-extrabold leading-9 text-[#123c35] sm:text-[25px]">
                    تأیید کد بازیابی
                </h1>

                <p className="mt-2.5 text-[13px] font-medium leading-6 text-[#7c8985] sm:text-[14px]">
                    کد ارسال‌شده به شماره موبایل خود را وارد کنید.
                </p>

                {phone && (
                    <p className="mt-2 text-[13px] font-bold text-[#123c35]">
                        {phone}
                    </p>
                )}
            </header>

            {/* ================= Form ================= */}

            <form
                onSubmit={handleSubmit}
                className={`${vazir.className} mt-7 space-y-5`}
            >
                {/* OTP */}

                <div>
                    <label
                        htmlFor="otp"
                        className="mb-2 block text-[13px] font-bold text-[#123c35]"
                    >
                        کد تأیید
                    </label>

                    <input
                        id="otp"
                        name="otp"
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        placeholder="کد ۶ رقمی را وارد کنید"
                        value={otp}
                        onChange={handleChange}
                        className="h-[58px] w-full rounded-[13px] border border-[#dfe7e4] bg-[#fafcfb] px-4 text-center text-[20px] tracking-[8px] text-[#123c35] outline-none transition focus:border-[#1c554a] focus:ring-2 focus:ring-[#1c554a]/10"
                    />
                </div>

                {/* ================= Error ================= */}

                {error && (
                    <div
                        className={`${vazir.className} rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-center text-[12px] font-medium leading-6 text-red-600`}
                    >
                        {error}
                    </div>
                )}

                {/* ================= Success ================= */}

                {success && (
                    <div
                        className={`${vazir.className} rounded-[12px] border border-green-200 bg-green-50 px-4 py-3 text-center text-[12px] font-medium leading-6 text-green-700`}
                    >
                        {success}
                    </div>
                )}

                {/* ================= Verify Button ================= */}

                <button
                    type="submit"
                    disabled={loading}
                    className="h-[52px] w-full rounded-[13px] bg-[#123c35] text-[14px] font-bold text-white transition hover:bg-[#1c554a] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? 'در حال بررسی...' : 'تأیید کد'}
                </button>

                {/* ================= Change Phone ================= */}

                <button
                    type="button"
                    onClick={() => router.push('/forgot-password')}
                    className="h-[45px] w-full rounded-[13px] border border-[#dfe7e4] bg-white text-[13px] font-bold text-[#123c35] transition hover:border-[#1c554a] hover:bg-[#fafcfb]"
                >
                    تغییر شماره موبایل
                </button>
            </form>
        </div>
    );
};

export default ForgotPasswordOtp;
