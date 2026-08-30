'use client';

import { useState } from 'react';

const actionMessages = {
    restrict: 'دسترسی کاربر با موفقیت محدود شد.',
    save: 'یادداشت مدیریتی ذخیره شد.',
    refer: 'رویداد برای بررسی بیشتر ارجاع داده شد.',
    submit: 'تصمیم مدیر ثبت شد.',
};

export default function SecurityDecision({ eventId }) {
    const [reason, setReason] = useState('');
    const [loadingAction, setLoadingAction] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    async function handleAction(action) {
        setError('');
        setMessage('');

        if (!reason.trim()) {
            setError('واردکردن دلیل اقدام الزامی است.');
            return;
        }

        setLoadingAction(action);

        try {
            // این بخش بعداً با درخواست واقعی API جایگزین می‌شود.
            await new Promise((resolve) => setTimeout(resolve, 600));

            console.log({
                eventId,
                action,
                reason: reason.trim(),
            });

            setMessage(actionMessages[action]);
        } catch {
            setError('عملیات انجام نشد. دوباره تلاش کنید.');
        } finally {
            setLoadingAction(null);
        }
    }

    const isLoading = Boolean(loadingAction);

    return (
        <section className="rounded-[22px] border border-[#dce5e1] bg-white p-5 shadow-[0_7px_25px_rgba(20,61,52,0.05)]">
            <h2 className="border-b border-[#e4eae7] pb-4 text-lg font-black">
                تصمیم و اقدام مدیر
            </h2>

            <label
                htmlFor="security-decision-reason"
                className="mt-5 block text-sm font-bold"
            >
                دلیل اقدام یا یادداشت مدیریتی
                <span className="mr-1 text-red-500">*</span>
            </label>

            <textarea
                id="security-decision-reason"
                value={reason}
                disabled={isLoading}
                onChange={(event) => {
                    setReason(event.target.value);
                    setError('');
                    setMessage('');
                }}
                placeholder="دلیل روشن و قابل حسابرسی وارد کنید..."
                className={`mt-3 min-h-32 w-full resize-y rounded-xl border bg-white p-4 text-sm outline-none transition disabled:cursor-not-allowed disabled:bg-[#f6f8f7] ${
                    error
                        ? 'border-red-300 focus:ring-2 focus:ring-red-100'
                        : 'border-[#d5dedb] focus:border-[#b78b35] focus:ring-2 focus:ring-[#c89a3b]/15'
                }`}
            />

            {error && (
                <p
                    role="alert"
                    className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
                >
                    {error}
                </p>
            )}

            {message && (
                <p
                    role="status"
                    className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
                >
                    {message}
                </p>
            )}

            <div className="mt-4 flex flex-wrap justify-end gap-3">
                <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleAction('restrict')}
                    className="rounded-xl bg-[#b6414b] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#a13640] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loadingAction === 'restrict'
                        ? 'در حال ثبت...'
                        : 'محدودسازی دسترسی'}
                </button>

                <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleAction('save')}
                    className="rounded-xl border border-[#d5dedb] bg-white px-5 py-3 text-sm font-bold transition hover:bg-[#f6f8f7] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loadingAction === 'save'
                        ? 'در حال ذخیره...'
                        : 'ذخیره یادداشت'}
                </button>

                <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleAction('refer')}
                    className="rounded-xl border border-[#d5a746] bg-[#fffcf5] px-5 py-3 text-sm font-bold transition hover:bg-[#fff7e6] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loadingAction === 'refer'
                        ? 'در حال ارجاع...'
                        : 'ارجاع برای بررسی'}
                </button>

                <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleAction('submit')}
                    className="rounded-xl bg-[#124b40] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0c3c34] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loadingAction === 'submit' ? 'در حال ثبت...' : 'ثبت تصمیم'}
                </button>
            </div>
        </section>
    );
}
