import Link from 'next/link';
import SecurityDecision from './SecurityDecision';


const severityStyles = {
    high: 'border-red-200 bg-red-50 text-red-600',
    medium: 'border-amber-200 bg-amber-50 text-amber-700',
    informational: 'border-sky-200 bg-sky-50 text-sky-700',
    low: 'border-emerald-200 bg-emerald-50 text-emerald-700',
};

const recordItems = [
    {
        key: 'id',
        label: 'شناسه رویداد',
    },
    {
        key: 'actor',
        label: 'عامل',
    },
    {
        key: 'title',
        label: 'شرح رویداد',
    },
    {
        key: 'time',
        label: 'زمان',
    },
    {
        key: 'severityLabel',
        label: 'شدت',
    },
];

export default function SecurityDetailsPage({ event }) {
    return (
        <main
            dir="rtl"
            className="min-h-screen bg-[#f7f9f6] px-4 py-8 text-[#123b34] sm:px-6 lg:px-10"
        >
            <div className="mx-auto w-full max-w-[1500px]">
                {/* عنوان صفحه */}
                <header className="mb-8">
                    <div className="mb-6 flex flex-wrap items-center gap-2 text-sm">
                        <Link
                            href="/admin/security"
                            className="text-[#76837f] transition hover:text-[#174a40]"
                        >
                            رویدادهای امنیتی
                        </Link>

                        <span className="text-[#aeb7b4]">/</span>

                        <span className="font-bold text-[#263c37]">
                            {event.id}
                        </span>
                    </div>

                    <div className="mb-4 flex items-center gap-3 text-sm font-bold text-[#a8791e]">
                        <span>جزئیات رویداد امنیتی</span>
                        <span className="h-px w-8 bg-[#c89328]" />
                    </div>

                    <h1 className="max-w-5xl text-3xl font-black leading-[1.5] tracking-[-0.04em] text-[#103a33] sm:text-[38px]">
                        {event.title}
                    </h1>

                    <p className="mt-3 text-sm text-[#74817d]">
                        {event.id}
                        <span className="mx-2">•</span>
                        {event.actor}
                    </p>

                    <span
                        className={`mt-5 inline-flex rounded-full border px-3 py-1 text-xs font-medium ${
                            severityStyles[event.severity]
                        }`}
                    >
                        {event.severityLabel}
                    </span>
                </header>

                <div className="grid gap-5 lg:grid-cols-[minmax(0,1.9fr)_minmax(320px,1fr)]">
                    {/* اطلاعات رکورد */}
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
                                    className={`min-h-[96px] border-b border-[#dce4e1] p-4 odd:sm:border-l ${
                                        item.key === 'severityLabel'
                                            ? 'sm:col-span-2'
                                            : ''
                                    }`}
                                >
                                    <dt className="text-xs text-[#89948f]">
                                        {item.label}
                                    </dt>

                                    <dd className="mt-2 text-sm font-bold leading-7 text-[#143c35]">
                                        {event[item.key]}
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
                            {event.accessSteps.map((step) => (
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

                {/* دامنه اثر */}
                <section className="mt-5 rounded-[22px] border border-[#dce5e1] bg-white p-5 shadow-[0_7px_25px_rgba(20,61,52,0.05)]">
                    <h2 className="border-b border-[#e4eae7] pb-4 text-lg font-black">
                        دامنه اثر و اقدام پیشنهادی
                    </h2>

                    <div className="mt-5 grid gap-6 md:grid-cols-3">
                        <article>
                            <h3 className="font-black">دامنه اثر</h3>

                            <p className="mt-2 text-sm leading-7 text-[#485a55]">
                                {event.impact.scope}
                            </p>
                        </article>

                        <article>
                            <h3 className="font-black">اقدام فوری</h3>

                            <p className="mt-2 text-sm leading-7 text-[#485a55]">
                                {event.impact.immediateAction}
                            </p>
                        </article>

                        <article>
                            <h3 className="font-black">ثبت حسابرسی</h3>

                            <p className="mt-2 text-sm leading-7 text-[#485a55]">
                                {event.impact.auditRule}
                            </p>
                        </article>
                    </div>
                </section>

                <div className="mt-5">
                    <SecurityDecision eventId={event.id} />
                </div>
            </div>
        </main>
    );
}
