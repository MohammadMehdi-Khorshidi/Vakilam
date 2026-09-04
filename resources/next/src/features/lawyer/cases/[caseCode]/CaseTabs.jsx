import {
    Bot,
    BriefcaseBusiness,
    CheckSquare,
    ClipboardList,
    CreditCard,
    FileSignature,
    FileText,
    Handshake,
    History,
    MessageSquare,
    Users,
} from 'lucide-react';

export const caseTabs = [
    {
        id: 'overview',
        label: 'نمای کلی',
        icon: BriefcaseBusiness,
    },
    {
        id: 'information',
        label: 'اطلاعات پرونده',
        icon: FileText,
    },
    {
        id: 'engagement',
        label: 'رابطه همکاری',
        icon: Handshake,
    },
    {
        id: 'tasks',
        label: 'کارها',
        icon: CheckSquare,
    },
    {
        id: 'messages',
        label: 'پیام‌ها و تماس‌ها',
        icon: MessageSquare,
    },
    {
        id: 'meetings',
        label: 'جلسات',
        icon: Users,
    },
    {
        id: 'documents',
        label: 'اسناد و مدارک',
        icon: ClipboardList,
    },
    {
        id: 'contract',
        label: 'قرارداد',
        icon: FileSignature,
    },
    {
        id: 'payments',
        label: 'پرداخت‌ها',
        icon: CreditCard,
    },
    {
        id: 'assistant',
        label: 'دستیار حقوقی',
        icon: Bot,
    },
    {
        id: 'history',
        label: 'تاریخچه',
        icon: History,
    },
];

export default function CaseTabs({ activeTab, onChange }) {
    return (
        <nav className="mb-5 overflow-x-auto rounded-2xl border border-[#dce6e2] bg-white p-2 shadow-sm">
            <div className="flex min-w-max gap-2">
                {caseTabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => onChange(tab.id)}
                            className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition ${
                                isActive
                                    ? 'border-[#0b5648] bg-[#0b5648] text-white'
                                    : 'border-[#dce6e2] bg-white text-[#657571] hover:bg-[#f4f8f6]'
                            }`}
                        >
                            <Icon size={17} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
