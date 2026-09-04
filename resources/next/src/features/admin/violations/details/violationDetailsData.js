const violationDetails = [
    {
        id: 'REP-501',
        title: 'پیشنهاد پرداخت بیرونی',
        reportedUser: 'وکیل ۱۰۲',
        source: 'مذاکره',
        severity: 'زیاد',
        status: 'باز',
        createdAt: 'امروز، ۱۳:۴۰',
        relatedCase: 'VK-1405-00128',
        reviewer: 'مدیر امنیت',

        evidence: 'پیام مسدودشده شامل پیشنهاد واریز خارج از وکیلم',

        history: [
            {
                id: 1,
                title: 'هشدار درجه یک به کاربر',
                description: 'ثبت‌شده در تاریخچه غیرقابل حذف نمونه',
            },
            {
                id: 2,
                title: 'مسدود شدن پیام',
                description: 'ثبت‌شده در تاریخچه غیرقابل حذف نمونه',
            },
            {
                id: 3,
                title: 'ثبت رویداد امنیتی',
                description: 'ثبت‌شده در تاریخچه غیرقابل حذف نمونه',
            },
        ],
    },
];

export function getViolationById(violationId) {
    return violationDetails.find((violation) => violation.id === violationId);
}
