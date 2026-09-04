export const bypassDetails = [
    {
        id: 'BYP-501',
        detectionType: 'شماره تماس',
        actor: 'وکیل ۱۰۲',
        role: 'وکیل',
        time: 'امروز، ۱۳:۴۰',
        blocked: true,
        repeat: '۲',
        status: 'نیازمند بررسی',
        relatedCase: 'VK-1405-00128',
        automaticAction: 'پیام مسدود و هشدار ثبت شد',
        evidence: 'برای هماهنگی با ۰۹۱۲•••••• تماس بگیرید',

        history: [
            {
                id: 1,
                title: 'شناسایی خودکار محتوا',
                description: 'ثبت‌شده در تاریخچه غیرقابل حذف نمونه',
            },
            {
                id: 2,
                title: 'مسدودسازی پیام',
                description: 'ثبت‌شده در تاریخچه غیرقابل حذف نمونه',
            },
            {
                id: 3,
                title: 'ارسال برای بررسی مدیر',
                description: 'ثبت‌شده در تاریخچه غیرقابل حذف نمونه',
            },
        ],
    },
];

export function getBypassEventById(eventId) {
    return bypassDetails.find((event) => event.id === eventId);
}
