'use client';

import { useState } from 'react';
import { BadgeCheck } from 'lucide-react';

import AuthProgress from './AuthProgress';

const normalizeDigits = (value) =>
    value
        .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
        .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
        .replace(/\D/g, '');

export default function LawyerLicenseStep({
    licenseNumber,
    setLicenseNumber,
    onNext,
    onBack,
    loading = false,
    externalError = '',
}) {
    const [error, setError] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();

        const normalizedLicense = normalizeDigits(licenseNumber);

        if (normalizedLicense.length < 3) {
            setError('شماره پروانه وکالت را به‌صورت صحیح وارد کنید.');
            return;
        }

        setLicenseNumber(normalizedLicense);
        setError('');
        onNext(normalizedLicense);
    };

    return (
        <section className="rounded-[24px] border border-[#e4e9e7] bg-white px-5 py-8 shadow-[0_22px_60px_rgba(8,35,31,0.08)] sm:px-10 sm:py-10">
            <header className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f1f7f5] text-[#17483f]">
                    <BadgeCheck size={30} strokeWidth={1.7} />
                </div>
                <h1 className="mt-4 text-2xl font-extrabold text-[#123c35] sm:text-[28px]">
                    احراز هویت وکیل
                </h1>
                <p className="mt-3 text-sm text-[#8a9591]">شماره پروانه وکالت</p>
            </header>

            <AuthProgress currentStep={3} totalSteps={3} />

            <p className="mt-8 text-center text-sm leading-7 text-[#8a9591]">
                برای ورود به داشبورد وکیل، شماره پروانه خود را وارد کنید.
            </p>

            <form onSubmit={handleSubmit} className="mt-7" noValidate>
                <label
                    htmlFor="license-number"
                    className="mb-2 block text-sm font-bold text-[#17483f]"
                >
                    شماره پروانه
                </label>
                <input
                    id="license-number"
                    type="text"
                    inputMode="numeric"
                    value={licenseNumber}
                    onChange={(event) => setLicenseNumber(event.target.value)}
                    placeholder="شماره پروانه وکالت"
                    className="h-14 w-full rounded-2xl border border-[#dfe7e4] bg-[#fbfcfb] px-5 text-left text-sm text-[#123c35] outline-none transition placeholder:text-[#a3aca9] focus:border-[#28685c] focus:ring-4 focus:ring-[#28685c]/10"
                    dir="ltr"
                />

                {(error || externalError) && (
                    <p role="alert" className="mt-3 text-sm font-medium text-red-700">
                        {error || externalError}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="mt-5 h-14 w-full rounded-2xl bg-[#155447] text-sm font-extrabold text-white transition hover:bg-[#1c6557] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? 'در حال اعتبارسنجی...' : 'تکمیل ثبت‌نام'}
                </button>
                <button
                    type="button"
                    onClick={onBack}
                    disabled={loading}
                    className="mt-5 w-full text-sm font-bold text-[#697570] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    بازگشت و تغییر نقش
                </button>
            </form>
        </section>
    );
}
