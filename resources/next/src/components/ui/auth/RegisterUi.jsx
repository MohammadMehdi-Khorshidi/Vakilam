'use client';

import { Vazirmatn } from 'next/font/google';
import { useState } from 'react';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

const RegisterUi = () => {
    const [form, setForm] = useState({
        first_name: '',
        last_name: '',
        phone: '',
    });

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        console.log(form);
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
                        className="h-[52px] w-full rounded-[13px] border border-[#dfe7e4] bg-[#fafcfb] px-4 text-[14px] text-[#123c35] transition outline-none focus:border-[#1c554a] focus:ring-2 focus:ring-[#1c554a]/10"
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
                        className="h-[52px] w-full rounded-[13px] border border-[#dfe7e4] bg-[#fafcfb] px-4 text-[14px] text-[#123c35] transition outline-none focus:border-[#1c554a] focus:ring-2 focus:ring-[#1c554a]/10"
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
                        className="h-[52px] w-full rounded-[13px] border border-[#dfe7e4] bg-[#fafcfb] px-4 text-[14px] text-[#123c35] transition outline-none focus:border-[#1c554a] focus:ring-2 focus:ring-[#1c554a]/10"
                    />
                </div>

                <button
                    type="submit"
                    className="h-[52px] w-full rounded-[13px] bg-[#123c35] text-[14px] font-bold text-white transition hover:bg-[#1c554a] active:scale-[0.99]"
                >
                    ثبت‌نام
                </button>
            </form>

            {/*<p*/}
            {/*    className={`${vazir.className} mt-5 text-center text-[12px] font-medium text-[#7c8985]`}*/}
            {/*>*/}
            {/*    قبلاً حساب کاربری دارید؟*/}
            {/*    <span className="mr-1 cursor-pointer font-bold text-[#123c35] hover:text-[#1c554a]">*/}
            {/*        ورود*/}
            {/*    </span>*/}
            {/*</p>*/}
        </div>
    );
};

export default RegisterUi;
