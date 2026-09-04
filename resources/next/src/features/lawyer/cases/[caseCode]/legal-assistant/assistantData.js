import { FileSearch, FileText, Search } from 'lucide-react';

export const assistantActions = [
    {
        id: 'summary',
        title: 'خلاصه‌سازی همین پرونده',
        description: 'اطلاعات تأییدشده، ابهام‌ها و مدارک ناقص',
        icon: FileText,
    },
    {
        id: 'draft',
        title: 'تهیه پیش‌نویس حقوقی',
        description: 'بدون ثبت یا ارسال خودکار',
        icon: FileSearch,
    },
    {
        id: 'sources',
        title: 'جست‌وجوی قوانین و منابع',
        description: 'منابع عمومی و تأییدشده',
        icon: Search,
    },
];

export const assistantControls = [
    'اطلاعات فقط برای همین پرونده پردازش می‌شود.',
    'خروجی قبل از استفاده توسط وکیل بازبینی می‌شود.',
    'نتیجه یا احتمال موفقیت پرونده اعلام نمی‌شود.',
    'داده خصوصی برای آموزش عمومی استفاده نمی‌شود.',
];

export const legalSources = [
    {
        id: 1,
        title: 'قانون صدور چک',
        description:
            'مقررات مربوط به صدور، برگشت، پیگیری و مسئولیت‌های ناشی از چک',
        tags: ['چک', 'گواهی عدم پرداخت', 'صیاد'],
    },
    {
        id: 2,
        title: 'قانون آیین دادرسی مدنی',
        description: 'مقررات مربوط به طرح دعوا، دادخواست، ادله و خسارت دادرسی',
        tags: ['دادخواست', 'مطالبه وجه', 'خسارت'],
    },
    {
        id: 3,
        title: 'قانون مدنی',
        description: 'قواعد عمومی تعهدات، دیون و مطالبه خسارت',
        tags: ['تعهد', 'دین', 'خسارت'],
    },
];
