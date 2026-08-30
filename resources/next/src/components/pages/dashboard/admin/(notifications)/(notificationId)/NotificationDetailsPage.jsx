import Link from 'next/link';
import NotificationDecision from './NotificationDecision';


const recordItems = [
    {
        key: 'id',
        label: 'شناسه اعلان',
    },
    {
        key: 'audience',
        label: 'مخاطب',
    },
    {
        key: 'trigger',
        label: 'محرک',
    },
    {
        key: 'channel',
        label: 'کانال',
    },
    {
        key: 'status',
        label: 'وضعیت',
    },
    {
        key: 'sensitiveLabel',
        label: 'شامل داده حساس',
    },
];

function InfoIcon() {
    return (
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white font-bold text-[#28728d]">
            i
        </span>
    );
}

export default function NotificationDetailsPage({ notification }) {
    const record = {
        ...notification,
        sensitiveLabel: notification.containsSensitiveData ? 'بله' : 'خیر',
    };

    return (
        <main
            dir="rtl"
            className="min-h-screen bg-[#f7f9f6] px-4 py-8 text-[#123b34] sm:px-6 lg:px-10"
        >
            <div className="mx-auto w-full max-w-[1500px]">
                <header className="mb-8">
                    <div className="mb-6 flex flex-wrap items-center gap-2 text-sm">
                        <Link
                            href="/admin/notifications"
                            className="text-[#76837f] transition hover:text-[#174a40]"
                        >
                            اعلان‌ها و وضعیت‌ها
                        </Link>

                        <span className="text-[#aeb7b4]">/</span>

                        <span className="font-bold text-[#263c37]">
                            {notification.id}
                        </span>
                    </div>

                    <div className="mb-4 flex items-center gap-3 text-sm font-bold text-[#a8791e]">
                        <span>جزئیات اعلان</span>
                        <span className="h-px w-8 bg-[#c89328]" />
                    </div>

                    <h1 className="text-3xl font-black leading-[1.5] tracking-[-0.04em] text-[#103a33] sm:text-[38px]">
                        {notification.title}
                    </h1>

                    <p className="mt-3 text-sm text-[#74817d]">
                        {notification.audience}
                        <span className="mx-2">•</span>
                        {notification.channel}
                    </p>

                    <span className="mt-5 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                        {notification.status}
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
                                    className="min-h-[96px] border-b border-[#dce4e1] p-4 odd:sm:border-l"
                                >
                                    <dt className="text-xs text-[#89948f]">
                                        {item.label}
                                    </dt>

                                    <dd className="mt-2 text-sm font-bold leading-7">
                                        {record[item.key]}
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
                            {notification.accessSteps.map((step) => (
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

                {/* متن و تنظیمات */}
                <section className="mt-5 rounded-[22px] border border-[#dce5e1] bg-white p-5 shadow-[0_7px_25px_rgba(20,61,52,0.05)]">
                    <h2 className="border-b border-[#e4eae7] pb-4 text-lg font-black">
                        متن کامل اعلان و تنظیمات
                    </h2>

                    <label className="mt-5 block text-sm font-bold">
                        متن اعلان
                    </label>

                    <div className="mt-3 min-h-44 rounded-xl border border-[#d5dedb] bg-white p-4 text-sm leading-8">
                        {notification.message}
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <div>
                            <span className="block text-sm font-bold">
                                مخاطب
                            </span>

                            <div className="mt-2 rounded-xl border border-[#d5dedb] bg-white px-4 py-3 text-sm">
                                {notification.audience}
                            </div>
                        </div>

                        <div>
                            <span className="block text-sm font-bold">
                                کانال
                            </span>

                            <div className="mt-2 rounded-xl border border-[#d5dedb] bg-white px-4 py-3 text-sm">
                                {notification.channel}
                            </div>
                        </div>
                    </div>

                    <aside className="mt-4 flex items-start gap-3 rounded-2xl border border-[#cae3ed] bg-[#effaff] px-5 py-4">
                        <InfoIcon />

                        <div>
                            <h3 className="text-sm font-black">
                                محرمانگی اعلان
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-[#74837e]">
                                متن اعلان نباید اطلاعات حساس پرونده را در پیامک
                                یا اعلان عمومی نمایش دهد.
                            </p>
                        </div>
                    </aside>
                </section>

                <div className="mt-5">
                    <NotificationDecision notification={notification} />
                </div>
            </div>
        </main>
    );
}
