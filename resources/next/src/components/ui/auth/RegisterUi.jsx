'use client';

import { Vazirmatn } from 'next/font/google';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

const RegisterUi = () => {
    const router = useRouter();

    const [form, setForm] = useState({
        first_name: '',
        last_name: '',
        phone: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError('');

        if (!form.first_name.trim()) {
            setError('لطفاً نام خود را وارد کنید.');
            return;
        }

        if (!form.last_name.trim()) {
            setError('لطفاً نام خانوادگی خود را وارد کنید.');
            return;
        }

        if (!form.phone.trim()) {
            setError('لطفاً شماره موبایل خود را وارد کنید.');
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                'http://127.0.0.1:8000/api/auth/register/send-otp',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                    body: JSON.stringify({
                        first_name: form.first_name,
                        last_name: form.last_name,
                        phone: form.phone,
                    }),
                }
            );

            const data = await response.json();

            console.log('Send OTP:', data);

            if (!response.ok) {
                setError(
                    data.message || 'ارسال کد تأیید ناموفق بود.'
                );
                return;
            }

            // اطلاعات ثبت نام را موقتاً نگه می‌داریم
            sessionStorage.setItem(
                'register_data',
                JSON.stringify({
                    first_name: form.first_name,
                    last_name: form.last_name,
                    phone: form.phone,
                })
            );

            // رفتن به صفحه OTP
            router.push('/register/verify');

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
                    ایجاد حساب کاربری
                </h1>

                <p className="mt-2.5 text-[13px] leading-6 font-medium text-[#7c8985] sm:text-[14px]">
                    اطلاعات خود را برای ثبت‌نام وارد کنید.
                </p>
            </header>

            <form
                onSubmit={handleSubmit}
                className={`${vazir.className} mt-7 space-y-5`}
            >
                <div>
                    <label
                        htmlFor="first_name"
                        className="mb-2 block text-[13px] font-bold text-[#123c35]"
                    >
                        نام
                    </label>

                    <input
                        id="first_name"
                        name="first_name"
                        type="text"
                        placeholder="نام خود را وارد کنید"
                        value={form.first_name}
                        onChange={handleChange}
                        className="h-[52px] w-full rounded-[13px] border border-[#dfe7e4] bg-[#fafcfb] px-4 text-[14px] text-[#123c35] outline-none focus:border-[#1c554a] focus:ring-2 focus:ring-[#1c554a]/10"
                    />
                </div>

                <div>
                    <label
                        htmlFor="last_name"
                        className="mb-2 block text-[13px] font-bold text-[#123c35]"
                    >
                        نام خانوادگی
                    </label>

                    <input
                        id="last_name"
                        name="last_name"
                        type="text"
                        placeholder="نام خانوادگی خود را وارد کنید"
                        value={form.last_name}
                        onChange={handleChange}
                        className="h-[52px] w-full rounded-[13px] border border-[#dfe7e4] bg-[#fafcfb] px-4 text-[14px] text-[#123c35] outline-none focus:border-[#1c554a] focus:ring-2 focus:ring-[#1c554a]/10"
                    />
                </div>

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
                        placeholder="مثلاً 09123456789"
                        value={form.phone}
                        onChange={handleChange}
                        className="h-[52px] w-full rounded-[13px] border border-[#dfe7e4] bg-[#fafcfb] px-4 text-[14px] text-[#123c35] outline-none focus:border-[#1c554a] focus:ring-2 focus:ring-[#1c554a]/10"
                    />
                </div>

                {error && (
                    <p className="text-center text-[13px] font-medium text-red-500">
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="h-[52px] w-full rounded-[13px] bg-[#123c35] text-[14px] font-bold text-white transition hover:bg-[#1c554a] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? 'در حال ارسال کد...' : 'دریافت کد تأیید'}
                </button>
            </form>
        </div>
    );
};

export default RegisterUi;
