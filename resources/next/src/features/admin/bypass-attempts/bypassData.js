export const bypassStats = [
    {
        id: 'today',
        label: 'امروز',
        value: '۱',
    },
    {
        id: 'first-warning',
        label: 'هشدار نخست',
        value: '۷',
    },
    {
        id: 'repeated',
        label: 'تکرار تخلف',
        value: '۲',
    },
    {
        id: 'restricted',
        label: 'محدودشده',
        value: '۱',
    },
];

export const bypassEvents = [
    {
        id: 'BYP-501',
        time: 'امروز، ۱۳:۴۰',
        role: 'وکیل',
        detectionType: 'شماره تماس',
        blocked: true,
        repeat: '۲',
        status: 'pending_review',
    },
    {
        id: 'BYP-502',
        time: 'امروز، ۱۲:۱۵',
        role: 'موکل',
        detectionType: 'لینک پیام‌رسان',
        blocked: true,
        repeat: '۱',
        status: 'warned',
    },
    {
        id: 'BYP-503',
        time: 'دیروز، ۱۸:۳۰',
        role: 'وکیل',
        detectionType: 'پیشنهاد پرداخت بیرونی',
        blocked: true,
        repeat: '۳',
        status: 'restricted',
    },
];
