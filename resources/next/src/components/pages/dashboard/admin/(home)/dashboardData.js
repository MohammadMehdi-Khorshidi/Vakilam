import {
    Bot,
    FileCheck2,
    ShieldAlert,
    ShieldCheck,
    UserCheck,
    WalletCards,
} from 'lucide-react';

export const dashboardStats = [
    {
        id: 1,
        title: 'احراز در انتظار',
        value: 12,
        description: '۴ مورد امروز',
        icon: UserCheck,
        href: '/admin/verifications',
    },
    {
        id: 2,
        title: 'قرارداد نیازمند بررسی',
        value: 5,
        description: '۲ مورد حساس',
        icon: FileCheck2,
        href: '/admin/contracts',
    },
    {
        id: 3,
        title: 'تسویه آماده',
        value: 8,
        description: 'پس از کنترل مالی',
        icon: WalletCards,
        href: '/admin/payments',
    },
    {
        id: 4,
        title: 'تلاش دور زدن',
        value: 1,
        description: 'ثبت و قابل پیگیری',
        icon: ShieldAlert,
        href: '/admin/security/bypass',
    },
];

export const urgentActions = [
    {
        id: 1,
        title: 'بررسی احراز هویت مهدی رضوانی',
        description: 'مدارک کامل',
        label: 'فوری',
        tone: 'red',
        href: '/admin/verifications/verify-301',
    },
    {
        id: 2,
        title: 'بازخورد منفی نیازمند بررسی',
        description: 'احتمال اختلاف مالی',
        label: 'حساس',
        tone: 'amber',
        href: '/admin/feedback',
    },
    {
        id: 3,
        title: 'تأیید صف تسویه وکلا',
        description: '۸ مورد',
        label: 'مالی',
        tone: 'blue',
        highlighted: true,
        href: '/admin/payments',
    },
];

export const sensitiveAccessItems = [
    {
        id: 1,
        title: 'ثبت دلیل مشاهده',
        description: 'برای اطلاعات هویتی، مالی و قراردادی',
        icon: ShieldCheck,
        href: '/admin/sensitive-access',
    },
    {
        id: 2,
        title: 'خطاهای هوش مصنوعی',
        description: 'پیشنهاد، اصلاح و تاریخچه تغییر',
        icon: Bot,
        href: '/admin/ai-errors',
    },
    {
        id: 3,
        title: 'کنترل دور زدن سامانه',
        description: 'پیام‌ها و تلاش‌های ثبت‌شده',
        icon: ShieldAlert,
        href: '/admin/security/bypass',
    },
];

export const securityEvents = [
    {
        id: 'SEC-901',
        actor: 'وکیل ۱۰۲',
        event: 'تلاش برای ارسال شماره تماس در مذاکره',
        createdAt: '2026-08-29T08:40:00.000Z',
        severity: 'زیاد',
        tone: 'red',
    },
    {
        id: 'SEC-902',
        actor: 'مدیر ۰۳',
        event: 'مشاهده قرارداد با ثبت دلیل',
        createdAt: '2026-08-29T07:10:00.000Z',
        severity: 'اطلاعاتی',
        tone: 'blue',
    },
    {
        id: 'SEC-903',
        actor: 'سامانه',
        event: 'رد دسترسی نامعتبر به سند پرونده',
        createdAt: '2026-08-28T17:18:00.000Z',
        severity: 'متوسط',
        tone: 'amber',
    },
];
