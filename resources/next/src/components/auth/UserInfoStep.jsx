'use client';

import { useState } from 'react';
import { Scale, UserRound } from 'lucide-react';

import AuthProgress from './AuthProgress';

const roles = [
    {
        id: 'client',
        title: 'موکل',
        description: 'ثبت مسئله، انتخاب وکیل و مدیریت همکاری',
        icon: UserRound,
    },
    {
        id: 'lawyer',
        title: 'وکیل',
        description: 'احراز هویت، دریافت درخواست و مدیریت همکاری',
        icon: Scale,
    },
];

export default function UserInfoStep({
    firstName,
    setFirstName,
    lastName,
    setLastName,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    role,
    setRole,
    onNext,
    onBack,
}) {
    const [error, setError] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!firstName.trim() || !lastName.trim()) {
            setError('نام و نام خانوادگی خود را وارد کنید.');
            return;
        }

        if (!role) {
            setError('نقش کاربری خود را انتخاب کنید.');
            return;
        }

        if (password.length < 8) {
            setError('رمز عبور باید حداقل ۸ کاراکتر باشد.');
            return;
        }

        if (password !== confirmPassword) {
            setError('تکرار رمز عبور با رمز عبور یکسان نیست.');
            return;
        }

        setError('');
        onNext();
    };

    return (
        <section className="rounded-[24px] border border-[#e4e9e7] bg-white px-5 py-8 shadow-[0_22px_60px_rgba(8,35,31,0.08)] sm:px-10 sm:py-10">
            <header className="text-center">
                <h1 className="text-2xl font-extrabold text-[#123c35] sm:text-[28px]">
                    ایجاد حساب کاربری
                </h1>
                <p className="mt-3 text-sm text-[#8a9591]">اطلاعات اولیه</p>
            </header>

            <AuthProgress currentStep={2} totalSteps={3} />

            <form onSubmit={handleSubmit} className="mt-7 space-y-5" noValidate>
                <div>
                    <label
                        htmlFor="first-name"
                        className="mb-2 block text-sm font-bold text-[#17483f]"
                    >
                        نام
                    </label>
                    <input
                        id="first-name"
                        type="text"
                        autoComplete="given-name"
                        value={firstName}
                        onChange={(event) => setFirstName(event.target.value)}
                        placeholder="نام خود را وارد کنید"
                        className="h-14 w-full rounded-2xl border border-[#dfe7e4] bg-[#fbfcfb] px-5 text-sm text-[#123c35] outline-none transition placeholder:text-[#a3aca9] focus:border-[#28685c] focus:ring-4 focus:ring-[#28685c]/10"
                    />
                </div>

                <div>
                    <label
                        htmlFor="last-name"
                        className="mb-2 block text-sm font-bold text-[#17483f]"
                    >
                        نام خانوادگی
                    </label>
                    <input
                        id="last-name"
                        type="text"
                        autoComplete="family-name"
                        value={lastName}
                        onChange={(event) => setLastName(event.target.value)}
                        placeholder="نام خانوادگی خود را وارد کنید"
                        className="h-14 w-full rounded-2xl border border-[#dfe7e4] bg-[#fbfcfb] px-5 text-sm text-[#123c35] outline-none transition placeholder:text-[#a3aca9] focus:border-[#28685c] focus:ring-4 focus:ring-[#28685c]/10"
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label
                            htmlFor="register-password"
                            className="mb-2 block text-sm font-bold text-[#17483f]"
                        >
                            رمز عبور
                        </label>
                        <input
                            id="register-password"
                            type="password"
                            autoComplete="new-password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="حداقل ۸ کاراکتر"
                            className="h-14 w-full rounded-2xl border border-[#dfe7e4] bg-[#fbfcfb] px-5 text-left text-sm text-[#123c35] outline-none transition placeholder:text-right placeholder:text-[#a3aca9] focus:border-[#28685c] focus:ring-4 focus:ring-[#28685c]/10"
                            dir="ltr"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="register-password-confirmation"
                            className="mb-2 block text-sm font-bold text-[#17483f]"
                        >
                            تکرار رمز عبور
                        </label>
                        <input
                            id="register-password-confirmation"
                            type="password"
                            autoComplete="new-password"
                            value={confirmPassword}
                            onChange={(event) =>
                                setConfirmPassword(event.target.value)
                            }
                            placeholder="رمز عبور را تکرار کنید"
                            className="h-14 w-full rounded-2xl border border-[#dfe7e4] bg-[#fbfcfb] px-5 text-left text-sm text-[#123c35] outline-none transition placeholder:text-right placeholder:text-[#a3aca9] focus:border-[#28685c] focus:ring-4 focus:ring-[#28685c]/10"
                            dir="ltr"
                        />
                    </div>
                </div>

                <fieldset>
                    <legend className="mb-3 text-sm font-bold text-[#17483f]">
                        نقش کاربری
                    </legend>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {roles.map((item) => {
                            const Icon = item.icon;
                            const selected = role === item.id;

                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setRole(item.id)}
                                    aria-pressed={selected}
                                    className={`rounded-2xl border px-4 py-5 text-center transition ${
                                        selected
                                            ? 'border-[#28685c] bg-[#f1f7f5] ring-2 ring-[#28685c]/10'
                                            : 'border-[#dfe7e4] bg-white hover:border-[#c5a35a]'
                                    }`}
                                >
                                    <Icon
                                        className="mx-auto text-[#17483f]"
                                        size={30}
                                        strokeWidth={1.7}
                                    />
                                    <strong className="mt-3 block text-base text-[#123c35]">
                                        {item.title}
                                    </strong>
                                    <span className="mt-2 block text-xs leading-6 text-[#8a9591]">
                                        {item.description}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </fieldset>

                {error && (
                    <p
                        role="alert"
                        className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
                    >
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    className="h-14 w-full rounded-2xl bg-[#155447] text-sm font-extrabold text-white transition hover:bg-[#1c6557] active:scale-[0.99]"
                >
                    ادامه
                </button>
                <button
                    type="button"
                    onClick={onBack}
                    className="w-full text-sm font-bold text-[#697570]"
                >
                    بازگشت
                </button>
            </form>
        </section>
    );
}
