'use client';

import { useState } from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

export default function SensitiveAccessPage({ requestId }) {
    const [reason, setReason] = useState('');

    const [submitted, setSubmitted] = useState(false);

    const displayRequestId = requestId ? `verify-${requestId}` : '';

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!reason.trim()) {
            return;
        }

        setSubmitted(true);
    };

    return (
        <div dir="rtl" className="mx-auto w-full max-w-[1280px]">
            {/* ================= Page Header ================= */}

            <header className="mb-7">
                <div className="mb-3 flex items-center justify-end gap-3">
                    <span className="h-px w-10 bg-[#c9a96e]" />

                    <span className="text-sm font-bold text-[#9a7731]">
                        دسترسی به اطلاعات حساس
                    </span>
                </div>

                <h1 className="text-2xl font-black text-[#123f37] sm:text-3xl">
                    ثبت دلیل مشاهده
                </h1>

                <p className="mt-3 text-sm leading-7 text-[#7d8984]">
                    مشاهده اطلاعات حساس فقط در محدوده وظیفه و با ثبت دلیل ممکن
                    است.
                </p>
            </header>

            {/* ================= Main Card ================= */}

            <section className="rounded-2xl border border-[#dce4df] bg-white p-5 shadow-[0_8px_25px_rgba(15,52,45,0.05)] md:p-6 lg:p-7">
                {/* Security Notice */}

                <div className="rounded-xl border border-[#ead9a9] bg-[#fff9e9] px-4 py-4">
                    <div className="flex items-start gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#a17b2c]">
                            <AlertTriangle size={17} strokeWidth={1.8} />
                        </span>

                        <div>
                            <h2 className="text-sm font-bold text-[#263d36]">
                                حسابرسی دسترسی
                            </h2>

                            <p className="mt-1 text-xs leading-6 text-[#8a918d]">
                                شناسه مدیر، دلیل، زمان، پرونده مرتبط و داده
                                مشاهده‌شده در رویدادهای امنیتی ثبت می‌شود.
                            </p>
                        </div>
                    </div>
                </div>

                {/* ================= Form ================= */}

                <form onSubmit={handleSubmit} className="mt-5">
                    {/* Reason */}

                    <div>
                        <label
                            htmlFor="access-reason"
                            className="mb-2 block text-sm font-bold text-[#263f38]"
                        >
                            دلیل مشاهده اطلاعات
                        </label>

                        <textarea
                            id="access-reason"
                            value={reason}
                            onChange={(event) => setReason(event.target.value)}
                            placeholder="مثلاً بررسی تطبیق هویت و شماره پرونده برای تصمیم احراز..."
                            rows={6}
                            className="w-full resize-none rounded-xl border border-[#cfd9d4] bg-white px-4 py-3 text-sm leading-7 text-[#263f38] outline-none transition placeholder:text-[#a2aaa6] focus:border-[#17463c] focus:ring-2 focus:ring-[#17463c]/10"
                        />
                    </div>

                    {/* Request ID */}

                    <div className="mt-5">
                        <label
                            htmlFor="request-id"
                            className="mb-2 block text-sm font-bold text-[#263f38]"
                        >
                            شماره درخواست یا پرونده مرتبط
                        </label>

                        <input
                            id="request-id"
                            type="text"
                            value={displayRequestId}
                            readOnly
                            placeholder="شماره درخواست"
                            className="w-full rounded-xl border border-[#cfd9d4] bg-[#fafcfb] px-4 py-3 text-sm text-[#263f38] outline-none"
                        />
                    </div>

                    {/* Submit */}

                    <div className="mt-5 flex justify-end">
                        <button
                            type="submit"
                            disabled={!reason.trim() || submitted}
                            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#123f37] px-6 text-sm font-bold text-white shadow-[0_8px_20px_rgba(18,63,55,0.14)] transition hover:bg-[#0e332d] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <ShieldCheck size={18} strokeWidth={1.8} />

                            {submitted
                                ? 'دلیل ثبت شد'
                                : 'ثبت دلیل و ایجاد دسترسی موقت'}
                        </button>
                    </div>
                </form>

                {/* ================= Success ================= */}

                {submitted && (
                    <div className="mt-5 rounded-xl border border-[#b9d8c7] bg-[#f0faf4] px-4 py-4">
                        <p className="text-sm font-bold text-[#246044]">
                            دلیل دسترسی با موفقیت ثبت شد.
                        </p>

                        <p className="mt-1 text-xs leading-6 text-[#5d7569]">
                            دسترسی موقت برای درخواست{' '}
                            <strong>{displayRequestId}</strong> ایجاد شد.
                        </p>
                    </div>
                )}
            </section>
        </div>
    );
}
