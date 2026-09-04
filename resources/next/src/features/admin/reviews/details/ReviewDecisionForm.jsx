'use client';

import { useState } from 'react';

const actionMessages = {
    publish: 'بازخورد با موفقیت تأیید و منتشر شد.',
    reject: 'بازخورد رد شد.',
    report: 'بازخورد به گزارش تخلف تبدیل شد.',
};

export default function ReviewDecisionForm({ review }) {
    const [publishableText, setPublishableText] = useState(
        review.editableText,
    );

    const [reason, setReason] = useState('');
    const [loadingAction, setLoadingAction] = useState(null);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    async function handleAction(action) {
        setError('');
        setResult(null);

        if (!reason.trim()) {
            setError('واردکردن دلیل تصمیم الزامی است.');
            return;
        }

        if (action === 'publish' && !publishableText.trim()) {
            setError('متن قابل انتشار نمی‌تواند خالی باشد.');
            return;
        }

        setLoadingAction(action);

        try {
            // بعداً درخواست واقعی API را اینجا قرار بده.
            await new Promise((resolve) => setTimeout(resolve, 700));

            const requestData = {
                reviewId: review.id,
                action,
                publishableText: publishableText.trim(),
                reason: reason.trim(),
            };

            console.log('Review decision:', requestData);

            setResult({
                action,
                message: actionMessages[action],
            });
        } catch {
            setError('ثبت عملیات انجام نشد. دوباره تلاش کنید.');
        } finally {
            setLoadingAction(null);
        }
    }

    const isLoading = Boolean(loadingAction);
    const isFinished = Boolean(result);

    return (
        <section className="rounded-[22px] border border-[#dce5e1] bg-white p-5 shadow-[0_7px_25px_rgba(20,61,52,0.05)]">
            <div className="border-b border-[#e4eae7] pb-4">
                <h2 className="text-lg font-black text-[#173e38]">
                    نسخه قابل انتشار
                </h2>

                <p className="mt-2 text-xs leading-6 text-[#82908b]">
                    متن نهایی و دلیل تصمیم مدیر را ثبت کنید.
                </p>
            </div>

            <label
                htmlFor="publishable-review"
                className="mt-5 block text-sm font-bold text-[#173e38]"
            >
                متن پس از ویرایش مدیر
            </label>

            <textarea
                id="publishable-review"
                value={publishableText}
                disabled={isLoading || isFinished}
                onChange={(event) => {
                    setPublishableText(event.target.value);
                    setError('');
                }}
                className="mt-3 min-h-36 w-full resize-y rounded-xl border border-[#d5dedb] bg-white p-4 text-sm leading-7 outline-none transition placeholder:text-[#929d99] focus:border-[#b78b35] focus:ring-2 focus:ring-[#c89a3b]/15 disabled:cursor-not-allowed disabled:bg-[#f6f8f7] disabled:text-[#7e8985]"
            />

            <div className="mt-4 flex items-center justify-between gap-3 text-xs">
                <span className="text-[#7e8a86]">
                    تعداد نویسه: {publishableText.length}
                </span>

                <button
                    type="button"
                    disabled={isLoading || isFinished}
                    onClick={() =>
                        setPublishableText(review.editableText)
                    }
                    className="font-bold text-[#956b1d] transition hover:text-[#704e12] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    بازگردانی متن اصلی
                </button>
            </div>

            <label
                htmlFor="decision-reason"
                className="mt-5 block text-sm font-bold text-[#173e38]"
            >
                دلیل تصمیم
                <span className="mr-1 text-red-500">*</span>
            </label>

            <textarea
                id="decision-reason"
                value={reason}
                disabled={isLoading || isFinished}
                onChange={(event) => {
                    setReason(event.target.value);
                    setError('');
                }}
                placeholder="دلیل روشن و قابل حسابرسی وارد کنید..."
                className={`mt-3 min-h-28 w-full resize-y rounded-xl border bg-white p-4 text-sm outline-none transition placeholder:text-[#929d99] focus:ring-2 disabled:cursor-not-allowed disabled:bg-[#f6f8f7] ${
                    error
                        ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                        : 'border-[#d5dedb] focus:border-[#b78b35] focus:ring-[#c89a3b]/15'
                }`}
            />

            {error && (
                <div
                    role="alert"
                    className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600"
                >
                    {error}
                </div>
            )}

            {result && (
                <div
                    role="status"
                    className={`mt-4 rounded-xl border px-4 py-3 text-sm font-medium ${
                        result.action === 'publish'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : result.action === 'reject'
                                ? 'border-red-200 bg-red-50 text-red-600'
                                : 'border-amber-200 bg-amber-50 text-amber-700'
                    }`}
                >
                    {result.message}
                </div>
            )}

            {!isFinished ? (
                <div className="mt-5 flex flex-wrap justify-end gap-3">
                    <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleAction('reject')}
                        className="min-w-28 rounded-xl bg-[#b6414b] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#a13640] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loadingAction === 'reject'
                            ? 'در حال ثبت...'
                            : 'رد بازخورد'}
                    </button>

                    <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleAction('report')}
                        className="min-w-36 rounded-xl border border-[#d5a746] bg-[#fffcf5] px-5 py-3 text-sm font-bold text-[#173e38] transition hover:bg-[#fff7e6] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loadingAction === 'report'
                            ? 'در حال ثبت...'
                            : 'تبدیل به گزارش تخلف'}
                    </button>

                    <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleAction('publish')}
                        className="min-w-32 rounded-xl bg-[#124b40] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0c3c34] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loadingAction === 'publish'
                            ? 'در حال انتشار...'
                            : 'تأیید و انتشار'}
                    </button>
                </div>
            ) : (
                <div className="mt-5 flex justify-end">
                    <button
                        type="button"
                        onClick={() => {
                            setResult(null);
                            setReason('');
                            setError('');
                        }}
                        className="rounded-xl border border-[#d5dedb] bg-white px-5 py-3 text-sm font-bold text-[#173e38] transition hover:bg-[#f6f8f7]"
                    >
                        ثبت تصمیم جدید
                    </button>
                </div>
            )}
        </section>
    );
}
