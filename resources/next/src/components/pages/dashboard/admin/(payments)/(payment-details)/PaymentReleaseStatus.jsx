import { Check, CreditCard, FileCheck2, UserRound } from 'lucide-react';

export default function PaymentReleaseStatus({ payment }) {
    const items = [
        {
            title: 'پیش‌پرداخت در وکیلم ثبت شده',
            value: payment.expectedPayment,
            icon: CreditCard,
        },
        {
            title: 'قرارداد در عدل ایران ثبت و بارگذاری شده',
            value: 'تکمیل',
            icon: FileCheck2,
        },
        {
            title: 'موکل قرارداد را تأیید کرده',
            value: 'تکمیل',
            icon: UserRound,
        },
        {
            title: 'کنترل مالی و آزادسازی',
            value: payment.accountingStatus,
            icon: Check,
        },
    ];

    return (
        <section className="mt-5 rounded-2xl border border-[#dce4df] bg-white p-5 shadow-[0_8px_25px_rgba(15,52,45,0.04)] sm:p-6">
            <div className="border-b border-[#e5ebe7] pb-4">
                <h2 className="text-lg font-black text-[#173d35]">
                    شرایط آزادسازی و تسویه
                </h2>
            </div>

            <div className="mt-5 space-y-2">
                {items.map((item) => {
                    const Icon = item.icon;

                    return (
                        <div
                            key={item.title}
                            className="flex min-h-[54px] items-center justify-between gap-4 rounded-xl bg-[#f3f8f5] px-4 py-3"
                        >
                            <div className="flex items-center gap-3">
                                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-[#28745c]">
                                    <Icon size={16} strokeWidth={1.8} />
                                </span>

                                <span className="text-sm font-bold text-[#24463e]">
                                    {item.title}
                                </span>
                            </div>

                            <span className="text-xs font-bold text-[#70807a]">
                                {item.value}
                            </span>
                        </div>
                    );
                })}
            </div>

            <div className="mt-4 rounded-xl border border-[#ead9a9] bg-[#fff9e9] px-4 py-4">
                <p className="text-sm font-black text-[#70541e]">نسخه نمایشی</p>

                <p className="mt-1 text-xs leading-6 text-[#8a8067]">
                    هیچ وجه واقعی جابه‌جا نمی‌شود. این صفحه صرفاً برای کنترل
                    حقوقی، مالی و حسابداری است.
                </p>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                    type="button"
                    className="rounded-xl border border-[#dce4df] bg-white px-5 py-3 text-xs font-bold text-[#31544b] transition hover:bg-[#f5f8f6]"
                >
                    ذخیره یادداشت
                </button>

                <button
                    type="button"
                    className="rounded-xl border border-[#d8b56d] bg-[#fffaf0] px-5 py-3 text-xs font-bold text-[#76561d] transition hover:bg-[#fdf3df]"
                >
                    ارجاع برای بررسی
                </button>

                <button
                    type="button"
                    className="rounded-xl bg-[#123f37] px-5 py-3 text-xs font-bold text-white transition hover:bg-[#0d332d]"
                >
                    ثبت تصمیم
                </button>
            </div>
        </section>
    );
}
