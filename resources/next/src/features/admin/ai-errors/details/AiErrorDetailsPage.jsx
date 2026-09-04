import Link from 'next/link';

import AiErrorDecision from './AiErrorDecision';

const recordItems = [
    {
        key: 'id',
        label: 'شناسه اصلاح',
    },
    {
        key: 'field',
        label: 'فیلد',
    },
    {
        key: 'aiSuggestion',
        label: 'پیشنهاد هوش مصنوعی',
    },
    {
        key: 'correctedValue',
        label: 'مقدار اصلاح‌شده',
    },
    {
        key: 'corrector',
        label: 'اصلاح‌کننده',
    },
    {
        key: 'correctedAt',
        label: 'زمان اصلاح',
    },
];

function InfoIcon() {
    return (
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white font-bold text-[#28728d]">
            i
        </span>
    );
}

export default function AiErrorDetailsPage({ error }) {
    return (
        <main
            dir="rtl"
            className="min-h-screen bg-[#f7f9f6] px-4 py-8 text-[#123b34] sm:px-6 lg:px-10"
        >
            <div className="mx-auto w-full max-w-[1500px]">
                <header className="mb-8">
                    <div className="mb-6 flex items-center gap-2 text-sm">
                        <Link
                            href="/admin/ai-errors"
                            className="text-[#76837f] transition hover:text-[#174a40]"
                        >
                            خطاهای هوش مصنوعی
                        </Link>

                        <span className="text-[#aeb7b4]">/</span>

                        <span className="font-bold text-[#263c37]">
                            {error.id}
                        </span>
                    </div>

                    <div className="mb-4 flex items-center gap-3 text-sm font-bold text-[#a8791e]">
                        <span>تاریخچه اصلاح خروجی هوش مصنوعی</span>
                        <span className="h-px w-8 bg-[#c89328]" />
                    </div>

                    <h1 className="text-3xl font-black tracking-[-0.04em] text-[#103a33] sm:text-[38px]">
                        {error.field}
                    </h1>

                    <p className="mt-3 text-sm text-[#74817d]">
                        {error.id}
                        <span className="mx-2">•</span>
                        اصلاح توسط {error.corrector}
                    </p>

                    <span className="mt-5 inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                        {error.status}
                    </span>
                </header>

                <div className="grid gap-5 lg:grid-cols-[minmax(0,1.9fr)_minmax(320px,1fr)]">
                    {/* اطلاعات کامل */}
                    <section className="rounded-[22px] border border-[#dce5e1] bg-white p-5 shadow-[0_7px_25px_rgba(20,61,52,0.05)]">
                        <div className="border-b border-[#e4eae7] pb-4">
                            <h2 className="text-lg font-black">
                                اطلاعات کامل رکورد
                            </h2>

                            <p className="mt-2 text-xs text-[#89948f]">
                                اطلاعات عملیاتی قابل مشاهده در سطح فعلی
                            </p>
                        </div>

                        <dl className="mt-4 grid overflow-hidden rounded-2xl border border-[#dce4e1] sm:grid-cols-2">
                            {recordItems.map((item) => (
                                <div
                                    key={item.key}
                                    className="min-h-[92px] border-b border-[#dce4e1] p-4 odd:sm:border-l"
                                >
                                    <dt className="text-xs text-[#89948f]">
                                        {item.label}
                                    </dt>

                                    <dd
                                        className={`mt-2 text-sm font-bold ${
                                            item.key === 'aiSuggestion'
                                                ? 'text-[#a34949]'
                                                : 'text-[#143c35]'
                                        }`}
                                    >
                                        {error[item.key]}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </section>

                    {/* کنترل دسترسی */}
                    <aside className="rounded-[22px] border border-[#dce5e1] bg-white p-5 shadow-[0_7px_25px_rgba(20,61,52,0.05)]">
                        <div className="border-b border-[#e4eae7] pb-4">
                            <h2 className="text-lg font-black">
                                کنترل دسترسی و سابقه
                            </h2>

                            <p className="mt-2 text-xs leading-6 text-[#89948f]">
                                تمام مشاهده‌ها و تصمیم‌ها قابل حسابرسی‌اند
                            </p>
                        </div>

                        <ol className="mt-5 space-y-4">
                            {error.auditSteps.map((step) => (
                                <li
                                    key={step.id}
                                    className="flex items-start gap-3"
                                >
                                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#f8f1e2] text-sm font-bold">
                                        {step.id}
                                    </span>

                                    <div>
                                        <h3 className="text-sm font-bold">
                                            {step.title}
                                        </h3>

                                        <p className="mt-1 text-xs leading-5 text-[#89948f]">
                                            {step.description}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ol>

                        <button
                            type="button"
                            className="mt-6 w-full rounded-xl border border-[#d5a746] bg-[#fffcf5] px-4 py-3 text-sm font-bold transition hover:bg-[#fff7e6]"
                        >
                            مشاهده داده حساس با ثبت دلیل
                        </button>
                    </aside>
                </div>

                {/* مقایسه */}
                <section className="mt-5 rounded-[22px] border border-[#dce5e1] bg-white p-5 shadow-[0_7px_25px_rgba(20,61,52,0.05)]">
                    <h2 className="border-b border-[#e4eae7] pb-4 text-lg font-black">
                        مقایسه و اثر اصلاح
                    </h2>

                    <div className="mt-5 grid items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
                        <article className="rounded-2xl border border-[#e0e7e4] p-5">
                            <p className="text-xs text-[#89948f]">
                                پیشنهاد هوش مصنوعی
                            </p>

                            <p className="mt-3 font-black text-[#bd4a4a] line-through decoration-[#bd4a4a]">
                                {error.aiSuggestion}
                            </p>
                        </article>

                        <span className="mx-auto flex size-10 items-center justify-center rounded-full bg-[#fff8e9] text-xl text-[#aa7c21] max-md:rotate-90">
                            ←
                        </span>

                        <article className="rounded-2xl border border-[#e0e7e4] p-5">
                            <p className="text-xs text-[#89948f]">
                                مقدار تأییدشده
                            </p>

                            <p className="mt-3 font-black text-[#237b65]">
                                {error.correctedValue}
                            </p>
                        </article>
                    </div>

                    <aside className="mt-5 flex items-start gap-3 rounded-2xl border border-[#cae3ed] bg-[#effaff] px-5 py-4">
                        <InfoIcon />

                        <div>
                            <h3 className="text-sm font-black">اصل حسابرسی</h3>

                            <p className="mt-2 text-sm leading-6 text-[#74837e]">
                                مقدار پیشنهادی حذف نمی‌شود؛ مقدار اصلاح‌شده،
                                زمان و فرد اصلاح‌کننده کنار آن نگهداری می‌شود.
                            </p>
                        </div>
                    </aside>
                </section>

                <div className="mt-5">
                    <AiErrorDecision errorId={error.id} />
                </div>
            </div>
        </main>
    );
}
