function createDate({ days = 0, hours = 0, minutes = 0 }) {
    const date = new Date();

    date.setDate(date.getDate() + days);

    date.setHours(date.getHours() + hours, date.getMinutes() + minutes, 0, 0);

    return date.toISOString();
}

export const tasks = [
    {
        id: 'TSK-101',

        caseCode: 'VK-1405-00128',

        caseTitle: 'مطالبه وجه چک',

        title: 'بررسی قرارداد پایه',

        status: 'in_progress',

        dueAt: createDate({
            hours: 2,
        }),
    },

    {
        id: 'TSK-102',

        caseCode: 'VK-1405-00128',

        caseTitle: 'مطالبه وجه چک',

        title: 'تطبیق مبلغ و تاریخ چک',

        status: 'completed',

        dueAt: createDate({
            hours: -1,
        }),
    },

    {
        id: 'TSK-103',

        caseCode: 'VK-1405-00128',

        caseTitle: 'مطالبه وجه چک',

        title: 'تهیه پیش‌نویس اقدام حقوقی',

        status: 'scheduled',

        dueAt: createDate({
            days: 3,
        }),
    },

    {
        id: 'TSK-104',

        caseCode: 'VK-1405-00121',

        caseTitle: 'تنظیم قرارداد تجاری',

        title: 'اعمال اصلاحات بند محرمانگی',

        status: 'in_progress',

        dueAt: createDate({
            days: 1,
        }),
    },

    {
        id: 'TSK-105',

        caseCode: 'VK-1405-00121',

        caseTitle: 'تنظیم قرارداد تجاری',

        title: 'کنترل جدول پرداخت',

        status: 'waiting_client',

        dueAt: createDate({
            days: 3,
        }),
    },
];
