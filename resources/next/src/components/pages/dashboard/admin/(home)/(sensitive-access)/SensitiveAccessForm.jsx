'use client';

import { CheckCircle2, LoaderCircle } from 'lucide-react';
import { useState } from 'react';

import SensitiveAccessWarning from './SensitiveAccessWarning';

const initialForm = {
    reason: '',
    requestNumber: '',
};

export default function SensitiveAccessForm() {
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    function handleChange(event) {
        const { name, value } = event.target;

        setForm((previousForm) => ({
            ...previousForm,
            [name]: value,
        }));

        setErrors((previousErrors) => ({
            ...previousErrors,
            [name]: '',
        }));

        setSuccessMessage('');
    }

    function validateForm() {
        const validationErrors = {};
        const normalizedReason = form.reason.trim();
        const normalizedRequestNumber = form.requestNumber.trim();

        if (!normalizedReason) {
            validationErrors.reason = 'وارد کردن دلیل مشاهده الزامی است.';
        } else if (normalizedReason.length < 10) {
            validationErrors.reason = 'دلیل مشاهده باید حداقل ۱۰ کاراکتر باشد.';
        } else if (normalizedReason.length > 1000) {
            validationErrors.reason =
                'دلیل مشاهده نمی‌تواند بیشتر از ۱۰۰۰ کاراکتر باشد.';
        }

        if (!normalizedRequestNumber) {
            validationErrors.requestNumber =
                'شماره درخواست یا پرونده الزامی است.';
        } else if (normalizedRequestNumber.length < 3) {
            validationErrors.requestNumber =
                'شماره درخواست واردشده معتبر نیست.';
        }

        return validationErrors;
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const validationErrors = validateForm();

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsSubmitting(true);
        setErrors({});
        setSuccessMessage('');

        try {
            /*
             * بعد از آماده‌شدن API بک‌اند، این قسمت را فعال کن:
             *
             * const response = await fetch(
             *     `${process.env.NEXT_PUBLIC_API_URL}/api/admin/sensitive-access`,
             *     {
             *         method: 'POST',
             *         credentials: 'include',
             *         headers: {
             *             'Content-Type': 'application/json',
             *             Accept: 'application/json',
             *         },
             *         body: JSON.stringify({
             *             reason: form.reason.trim(),
             *             request_number:
             *                 form.requestNumber.trim(),
             *         }),
             *     },
             * );
             *
             * const result = await response.json();
             *
             * if (!response.ok) {
             *     throw new Error(
             *         result.message ||
             *             'ثبت دلیل دسترسی انجام نشد.',
             *     );
             * }
             */

            await new Promise((resolve) => {
                setTimeout(resolve, 700);
            });

            setSuccessMessage(
                'دلیل مشاهده با موفقیت ثبت شد و دسترسی موقت ایجاد گردید.',
            );

            setForm(initialForm);
        } catch (error) {
            setErrors({
                submit: error.message || 'هنگام ثبت اطلاعات خطایی رخ داد.',
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    const reasonCharacterCount = form.reason.length;

    return (
        <section className="rounded-2xl border border-[#dce4df] bg-white p-5 shadow-[0_8px_25px_rgba(15,52,45,0.05)] md:p-7">
            <SensitiveAccessWarning />

            <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
                <div>
                    <div className="mb-2 flex items-center justify-between gap-3">
                        <label
                            htmlFor="reason"
                            className="text-sm font-black text-[#273d37]"
                        >
                            دلیل مشاهده اطلاعات
                        </label>

                        <span
                            className={`text-xs ${
                                reasonCharacterCount > 1000
                                    ? 'text-red-500'
                                    : 'text-[#89958f]'
                            }`}
                        >
                            {reasonCharacterCount.toLocaleString('fa-IR')}
                            /۱۰۰۰
                        </span>
                    </div>

                    <textarea
                        id="reason"
                        name="reason"
                        value={form.reason}
                        onChange={handleChange}
                        rows={6}
                        maxLength={1100}
                        placeholder="مثلاً: بررسی تطبیق هویت و شماره پروانه برای تصمیم‌گیری درباره درخواست احراز"
                        aria-invalid={Boolean(errors.reason)}
                        aria-describedby={
                            errors.reason ? 'reason-error' : undefined
                        }
                        className={`min-h-[160px] w-full resize-y rounded-xl border bg-white px-4 py-3 text-sm leading-7 text-[#263d37] outline-none transition placeholder:text-[#a3aca8] ${
                            errors.reason
                                ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-50'
                                : 'border-[#d4ddd8] focus:border-[#b99243] focus:ring-4 focus:ring-[#b99243]/10'
                        }`}
                    />

                    {errors.reason ? (
                        <p
                            id="reason-error"
                            className="mt-2 text-xs font-medium text-red-500"
                        >
                            {errors.reason}
                        </p>
                    ) : null}
                </div>

                <div>
                    <label
                        htmlFor="requestNumber"
                        className="mb-2 block text-sm font-black text-[#273d37]"
                    >
                        شماره درخواست یا پرونده مرتبط
                    </label>

                    <input
                        id="requestNumber"
                        name="requestNumber"
                        type="text"
                        value={form.requestNumber}
                        onChange={handleChange}
                        placeholder="مثلاً verify-301"
                        autoComplete="off"
                        aria-invalid={Boolean(errors.requestNumber)}
                        aria-describedby={
                            errors.requestNumber
                                ? 'request-number-error'
                                : undefined
                        }
                        className={`h-12 w-full rounded-xl border bg-white px-4 text-sm text-[#263d37] outline-none transition placeholder:text-[#a3aca8] ${
                            errors.requestNumber
                                ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-50'
                                : 'border-[#d4ddd8] focus:border-[#b99243] focus:ring-4 focus:ring-[#b99243]/10'
                        }`}
                    />

                    {errors.requestNumber ? (
                        <p
                            id="request-number-error"
                            className="mt-2 text-xs font-medium text-red-500"
                        >
                            {errors.requestNumber}
                        </p>
                    ) : null}
                </div>

                {errors.submit ? (
                    <div
                        role="alert"
                        className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
                    >
                        {errors.submit}
                    </div>
                ) : null}

                {successMessage ? (
                    <div
                        role="status"
                        className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"
                    >
                        <CheckCircle2 size={18} />

                        {successMessage}
                    </div>
                ) : null}

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#0d493e] px-6 py-3 text-sm font-bold text-white shadow-[0_8px_20px_rgba(13,73,62,0.16)] transition hover:bg-[#0a3c33] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isSubmitting ? (
                            <>
                                <LoaderCircle
                                    size={18}
                                    className="animate-spin"
                                />
                                در حال ثبت...
                            </>
                        ) : (
                            'ثبت دلیل و ایجاد دسترسی موقت'
                        )}
                    </button>
                </div>
            </form>
        </section>
    );
}
