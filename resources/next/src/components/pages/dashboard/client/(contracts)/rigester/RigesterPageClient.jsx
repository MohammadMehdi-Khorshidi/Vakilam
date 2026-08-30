'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Vazirmatn } from 'next/font/google';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

const RegisterPage = () => {
    const router = useRouter();

    const [form, setForm] = useState({
        name: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });

    const [error, setError] = useState('');

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        setError('');

        if (
            !form.name ||
            !form.phone ||
            !form.password ||
            !form.confirmPassword
        ) {
            setError('لطفاً همه اطلاعات را وارد کنید.');
            return;
        }

        if (form.password !== form.confirmPassword) {
            setError('رمز عبور و تکرار آن یکسان نیستند.');
            return;
        }

        router.push('/client/payment');
    };

    return (
        <main
            dir="rtl"
            className={`${vazir.className} mt-15 min-h-screen bg-[#f7faf8] px-6 py-10`}
        >
            <div className="mx-auto max-w-6xl">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-[28px] font-extrabold text-[#103b34] md:text-[34px]">
                        تکمیل اطلاعات و پرداخت
                    </h1>

                    <p className="mt-2 leading-7 text-[#8a9994]">
                        برای ادامه فرایند، اطلاعات حساب خود را تکمیل و سپس
                        پیش‌پرداخت پرونده را انجام دهید.
                    </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
                    {/* Register Form */}
                    <div className="rounded-[28px] border border-[#e4ebe7] bg-white p-6 shadow-sm md:p-8">
                        <div className="mb-7">
                            <h2 className="text-xl font-extrabold text-[#123f37]">
                                ایجاد حساب کاربری
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-[#8a9994]">
                                اطلاعات زیر برای ایجاد حساب کاربری شما استفاده
                                می‌شود.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Name */}
                            <div>
                                <label className="mb-2 block text-sm font-bold text-[#315e52]">
                                    نام و نام خانوادگی
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="نام و نام خانوادگی"
                                    className="w-full rounded-xl border border-[#dfe8e3] bg-[#fafcfb] px-4 py-3 outline-none transition focus:border-[#0d4a3e] focus:ring-2 focus:ring-[#0d4a3e]/10"
                                />
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="mb-2 block text-sm font-bold text-[#315e52]">
                                    شماره موبایل
                                </label>

                                <input
                                    type="tel"
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                    placeholder="09123456789"
                                    className="w-full rounded-xl border border-[#dfe8e3] bg-[#fafcfb] px-4 py-3 outline-none transition focus:border-[#0d4a3e] focus:ring-2 focus:ring-[#0d4a3e]/10"
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label className="mb-2 block text-sm font-bold text-[#315e52]">
                                    رمز عبور
                                </label>

                                <input
                                    type="password"
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="رمز عبور"
                                    className="w-full rounded-xl border border-[#dfe8e3] bg-[#fafcfb] px-4 py-3 outline-none transition focus:border-[#0d4a3e] focus:ring-2 focus:ring-[#0d4a3e]/10"
                                />
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="mb-2 block text-sm font-bold text-[#315e52]">
                                    تکرار رمز عبور
                                </label>

                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="تکرار رمز عبور"
                                    className="w-full rounded-xl border border-[#dfe8e3] bg-[#fafcfb] px-4 py-3 outline-none transition focus:border-[#0d4a3e] focus:ring-2 focus:ring-[#0d4a3e]/10"
                                />
                            </div>

                            {error && (
                                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm leading-6 text-red-600">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0d4a3e] px-5 py-3.5 font-bold text-white transition hover:bg-[#123f37]"
                            >
                                ایجاد حساب و ادامه پرداخت
                                <ArrowLeft size={17} />
                            </button>
                        </form>

                        <div className="mt-6 text-center text-sm text-[#8a9994]">
                            قبلاً حساب دارید؟
                            <button
                                type="button"
                                onClick={() => router.push('/login')}
                                className="mr-2 font-bold text-[#0d4a3e] transition hover:text-[#c9a96e]"
                            >
                                ورود
                            </button>
                        </div>
                    </div>

                    {/* Payment Summary */}
                    <aside className="h-fit rounded-[28px] border border-[#e4ebe7] bg-white p-6 shadow-sm">
                        <div className="mb-6 flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eef5f1] text-[#0d4a3e]">
                                <ShieldCheck size={22} />
                            </div>

                            <div>
                                <h2 className="font-extrabold text-[#123f37]">
                                    خلاصه پرداخت
                                </h2>

                                <p className="mt-1 text-xs text-[#8a9994]">
                                    اطلاعات پیش‌پرداخت پرونده
                                </p>
                            </div>
                        </div>

                        {/* Case */}
                        <div className="rounded-2xl bg-[#f7faf8] p-4">
                            <p className="text-xs text-[#8a9994]">پرونده</p>

                            <p className="mt-2 font-bold text-[#123f37]">
                                مطالبه وجه چک
                            </p>

                            <p className="mt-1 text-xs text-[#8a9994]">
                                شناسه پرونده: VK-1405-00128
                            </p>
                        </div>

                        {/* Payment Details */}
                        <div className="mt-5 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-[#8a9994]">
                                    مبلغ پیش‌پرداخت
                                </span>

                                <span className="font-bold text-[#123f37]">
                                    ۵۰,۰۰۰,۰۰۰ ریال
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-[#8a9994]">
                                    هزینه خدمات
                                </span>

                                <span className="font-bold text-[#123f37]">
                                    ۰ ریال
                                </span>
                            </div>

                            <div className="border-t border-[#e7ece9] pt-4">
                                <div className="flex items-end justify-between">
                                    <span className="font-bold text-[#315e52]">
                                        مبلغ قابل پرداخت
                                    </span>

                                    <div className="text-left">
                                        <p className="text-xl font-extrabold text-[#0d4a3e]">
                                            ۵۰,۰۰۰,۰۰۰
                                        </p>

                                        <p className="mt-1 text-xs text-[#8a9994]">
                                            ریال
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Includes */}
                        <div className="mt-6 rounded-2xl border border-[#e7ece9] p-4">
                            <p className="mb-3 text-sm font-bold text-[#315e52]">
                                این پرداخت شامل:
                            </p>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm text-[#6f7d78]">
                                    <CheckCircle2
                                        size={16}
                                        className="shrink-0 text-[#24734f]"
                                    />
                                    ثبت پیش‌پرداخت پرونده
                                </div>

                                <div className="flex items-center gap-2 text-sm text-[#6f7d78]">
                                    <CheckCircle2
                                        size={16}
                                        className="shrink-0 text-[#24734f]"
                                    />
                                    شروع فرایند همکاری با وکیل
                                </div>

                                <div className="flex items-center gap-2 text-sm text-[#6f7d78]">
                                    <CheckCircle2
                                        size={16}
                                        className="shrink-0 text-[#24734f]"
                                    />
                                    ثبت رسید در سوابق پرونده
                                </div>
                            </div>
                        </div>

                        {/* Notice */}
                        <div className="mt-5 rounded-2xl border border-[#eadfc4] bg-[#fffdf7] p-4">
                            <p className="text-xs leading-6 text-[#7f7151]">
                                با انتخاب «ایجاد حساب و ادامه پرداخت»، اطلاعات
                                شما ثبت شده و به مرحله پرداخت هدایت می‌شوید.
                            </p>
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    );
};

export default RegisterPage;
