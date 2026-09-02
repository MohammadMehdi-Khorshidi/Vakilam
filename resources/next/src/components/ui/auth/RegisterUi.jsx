'use client';

import { Vazirmatn } from 'next/font/google';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

const RegisterUi = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const role = searchParams.get('role');

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        phone: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!role) {
            return;
        }

        const data = {
            ...formData,
            role,
        };

        // فعلاً برای تست
        console.log('Register Data:', data);

        // انتقال به صفحه OTP
        const params = new URLSearchParams({
            role,
            first_name: formData.first_name,
            last_name: formData.last_name,
            phone: formData.phone,
        });

        router.push(`/auth/otp?${params.toString()}`);
    };

    return (
        <div
            dir="rtl"
            className={`${vazir.className} w-full max-w-[535px] rounded-[22px] border border-[#dfe7e4] bg-white px-5 py-7 shadow-[0_15px_40px_rgba(18,60,53,0.08)] sm:px-8 sm:py-9`}
        >
            <header className="text-center">
                <h1 className="text-[22px] font-extrabold leading-9 text-[#123c35] sm:text-[25px]">
                    ایجاد حساب کاربری
                </h1>

                <p className="mt-2.5 text-[13px] font-medium leading-6 text-[#7c8985] sm:text-[14px]">
                    اطلاعات خود را برای ثبت‌نام وارد کنید.
                </p>
            </header>

            {role && (
                <div className="mt-5 rounded-[12px] bg-[#f1f7f5] px-4 py-3 text-center text-[12px] font-bold text-[#123c35]">
                    نقش انتخاب شده:{' '}
                    {role === 'client'
                        ? 'موکل'
                        : role === 'lawyer'
                          ? 'وکیل'
                          : 'مدیر سامانه'}
                </div>
            )}

            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
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
                        value={formData.first_name}
                        onChange={handleChange}
                        placeholder="نام خود را وارد کنید"
                        required
                        className="h-[52px] w-full rounded-[13px] border border-[#dfe7e4] bg-[#fafcfb] px-4 text-[14px] text-[#123c35] outline-none transition placeholder:text-[#a0aaa7] focus:border-[#1c554a] focus:ring-2 focus:ring-[#1c554a]/10"
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
                        value={formData.last_name}
                        onChange={handleChange}
                        placeholder="نام خانوادگی خود را وارد کنید"
                        required
                        className="h-[52px] w-full rounded-[13px] border border-[#dfe7e4] bg-[#fafcfb] px-4 text-[14px] text-[#123c35] outline-none transition placeholder:text-[#a0aaa7] focus:border-[#1c554a] focus:ring-2 focus:ring-[#1c554a]/10"
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
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="مثلاً 09123456789"
                        required
                        className="h-[52px] w-full rounded-[13px] border border-[#dfe7e4] bg-[#fafcfb] px-4 text-[14px] text-[#123c35] outline-none transition placeholder:text-[#a0aaa7] focus:border-[#1c554a] focus:ring-2 focus:ring-[#1c554a]/10"
                    />
                </div>

                <button
                    type="submit"
                    className="h-[52px] w-full rounded-[13px] bg-[#123c35] text-[14px] font-bold text-white transition hover:bg-[#1c554a] active:scale-[0.99]"
                >
                    دریافت کد تأیید
                </button>
            </form>
        </div>
    );
};

export default RegisterUi;
