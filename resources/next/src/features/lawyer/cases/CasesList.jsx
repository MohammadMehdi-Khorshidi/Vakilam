import {
    ChartNoAxesColumnIncreasing,
    ClipboardList,
    FileSignature,
} from 'lucide-react';

export const stats = [
    {
        id: 1,
        title: 'همکاری فعال',
        value: '۲',
        icon: ChartNoAxesColumnIncreasing,
    },
    {
        id: 2,
        title: 'در انتظار قرارداد',
        value: '۱',
        icon: FileSignature,
    },
    {
        id: 3,
        title: 'اقدام عقب‌افتاده',
        value: '۱',
        icon: ClipboardList,
    },
    {
        id: 4,
        title: 'پایان‌یافته',
        value: '۱',
        icon: ChartNoAxesColumnIncreasing,
    },
];

export const cases = [
    {
        id: 1,
        title: 'مطالبه وجه چک',
        code: 'VK-1405-00128',
        client: 'فرزام ن.',
        status: 'در حال پیگیری',
        statusColor: 'green',
        city: 'تهران',
        urgency: 'فوریت زیاد',
        messages: 2,
        tasks: 1,
        description:
            'مطالبه مبلغ یک فقره چک برگشتی با بررسی مسیرهای حقوقی و ثبتی. اصل چک و گواهی عدم پرداخت در پرونده موجود است.',
        nextAction: 'بررسی نهایی گواهی عدم پرداخت و آماده‌سازی پیش‌نویس اقدام',
        highlighted: true,
    },
    {
        id: 2,
        title: 'تنظیم قرارداد تجاری',
        code: 'VK-1405-00121',
        client: 'الهام ر.',
        status: 'در انتظار تایید قرارداد',
        statusColor: 'amber',
        city: 'تهران',
        urgency: 'فوریت عادی',
        messages: 1,
        tasks: 0,
        description:
            'تنظیم و بازبینی قرارداد تأمین خدمات نرم‌افزاری میان دو شرکت با تمرکز بر تعهدات، پرداخت و محرمانگی.',
        nextAction: 'ارسال نسخه اصلاح‌شده قرارداد برای تایید موکل',
        highlighted: false,
    },
    {
        id: 3,
        title: 'اختلاف در قرارداد اجاره',
        code: 'VK-1404-00987',
        client: 'موکل سابق',
        status: 'پایان‌یافته',
        statusColor: 'blue',
        city: 'کرج',
        urgency: 'عادی',
        messages: 0,
        tasks: 0,
        description:
            'همکاری برای بررسی اختلاف اجاره و تهیه اظهارنامه پایان یافته و پرونده بایگانی شده است.',
        nextAction: 'پرونده بسته شده است',
        highlighted: false,
    },
];
