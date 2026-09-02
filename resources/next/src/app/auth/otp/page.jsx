'use client';

import { Vazirmatn } from 'next/font/google';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

export default function OtpPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const role = searchParams.get('role');
    const phone = searchParams.get('phone');
    const firstName = searchParams.get('first_name');
    const lastName = searchParams.get('last_name');

    const [otp, setOtp] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        console.log({
            otp,
            role,
            phone,
            first_name: firstName,
            last_name: lastName,
        });

        // بعد از تأیید OTP
        router.push(
            `/auth/password?role=${role}&phone=${encodeURIComponent(phone || '')}`,
        );
    };

    return (
        <div
            dir="rtl"
            className={`${vazir.className} flex min-h-screen items-center justify-center bg-[#f8faf9] px-5 py-10`}
        >
            <div className="w-full max-w-[535px] rounded-[22px] border border-[#dfe7e4] bg-white px-5 py-8 shadow-[0_15px_40px_rgba(18,60,53,0.08)] sm:px-8 sm:py-9">
                <div className="text-center">
                    <h1 className="text-[22px] font-extrabold text-[#123c35] sm:text-[25px]">
                        تأیید شماره موبایل
                    </h1>

                    <p className="mt-3 text-[13px] leading-7 text-[#7c8985]">
                        کد تأیید ارسال شده به شماره
                    </p>

                    <p className="mt-1 text-[14px] font-bold text-[#123c35]">
                        {phone}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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
                            maxLength={6}
                            value={otp}
                            onChange={(e) =>
                                setOtp(e.target.value.replace(/\D/g, ''))
                            }
                            placeholder="کد ۶ رقمی را وارد کنید"
                            required
                            className="h-[52px] w-full rounded-[13px] border border-[#dfe7e4] bg-[#fafcfb] px-4 text-center text-[18px] font-bold tracking-[8px] text-[#123c35] outline-none transition placeholder:text-[12px] placeholder:tracking-normal focus:border-[#1c554a] focus:ring-2 focus:ring-[#1c554a]/10"
                        />
                    </div>

                    <button
                        type="submit"
                        className="h-[52px] w-full rounded-[13px] bg-[#123c35] text-[14px] font-bold text-white transition hover:bg-[#1c554a] active:scale-[0.99]"
                    >
                        تأیید کد
                    </button>

                    <button
                        type="button"
                        className="w-full text-center text-[12px] font-bold text-[#c9a96e] hover:underline"
                    >
                        ارسال مجدد کد
                    </button>
                </form>
            </div>
        </div>
    );
}
