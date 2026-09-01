'use client';

import { Vazirmatn } from 'next/font/google';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

const RegisterComplete = () => {
    const router = useRouter();

    const [registerData, setRegisterData] = useState(null);
    const [verificationToken, setVerificationToken] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const savedData = sessionStorage.getItem('register_data');
        const token = sessionStorage.getItem('verification_token');

        if (!savedData || !token) {
            router.replace('/register');
            return;
        }

        setRegisterData(JSON.parse(savedData));
        setVerificationToken(token);
    }, [router]);

    const handleRegister = async () => {
        setError('');

        if (!registerData || !verificationToken) {
            setError('اطلاعات ثبت‌نام کامل نیست.');
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                'http://127.0.0.1:8000/api/auth/register',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                    body: JSON.stringify({
                        first_name: registerData.first_name,
                        last_name: registerData.last_name,
                        phone: registerData.phone,
                        verification_token: verificationToken,
                    }),
                },
            );

            const data = await response.json();

            console.log('Register Response:', data);

            if (!response.ok) {
                setError(data.message || 'ثبت‌نام انجام نشد.');
                return;
            }

            // ثبت‌نام موفق
            console.log('Register successful:', data);

            // اطلاعات موقت را پاک می‌کنیم
            sessionStorage.removeItem('register_data');
            sessionStorage.removeItem('verification_token');

            // فعلاً برای تست
            alert('ثبت‌نام با موفقیت انجام شد.');

            // بعداً مسیر داشبورد را اینجا می‌گذاریم
            // router.push('/dashboard');
        } catch (error) {
            console.error('Register Error:', error);
            setError('ارتباط با سرور برقرار نشد.');
        } finally {
            setLoading(false);
        }
    };

    if (!registerData) {
        return null;
    }

    return (
        <div
            className={`${vazir.className} w-full max-w-[535px] rounded-[22px] border border-[#dfe7e4] bg-white px-5 py-7 shadow-[0_15px_40px_rgba(18,60,53,0.08)] sm:px-8 sm:py-9`}
        >
            <div className="text-center">
                <h1 className="text-[22px] font-extrabold text-[#123c35] sm:text-[25px]">
                    تکمیل ثبت‌نام
                </h1>

                <p className="mt-2.5 text-[13px] font-medium text-[#7c8985] sm:text-[14px]">
                    اطلاعات شما آماده ثبت نهایی است.
                </p>
            </div>

            <div className="mt-7 space-y-4">
                <div className="rounded-[13px] bg-[#fafcfb] p-4">
                    <p className="text-[12px] text-[#7c8985]">
                        نام و نام خانوادگی
                    </p>

                    <p className="mt-1 text-[14px] font-bold text-[#123c35]">
                        {registerData.first_name} {registerData.last_name}
                    </p>
                </div>

                <div className="rounded-[13px] bg-[#fafcfb] p-4">
                    <p className="text-[12px] text-[#7c8985]">شماره موبایل</p>

                    <p className="mt-1 text-[14px] font-bold text-[#123c35]">
                        {registerData.phone}
                    </p>
                </div>

                {error && (
                    <p className="text-center text-[13px] font-medium text-red-500">
                        {error}
                    </p>
                )}

                <button
                    type="button"
                    onClick={handleRegister}
                    disabled={loading}
                    className="h-[52px] w-full rounded-[13px] bg-[#123c35] text-[14px] font-bold text-white transition hover:bg-[#1c554a] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? 'در حال ثبت‌نام...' : 'تکمیل ثبت‌نام'}
                </button>
            </div>
        </div>
    );
};

export default RegisterComplete;
