'use client';

import { Info } from 'lucide-react';
import { useState } from 'react';

import { reviewDisputeOptions } from '../../reviews/dispute/reviewDisputeOptions';

export default function ReviewDisputeForm({ reviewId, onSuccess }) {
    const [form, setForm] = useState({
        type: 'professional_response',
        explanation: '',
        confirmation: false,
    });

    const [error, setError] = useState('');

    function handleChange(event) {
        const { name, value, type, checked } = event.target;

        setForm((currentForm) => ({
            ...currentForm,

            [name]: type === 'checkbox' ? checked : value,
        }));
    }

    function handleSubmit(event) {
        event.preventDefault();

        if (!reviewId) {
            setError('شناسه بازخورد مشخص نیست.');
            return;
        }

        if (!form.explanation.trim()) {
            setError('توضیح پاسخ یا درخواست را وارد کنید.');
            return;
        }

        if (!form.confirmation) {
            setError('تأیید عدم درج اطلاعات محرمانه الزامی است.');
            return;
        }

        const request = {
            id: `RDR-${Date.now()}`,

            reviewId,

            type: form.type,

            explanation: form.explanation.trim(),

            status: 'submitted',

            submittedAt: new Date().toISOString(),
        };

        const storageKey = 'vakilam-review-dispute-requests';

        try {
            const storedRequests = JSON.parse(
                window.localStorage.getItem(storageKey) ?? '[]',
            );

            window.localStorage.setItem(
                storageKey,
                JSON.stringify([request, ...storedRequests]),
            );
        } catch {
            window.localStorage.setItem(storageKey, JSON.stringify([request]));
        }

        setError('');
        onSuccess(request);
    }

    return (
        <section className="rounded-2xl border border-[#dce6e2] bg-white p-6 shadow-sm">
            <div className="flex items-start gap-3 rounded-xl border border-sky-200 bg-sky-50 p-4">
                <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-white text-sky-700">
                    <Info size={19} />
                </div>

                <div>
                    <h2 className="text-sm font-bold text-[#183d36]">
                        اصل بی‌طرفی
                    </h2>

                    <p className="mt-2 text-sm leading-7 text-[#71817d]">
                        مدیر می‌تواند پاسخ را منتشر، بخش حساس را حذف، رد یا به
                        گزارش تخلف تبدیل کند.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-5">
                <label className="block">
                    <span className="mb-2 block text-sm font-bold text-[#183d36]">
                        نوع درخواست
                    </span>

                    <select
                        name="type"
                        value={form.type}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-[#dce6e2] bg-white px-4 py-3 text-sm text-[#183d36] outline-none transition focus:border-[#0b5648]"
                    >
                        {reviewDisputeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="mt-5 block">
                    <span className="mb-2 block text-sm font-bold text-[#183d36]">
                        توضیح وکیل
                    </span>

                    <textarea
                        name="explanation"
                        value={form.explanation}
                        onChange={handleChange}
                        rows={8}
                        maxLength={2000}
                        placeholder="پاسخ یا دلیل درخواست بررسی را محترمانه و بدون اطلاعات محرمانه بنویسید..."
                        className="w-full resize-y rounded-xl border border-[#dce6e2] bg-white px-4 py-3 text-sm leading-8 text-[#183d36] outline-none transition placeholder:text-[#9aa6a2] focus:border-[#0b5648]"
                    />

                    <span className="mt-2 block text-left text-xs text-[#879590]">
                        {form.explanation.length.toLocaleString('fa-IR')}
                        /۲۰۰۰
                    </span>
                </label>

                <label className="mt-4 flex cursor-pointer items-start gap-3">
                    <input
                        type="checkbox"
                        name="confirmation"
                        checked={form.confirmation}
                        onChange={handleChange}
                        className="mt-1 size-4 accent-[#0b5648]"
                    />

                    <span className="text-sm leading-7 text-[#52635e]">
                        پاسخ من شامل اطلاعات محرمانه، شماره تماس، نشانی یا راه
                        ارتباطی بیرونی نیست.
                    </span>
                </label>

                {error && (
                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <div className="mt-5 flex justify-end">
                    <button
                        type="submit"
                        className="rounded-xl bg-[#0b5648] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#073f35]"
                    >
                        ثبت درخواست برای مدیر
                    </button>
                </div>
            </form>
        </section>
    );
}
