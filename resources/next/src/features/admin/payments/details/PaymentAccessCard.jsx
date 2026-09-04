import Link from 'next/link';
import { Check, CreditCard, FileCheck2, UserRound } from 'lucide-react';

export default function PaymentAccessCard({ payment }) {
    const iconMap = {
        payment: CreditCard,
        contract: FileCheck2,
        client: UserRound,
        financial: Check,
    };

    return (
        <aside className="rounded-2xl border border-[#dce4df] bg-white p-5 shadow-[0_8px_25px_rgba(15,52,45,0.04)] sm:p-6">
            <div className="border-b border-[#e5ebe7] pb-4">
                <h2 className="text-lg font-black text-[#173d35]">
                    کنترل دسترسی و سابقه
                </h2>

                <p className="mt-2 text-xs leading-6 text-[#87938d]">
                    تمام مشاهده‌ها و تصمیم‌ها قابل حسابرسی‌اند.
                </p>
            </div>

            <div className="mt-5 space-y-4">
                {payment.paymentSteps.map((step) => {
                    const Icon = iconMap[step.type];

                    return (
                        <div key={step.id} className="flex items-start gap-3">
                            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#f8f0dd] text-[#73551e]">
                                <Icon size={16} strokeWidth={1.8} />
                            </span>

                            <div className="min-w-0">
                                <h3 className="text-sm font-black text-[#263f38]">
                                    {step.title}
                                </h3>

                                <p className="mt-1 text-xs leading-6 text-[#87938d]">
                                    {step.value}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <Link
                href={`/admin/sensitive-access?payment=${encodeURIComponent(
                    payment.id,
                )}`}
                className="mt-7 flex min-h-12 w-full items-center justify-center rounded-xl border border-[#d4a447] bg-[#fffaf0] px-4 text-sm font-bold text-[#17463c] transition hover:bg-[#fdf3dd]"
            >
                مشاهده داده حساس با ثبت دلیل
            </Link>
        </aside>
    );
}
