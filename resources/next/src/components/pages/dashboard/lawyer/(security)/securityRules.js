import {
    Bot,
    CreditCard,
    Database,
    FileLock2,
    History,
    PhoneOff,
} from 'lucide-react';

export const securityRules = [
    {
        id: 'contact',
        title: 'اطلاعات تماس',
        description:
            'پیش از رابطه رسمی، شماره، ایمیل، نشانی و شناسه پیام‌رسان نمایش یا ارسال نمی‌شود.',
        icon: PhoneOff,
    },
    {
        id: 'documents',
        title: 'اسناد پرونده',
        description: 'فقط در محدوده پرونده و سطح دسترسی مجاز قابل استفاده‌اند.',
        icon: FileLock2,
    },
    {
        id: 'payment',
        title: 'پرداخت',
        description: 'پیشنهاد یا دریافت وجه خارج از وکیلم ممنوع است.',
        icon: CreditCard,
    },
    {
        id: 'ai',
        title: 'هوش مصنوعی',
        description: 'خروجی‌ها پیش‌نویس‌اند و باید توسط وکیل بررسی شوند.',
        icon: Bot,
    },
    {
        id: 'privacy',
        title: 'داده خصوصی',
        description: 'برای آموزش عمومی مدل استفاده نمی‌شود.',
        icon: Database,
    },
    {
        id: 'events',
        title: 'رویدادها',
        description: 'دسترسی‌ها، اصلاحات حساس و تلاش‌های دور زدن ثبت می‌شوند.',
        icon: History,
    },
];
