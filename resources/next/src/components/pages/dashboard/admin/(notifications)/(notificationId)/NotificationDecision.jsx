'use client';

import { useState } from 'react';

export default function NotificationDecision({ notification }) {
    const [reason, setReason] = useState('');
    const [message, setMessage] = useState(notification.message);
    const [loadingAction, setLoadingAction] = useState(null);
    const [result, setResult] = useState('');
    const [error, setError] = useState('');

    async function handleAction(action) {
        setError('');
        setResult('');

        if (!reason.trim()) {
            setError('واردکردن دلیل تصمیم الزامی است.');
            return;
        }

        if (!message.trim()) {
            setError('متن اعلان نمی‌تواند خالی باشد.');
            return;
        }

        setLoadingAction(action);

        try {
            await new Promise((resolve) => setTimeout(resolve, 600));

            console.log({
                notificationId: notification.id,
                action,
                message: message.trim(),
                reason: reason.trim(),
            });

            const actionMessages = {
                save: 'یادداشت و تنظیمات اعلان ذخیره شد.',
                refer: 'اعلان برای بررسی بیشتر ارجاع داده شد.',
                submit: 'تصمیم مدیر با موفقیت ثبت شد.',
            };

            setResult(actionMessages[action]);
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
                htmlFor="notification-message"
                className="mt-5 block text-sm font-bold"
            >
                متن قابل انتشار
            </label>

            <textarea
                id="notification-message"
                value={message}
                disabled={isLoading}
                onChange={(event) => setMessage(event.target.value)}
                className="mt-3 min-h-28 w-full resize-y rounded-xl border border-[#d5dedb] bg-white p-4 text-sm leading-7 outline-none focus:border-[#b78b35] focus:ring-2 focus:ring-[#c89a3b]/15"
            />

            <label
                htmlFor="notification-decision-reason"
                className="mt-5 block text-sm font-bold"
            >
                دلیل اقدام یا یادداشت مدیریتی
                <span className="mr-1 text-red-500">*</span>
            </label>

            <textarea
                id="notification-decision-reason"
                value={reason}
                disabled={isLoading}
                onChange={(event) => {
                    setReason(event.target.value);
                    setError('');
                    setResult('');
                }}
                placeholder="دلیل روشن و قابل حسابرسی وارد کنید..."
                className={`mt-3 min-h-28 w-full resize-y rounded-xl border bg-white p-4 text-sm outline-none ${
                    error
                        ? 'border-red-300 focus:ring-2 focus:ring-red-100'
                        : 'border-[#d5dedb] focus:border-[#b78b35] focus:ring-2 focus:ring-[#c89a3b]/15'
                }`}
            />

            {error && (
                <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                </p>
            )}

            {result && (
                <p className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {result}
                </p>
            )}

            <div className="mt-4 flex flex-wrap justify-end gap-3">
                <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleAction('save')}
                    className="rounded-xl border border-[#d5dedb] bg-white px-5 py-3 text-sm font-bold transition hover:bg-[#f6f8f7] disabled:opacity-50"
                >
                    {loadingAction === 'save'
                        ? 'در حال ذخیره...'
                        : 'ذخیره یادداشت'}
                </button>

                <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleAction('refer')}
                    className="rounded-xl border border-[#d5a746] bg-[#fffcf5] px-5 py-3 text-sm font-bold transition hover:bg-[#fff7e6] disabled:opacity-50"
                >
                    {loadingAction === 'refer'
                        ? 'در حال ارجاع...'
                        : 'ارجاع برای بررسی'}
                </button>

                <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleAction('submit')}
                    className="rounded-xl bg-[#124b40] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0c3c34] disabled:opacity-50"
                >
                    {loadingAction === 'submit' ? 'در حال ثبت...' : 'ثبت تصمیم'}
                </button>
            </div>
        </section>
    );
}
