import Link from 'next/link';

import BypassDecision from './BypassDecision';

const accessSteps = [
    {
        id: 1,
        title: 'ایجاد یا دریافت رکورد',
        description: 'ثبت خودکار در سامانه',
    },
    {
        id: 2,
        title: 'ورود مدیر به صفحه جزئیات',
        description: 'نمایش داده عملیاتی بدون بازکردن اطلاعات حساس',
    },
    {
        id: 3,
        title: 'تصمیم یا اقدام بعدی',
        description: 'نیازمند ثبت دلیل مدیر',
    },
];

const informationItems = [
    {
        key: 'id',
        label: 'شناسه رویداد',
    },
    {
        key: 'actor',
        label: 'عامل',
    },
    {
        key: 'role',
        label: 'نقش',
    },
    {
        key: 'time',
        label: 'زمان',
    },
    {
        key: 'detectionType',
        label: 'نوع شناسایی',
    },
    {
        key: 'blockedLabel',
        label: 'پیام مسدود شد',
    },
    {
        key: 'repeat',
        label: 'تعداد تکرار',
    },
    {
        key: 'status',
        label: 'وضعیت',
    },
    {
        key: 'relatedCase',
        label: 'پرونده مرتبط',
    },
    {
        key: 'automaticAction',
        label: 'اقدام خودکار',
    },
];

export default function BypassDetailsPage({ event }) {
    const eventInformation = {
        ...event,
        blockedLabel: event.blocked ? 'بله' : 'خیر',
    };

    return (
        <main
            dir="rtl"
            className="min-h-screen bg-[#f7f9f6] px-4 py-8 text-[#123b34] sm:px-6 lg:px-10"
        >
            <div className="mx-auto w-full max-w-[1500px]">
                <header className="mb-8">
                    <div className="mb-6 flex items-center gap-2 text-sm">

                        <span className="text-[#aeb7b4]">/</span>

                        <span className="font-bold text-[#263c37]">
                            {event.id}
                        </span>
                    </div>



                    <h1 className="text-3xl font-black tracking-[-0.04em] text-[#103a33] sm:text-[38px]">
                        {event.detectionType}
                    </h1>

                    <p className="mt-3 text-sm text-[#74817d]">
                        {event.id}
                        <span className="mx-2">•</span>
                        {event.actor}
                    </p>

                    <span className="mt-5 inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                        {event.status}
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
                            {informationItems.map((item) => (
                                <div
                                    key={item.key}
                                    className="min-h-[82px] border-b border-[#dce4e1] p-4 odd:sm:border-l"
                                >
                                    <dt className="text-xs text-[#89948f]">
                                        {item.label}
                                    </dt>

                                    <dd className="mt-2 text-sm font-bold">
                                        {eventInformation[item.key]}
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

                            <p className="mt-2 text-xs text-[#89948f]">
                                تمام مشاهده‌ها و تصمیم‌ها قابل حسابرسی‌اند
                            </p>
                        </div>

                        <ol className="mt-4 space-y-4">
                            {accessSteps.map((step) => (
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
                            className="mt-5 w-full rounded-xl border border-[#d5a746] bg-[#fffcf5] px-4 py-3 text-sm font-bold transition hover:bg-[#fff7e6]"
                        >
                            مشاهده داده حساس با ثبت دلیل
                        </button>
                    </aside>
                </div>

                {/* شواهد */}
                <section className="mt-5 rounded-[22px] border border-[#dce5e1] bg-white p-5 shadow-[0_7px_25px_rgba(20,61,52,0.05)]">
                    <h2 className="border-b border-[#e4eae7] pb-4 text-lg font-black">
                        شواهد و تاریخچه بررسی
                    </h2>

                    <div className="mt-4 rounded-2xl border-r-4 border-[#bd4550] bg-[#fff1f2] p-5">
                        <h3 className="font-bold text-[#be424d]">
                            شاهد ثبت‌شده
                        </h3>

                        <p className="mt-3 text-sm leading-7 text-[#3f4e4a]">
                            {event.evidence}
                        </p>
                    </div>

                    <ol className="mt-4 space-y-4">
                        {event.history.map((item) => (
                            <li
                                key={item.id}
                                className="flex items-start gap-3"
                            >
                                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#f8f1e2] text-sm font-bold">
                                    {item.id}
                                </span>

                                <div>
                                    <h3 className="text-sm font-bold">
                                        {item.title}
                                    </h3>

                                    <p className="mt-1 text-xs text-[#89948f]">
                                        {item.description}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ol>
                </section>

                <div className="mt-5">
                    <BypassDecision eventId={event.id} />
                </div>
            </div>
        </main>
    );
}
