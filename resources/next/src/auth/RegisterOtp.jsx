'use client';

import { Vazirmatn } from 'next/font/google';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

const RegisterOtp = () => {
    const router = useRouter();

    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const savedData = sessionStorage.getItem('register_data');

        if (!savedData) {
            router.replace('/auth/register');
            return;
        }

        const data = JSON.parse(savedData);

        setPhone(data.phone);
    }, [router]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError('');
        setSuccess('');

        if (otp.length !== 6) {
            setError('کد تأیید باید ۶ رقمی باشد.');
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                'http://127.0.0.1:8000/api/auth/register/verify-otp',
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
                }
            );

            const data = await response.json();

            console.log('Verify OTP:', data);

            if (!response.ok) {
                setError(
                    data.message || 'کد تأیید صحیح نیست.'
                );
                return;
            }

            setSuccess('شماره موبایل با موفقیت تأیید شد.');

            console.log('Register success:', data);

            // فعلاً اطلاعات ثبت‌نام را پاک می‌کنیم
            sessionStorage.removeItem('register_data');

            // اینجا بعداً مسیر نهایی را قرار می‌دهیم
            // router.push('/dashboard');

        } catch (error) {
            console.error(error);
            setError('ارتباط با سرور برقرار نشد.');
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
                <h1 className="text-[22px] leading-9 font-extrabold text-[#123c35] sm:text-[25px]">
                    تأیید شماره موبایل
                </h1>

                <p className="mt-2.5 text-[13px] leading-6 font-medium text-[#7c8985] sm:text-[14px]">
                    کد تأیید ارسال شده به شماره زیر را وارد کنید.
                </p>

                <p className="mt-3 text-[14px] font-bold text-[#123c35]">
                    {phone}
                </p>
            </header>

            <form
                onSubmit={handleSubmit}
                className={`${vazir.className} mt-7 space-y-5`}
            >
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
                        placeholder="------"
                        value={otp}
                        onChange={(e) => {
                            const value = e.target.value
                                .replace(/\D/g, '')
                                .slice(0, 6);

                            setOtp(value);
                        }}
                        className="h-[58px] w-full rounded-[13px] border border-[#dfe7e4] bg-[#fafcfb] px-4 text-center text-[22px] font-bold tracking-[10px] text-[#123c35] outline-none focus:border-[#1c554a] focus:ring-2 focus:ring-[#1c554a]/10"
                    />
                </div>

                {error && (
                    <p className="text-center text-[13px] font-medium text-red-500">
                        {error}
                    </p>
                )}

                {success && (
                    <p className="text-center text-[13px] font-medium text-green-600">
                        {success}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="h-[52px] w-full rounded-[13px] bg-[#123c35] text-[14px] font-bold text-white transition hover:bg-[#1c554a] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? 'در حال بررسی...' : 'تأیید کد'}
                </button>

                <button
                    type="button"
                    onClick={() => router.back()}
                    className="w-full text-center text-[13px] font-bold text-[#123c35]"
                >
                    ویرایش شماره موبایل
                </button>
            </form>
        </div>
    );
};

export default RegisterOtp;