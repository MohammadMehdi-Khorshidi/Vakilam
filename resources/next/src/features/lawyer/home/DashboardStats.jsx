import {
    ArrowLeft,
    BriefcaseBusiness,
    ClipboardList,
    CreditCard,
    FileText,
} from 'lucide-react';

const stats = [
    {
        title: 'پرونده پیشنهادی',
        value: '۶',
        description: 'دو مورد با تناسب بالا',
        icon: BriefcaseBusiness,
    },
    {
        title: 'پیشنهاد در انتظار',
        value: '۲',
        description: 'یک مورد انتخاب‌شده',
        icon: FileText,
    },
    {
        title: 'اقدام ضروری',
        value: '۳',
        description: 'بارگذاری قرارداد',
        icon: ClipboardList,
    },
    {
        title: 'درآمد قابل تسویه',
        value: '۱۶٫۲ میلیون',
        description: 'پس از تکمیل شروط',
        icon: CreditCard,
    },
];

export default function DashboardStats() {
    return (
        <section dir="rtl" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                    <article
                        key={stat.title}
                        className="relative overflow-hidden rounded-[20px] border border-[#dfe5e1] bg-white p-5 shadow-[0_8px_25px_rgba(16,47,41,0.04)]"
                    >
                        <div className="absolute -bottom-8 -left-8 size-20 rounded-full bg-[#fbf4e5]" />

                        <div className="relative flex items-center justify-between gap-4">
                            <div className="rounded-xl border border-[#e1e8e4] bg-[#f8fbf9] p-3">
                                <Icon size={21} strokeWidth={1.8} />
                            </div>

                            <div className="flex-1 text-right">
                                <p className="text-sm text-[#7c8581]">
                                    {stat.title}
                                </p>
                                <strong className="mt-1 block text-xl font-black">
                                    {stat.value}
                                </strong>
                                <span className="mt-1 block text-xs text-[#929a96]">
                                    {stat.description}
                                </span>
                            </div>

                            <ArrowLeft size={18} className="text-[#ad8130]" />
                        </div>
                    </article>
                );
            })}
        </section>
    );
}
