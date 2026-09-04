export const securityEventDetails = [
    {
        id: 'SEC-901',
        title: 'تلاش برای ارسال شماره تماس در مذاکره',
        actor: 'وکیل ۱۰۲',
        time: 'امروز، ۱۳:۴۰',
        severity: 'high',
        severityLabel: 'زیاد',

        impact: {
            scope: 'حساب کاربر، پرونده مرتبط و دسترسی استفاده‌شده باید بررسی شود.',
            immediateAction:
                'حفظ شواهد، کنترل سطح دسترسی و جلوگیری از تکرار رویداد.',
            auditRule: 'هر تغییر وضعیت با شناسه مدیر، زمان و دلیل ثبت می‌شود.',
        },

        accessSteps: [
            {
                id: 1,
                title: 'ایجاد یا دریافت رکورد',
                description: 'ثبت خودکار در سامانه',
            },
            {
                id: 2,
                title: 'ورود مدیر به صفحه جزئیات',
                description: 'نمایش داده عملیاتی بدون بازکردن اطلاعات حساس',
            },
            {
                id: 3,
                title: 'تصمیم یا اقدام بعدی',
                description: 'نیازمند ثبت دلیل مدیر',
            },
        ],
    },
    {
        id: 'SEC-902',
        title: 'مشاهده قرارداد با ثبت دلیل',
        actor: 'مدیر ۰۳',
        time: 'امروز، ۱۲:۱۰',
        severity: 'informational',
        severityLabel: 'اطلاعاتی',

        impact: {
            scope: 'دسترسی مدیر و قرارداد مشاهده‌شده باید در سابقه حسابرسی باقی بماند.',
            immediateAction: 'بررسی دلیل ثبت‌شده و تطبیق سطح دسترسی مدیر.',
            auditRule:
                'مشاهده اطلاعات حساس همراه با شناسه مدیر و زمان ثبت می‌شود.',
        },

        accessSteps: [
            {
                id: 1,
                title: 'ثبت درخواست مشاهده',
                description: 'ثبت خودکار در سامانه',
            },
            {
                id: 2,
                title: 'بررسی سطح دسترسی',
                description: 'کنترل مجوز مدیر',
            },
            {
                id: 3,
                title: 'ثبت نتیجه بررسی',
                description: 'ثبت دلیل و نتیجه نهایی',
            },
        ],
    },
    {
        id: 'SEC-903',
        title: 'رد دسترسی نامعتبر به سند پرونده',
        actor: 'سامانه',
        time: 'دیروز، ۲۲:۱۸',
        severity: 'medium',
        severityLabel: 'متوسط',

        impact: {
            scope: 'حساب درخواست‌کننده و سند هدف باید بررسی شوند.',
            immediateAction: 'حفظ شواهد و بررسی احتمال تلاش مجدد.',
            auditRule: 'تمام دسترسی‌های ردشده در سابقه امنیتی باقی می‌مانند.',
        },

        accessSteps: [
            {
                id: 1,
                title: 'شناسایی درخواست نامعتبر',
                description: 'ثبت خودکار توسط سامانه',
            },
            {
                id: 2,
                title: 'مسدودسازی دسترسی',
                description: 'جلوگیری از مشاهده سند',
            },
            {
                id: 3,
                title: 'ارجاع برای بررسی',
                description: 'بررسی توسط مدیر امنیت',
            },
        ],
    },
];

export function getSecurityEventById(eventId) {
    return securityEventDetails.find((event) => event.id === eventId);
}
