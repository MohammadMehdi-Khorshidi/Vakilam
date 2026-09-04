export const negotiationData = {
    caseCode: 'VK-1405-00128',

    caseTitle: 'مطالبه وجه چک',

    engagementCode: 'COL-501',

    frameworkItems: [
        'محدوده خدمات و مرحله‌های کار',
        'زمان‌بندی تقریبی',
        'مبلغ و شیوه پرداخت داخل سامانه',
        'مدارک و همکاری موردنیاز موکل',
    ],

    initialMessages: [
        {
            id: 'NEG-MSG-101',

            sender: 'lawyer',

            text: 'سلام. پیشنهاد همکاری و مراحل کار را ارسال کردم. درباره محدوده خدمات یا زمان‌بندی می‌توانید سؤال بپرسید.',

            sentAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
        },
    ],
};
