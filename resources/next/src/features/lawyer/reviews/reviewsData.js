function createDate({ days = 0 }) {
    const date = new Date();

    date.setDate(date.getDate() + days);

    return date.toISOString();
}

export const reviews = [
    {
        id: 'REV-101',

        engagementCode: 'COL-501',

        caseCode: 'VK-1405-00128',

        score: 5,

        responsiveness: 5,

        transparency: 4.8,

        organization: 4.9,

        text: 'پاسخ‌گویی منظم بود و هزینه‌ها و روند پرونده را روشن توضیح دادند.',

        status: 'published',

        createdAt: createDate({
            days: -7,
        }),
    },

    {
        id: 'REV-102',

        engagementCode: 'COL-492',

        caseCode: 'VK-1405-00121',

        score: 4.6,

        responsiveness: 4.8,

        transparency: 4.6,

        organization: 4.7,

        text: 'در چند مرحله پاسخ‌گویی با تأخیر انجام شد و درباره هزینه تکمیلی اختلاف داشتیم.',

        status: 'under_review',

        createdAt: createDate({
            days: -3,
        }),
    },
];
