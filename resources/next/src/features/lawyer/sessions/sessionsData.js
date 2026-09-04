function createDate({ days = 0, hours = 0, minutes = 0 }) {
    const date = new Date();

    date.setDate(date.getDate() + days);
    date.setHours(date.getHours() + hours, date.getMinutes() + minutes, 0, 0);

    return date.toISOString();
}

export const meetings = [
    {
        id: 'MTG-101',

        caseCode: 'VK-1405-00128',

        caseTitle: 'مطالبه وجه چک',

        title: 'بررسی راهبرد مطالبه وجه',

        type: 'video',

        status: 'scheduled',

        startsAt: createDate({
            days: 1,
            hours: 2,
        }),
    },

    {
        id: 'MTG-102',

        caseCode: 'VK-1405-00128',

        caseTitle: 'مطالبه وجه چک',

        title: 'جلسه بررسی اولیه مدارک',

        type: 'voice',

        status: 'completed',

        startsAt: createDate({
            days: -2,
        }),
    },

    {
        id: 'MTG-103',

        caseCode: 'VK-1405-00121',

        caseTitle: 'تنظیم قرارداد تجاری',

        title: 'مرور نسخه نهایی قرارداد',

        type: 'video',

        status: 'scheduled',

        startsAt: createDate({
            days: 3,
            hours: 1,
        }),
    },
];
