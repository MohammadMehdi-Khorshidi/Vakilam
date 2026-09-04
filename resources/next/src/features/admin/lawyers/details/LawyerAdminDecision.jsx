'use client';

import { CheckCircle2, LoaderCircle } from 'lucide-react';

import { useState } from 'react';

export default function LawyerAdminDecision({ lawyerId }) {
    const [note, setNote] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loadingAction, setLoadingAction] = useState('');

    function validateNote() {
        const normalizedNote = note.trim();

        if (!normalizedNote) {
            return 'وارد کردن دلیل اقدام یا یادداشت الزامی است.';
        }

        if (normalizedNote.length < 10) {
            return 'توضیحات باید حداقل ۱۰ کاراکتر باشد.';
        }

        if (normalizedNote.length > 1000) {
            return 'توضیحات نمی‌تواند بیشتر از ۱۰۰۰ کاراکتر باشد.';
        }

        return '';
    }

    async function handleAction(action) {
        const validationError = validateNote();

        if (validationError) {
            setError(validationError);
            setSuccess('');
            return;
        }

        setLoadingAction(action);
        setError('');
        setSuccess('');

        try {
            /*
             * اتصال API Laravel:
             *
             * const response = await fetch(
             *     `${process.env.NEXT_PUBLIC_API_URL}/api/admin/lawyersAdmin/${lawyerId}/decisions`,
             *     {
             *         method: 'POST',
             *         credentials: 'include',
             *         headers: {
             *             Accept: 'application/json',
             *             'Content-Type': 'application/json',
             *         },
             *         body: JSON.stringify({
             *             action,
             *             note: note.trim(),
             *         }),
             *     },
             * );
             *
             * const result = await response.json();
             *
             * if (!response.ok) {
             *     throw new Error(
             *         result.message ||
             *             'ثبت عملیات انجام نشد.',
             *     );
             * }
             */

            await new Promise((resolve) => {
                setTimeout(resolve, 600);
            });

            const messages = {
                save_note: 'یادداشت مدیریتی با موفقیت ذخیره شد.',

                refer_review: 'وکیل برای بررسی بیشتر ارجاع شد.',

                submit_decision: 'تصمیم مدیر با موفقیت ثبت شد.',
            };

            setSuccess(messages[action]);
            setNote('');
        } catch (actionError) {
            setError(actionError.message || 'هنگام ثبت اطلاعات خطایی رخ داد.');
        } finally {
            setLoadingAction('');
        }
    }

    const isSubmitting = Boolean(loadingAction);

    return (
        <section className="mt-5 rounded-2xl border border-[#dce4df] bg-white p-5 shadow-[0_8px_25px_rgba(15,52,45,0.04)] md:p-6">
            <header className="border-b border-[#e1e7e3] pb-4">
                <h2 className="text-lg font-black text-[#173d35]">
                    تصمیم و اقدام مدیر
                </h2>
            </header>

            <div className="mt-5">
                <div className="mb-2 flex items-center justify-between gap-3">
                    <label
                        htmlFor="lawyer-admin-note"
                        className="text-sm font-black text-[#263f38]"
                    >
                        دلیل اقدام یا یادداشت مدیریتی
                    </label>

                    <span
                        className={`text-xs ${
                            note.length > 1000
                                ? 'text-red-500'
                                : 'text-[#87938d]'
                        }`}
                    >
                        {note.length.toLocaleString('fa-IR')}
                        /۱۰۰۰
                    </span>
                </div>

                <textarea
                    id="lawyer-admin-note"
                    value={note}
                    onChange={(event) => {
                        setNote(event.target.value);
                        setError('');
                        setSuccess('');
                    }}
                    rows={5}
                    maxLength={1050}
                    placeholder="دلیل روشن و قابل حسابرسی وارد کنید..."
                    className={`min-h-[130px] w-full resize-y rounded-xl border bg-white px-4 py-3 text-sm leading-7 outline-none transition ${
                        error
                            ? 'border-red-400 focus:ring-4 focus:ring-red-50'
                            : 'border-[#d4ddd8] focus:border-[#b99243] focus:ring-4 focus:ring-[#b99243]/10'
                    }`}
                />

                {error ? (
                    <p className="mt-2 text-xs font-medium text-red-500">
                        {error}
                    </p>
                ) : null}

                {success ? (
                    <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                        <CheckCircle2 size={18} />

                        {success}
                    </div>
                ) : null}

                <div className="mt-5 flex flex-wrap justify-end gap-3">
                    <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => handleAction('save_note')}
                        className="min-h-11 rounded-xl border border-[#d4ddd8] bg-white px-5 text-sm font-bold text-[#173d35] transition hover:bg-[#f7faf8] disabled:opacity-50"
                    >
                        ذخیره یادداشت
                    </button>

                    <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => handleAction('refer_review')}
                        className="min-h-11 rounded-xl border border-[#d3a64e] bg-[#fffaf0] px-5 text-sm font-bold text-[#173d35] transition hover:bg-[#fdf2db] disabled:opacity-50"
                    >
                        ارجاع برای بررسی
                    </button>

                    <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => handleAction('submit_decision')}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0d493e] px-5 text-sm font-bold text-white transition hover:bg-[#0a3c33] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loadingAction === 'submit_decision' ? (
                            <>
                                <LoaderCircle
                                    size={17}
                                    className="animate-spin"
                                />
                                در حال ثبت
                            </>
                        ) : (
                            'ثبت تصمیم'
                        )}
                    </button>
                </div>
            </div>
        </section>
    );
}
