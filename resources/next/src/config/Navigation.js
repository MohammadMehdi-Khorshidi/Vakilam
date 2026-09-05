import {
    Home,
    ListChecks,
    Inbox,
    Scale,
    FilePlus2,
    FolderOpen,
    Users,
    FileText,
    MessageSquare,
    CalendarDays,
    Files,
    FileSignature,
    BriefcaseBusiness,
    CircleDollarSign,
    ClipboardCheck,
    UserRound,
    ShieldCheck,
    Settings,
    AlertTriangle,
    Bell,
    UserCog,
    Search,
    CheckCircle2,
} from 'lucide-react';

// client

export const clientNav = [
    {
        href: '/client',
        label: 'خانه',
        icon: Home,
    },
    {
        href: '/client/actions',
        label: 'مرکز اقدامات',
        icon: ListChecks,
    },
    {
        href: '/client/inbox',
        label: 'صندوق هوشمند',
        icon: Inbox,
    },
    {
        href: '/client/assistant',
        label: 'دستیار حقوقی',
        icon: Scale,
    },
    {
        href: '/client/legal-request/start',
        label: 'شرح مسئله جدید',
        icon: FilePlus2,
    },
    {
        href: '/client/case',
        label: 'پرونده‌های من',
        icon: FolderOpen,
    },
    {
        href: '/client/lawyersAdmin',
        label: 'همه وکلا',
        icon: Users,
    },
    {
        href: '/client/proposals',
        label: 'پیشنهادها',
        icon: FileText,
    },
    {
        href: '/client/case/messages',
        label: 'پیام‌ها و تماس‌ها',
        icon: MessageSquare,
    },
    {
        href: '/client/case/meetings',
        label: 'جلسات',
        icon: CalendarDays,
    },
    {
        href: '/client/case/documents',
        label: 'اسناد',
        icon: Files,
    },
    {
        href: '/client/contract',
        label: 'قرارداد و پرداخت',
        icon: FileSignature,
    },
];


//lawyer
export const lawyerNav = [
    {
        href: '/lawyer',
        label: 'خانه',
        icon: Home,
    },
    {
        href: '/lawyer/actions',
        label: 'مرکز اقدامات',
        icon: ListChecks,
    },
    {
        href: '/lawyer/opportunities',
        label: 'فرصت‌ها',
        icon: BriefcaseBusiness,
    },
    {
        href: '/lawyer/proposals',
        label: 'پیشنهادها',
        icon: FileText,
    },
    {
        href: '/lawyer/cases',
        label: 'پرونده‌ها',
        icon: FolderOpen,
    },
    {
        href: '/lawyer/messages',
        label: 'پیام‌ها',
        icon: MessageSquare,
    },
    {
        href: '/lawyer/meetings',
        label: 'جلسات',
        icon: CalendarDays,
    },
    {
        href: '/lawyer/tasks',
        label: 'کارها',
        icon: ClipboardCheck,
    },
    {
        href: '/lawyer/earnings',
        label: 'درآمد',
        icon: CircleDollarSign,
    },
    {
        href: '/lawyer/feedbacks',
        label: 'بازخوردها',
        icon: CheckCircle2,
    },
];



export const adminNav = [
    {
        href: '/admin',
        label: 'خانه',
        icon: Home,
    },
    {
        href: '/admin/users',
        label: 'کاربران',
        icon: Users,
    },
    {
        href: '/admin/lawyersAdmin',
        label: 'وکلا',
        icon: UserCog,
    },
    {
        href: '/admin/verifications',
        label: 'احراز هویت',
        icon: ShieldCheck,
    },
    {
        href: '/admin/cases',
        label: 'پرونده‌ها',
        icon: FolderOpen,
    },
    {
        href: '/admin/contracts',
        label: 'قراردادها',
        icon: FileSignature,
    },
    {
        href: '/admin/payments',
        label: 'پرداخت‌ها',
        icon: CircleDollarSign,
    },
    {
        href: '/admin/violations',
        label: 'تخلفات',
        icon: AlertTriangle,
    },
    {
        href: '/admin/notifications',
        label: 'اعلان‌ها',
        icon: Bell,
    },
    {
        href: '/admin/settings',
        label: 'تنظیمات',
        icon: Settings,
    },
];


// admin
export const roleHome = {
    client: '/client',
    lawyer: '/lawyer',
    admin: '/admin',
};

export const roleLabels = {
    client: 'موکل',
    lawyer: 'وکیل',
    admin: 'مدیر سامانه',
};

export const loginTitles = {
    client: 'ورود موکل',
    lawyer: 'ورود وکیل',
    admin: 'ورود مدیر سامانه',
};
