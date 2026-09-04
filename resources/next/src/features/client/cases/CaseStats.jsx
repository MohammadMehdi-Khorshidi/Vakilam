import {
    BarChart3,
    BriefcaseBusiness,
    FileCheck2,
    WalletCards,
} from 'lucide-react';

import { Vazirmatn } from 'next/font/google';

const vazirmatn = Vazirmatn({
    subsets: ['arabic'],
    display: 'swap',
});

const CaseStats = ({ caseData }) => {
    const stats = [
        {
            label: 'سلامت مدیریت',
            value: `${caseData?.managementHealth ?? 78}%`,
            description: 'نه احتمال موفقیت',
            icon: BarChart3,
        },
        {
            label: 'مرحله',
            value: caseData?.stage || 'شروع همکاری',
            description: '',
            icon: FileCheck2,
        },
        {
            label: 'وکیل',
            value: caseData?.lawyerName || 'نگرس سعادتی',
            description: '',
            icon: BriefcaseBusiness,
        },
        {
            label: 'پرداخت',
            value: caseData?.paymentStatus || 'پیش‌پرداخت ثبت‌نشده',
            description: '',
            icon: WalletCards,
        },
    ];

    return (
        <section
            dir="rtl"
            className={`${vazirmatn.className} mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4`}
        >
            {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                    <article
                        key={stat.label}
                        className="relative overflow-hidden rounded-[17px] border border-[#dfe7e4] bg-white p-5 shadow-[0_4px_18px_rgba(18,63,55,0.035)]"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="text-right">
                                <span className="block text-sm font-medium text-[#7b8783]">
                                    {stat.label}
                                </span>

                                <strong className="mt-2 block font-extrabold text-[#123f37]">
                                    {stat.value}
                                </strong>

                                {stat.description && (
                                    <span className="mt-1 block text-xs text-[#9aa5a1]">
                                        {stat.description}
                                    </span>
                                )}
                            </div>

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] border border-[#e1ebe7] bg-[#f8fbfa] text-[#123f37]">
                                <Icon size={19} strokeWidth={1.8} />
                            </div>
                        </div>

                        <div className="absolute -bottom-8 -right-7 h-16 w-16 rounded-full bg-[#faf3e4]" />
                    </article>
                );
            })}
        </section>
    );
};

export default CaseStats;
