export const usersDetails = [
    {
        id: 'USR-1001',
        name: 'فرزام فتحی',
        role: 'موکل',
        roleCode: 'client',
        status: 'active',

        maskedPhone: '۸۴•••••۰۹۱۲',

        joinedAt: '2026-08-13T08:30:00.000Z',

        lastActivityAt: '2026-08-29T10:10:00.000Z',

        casesCount: 1,

        risk: {
            code: 'normal',
            label: 'عادی',
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
        id: 'USR-1002',
        name: 'الهام رضایی',
        role: 'موکل',
        roleCode: 'client',
        status: 'active',

        maskedPhone: '۷۲•••••۰۹۱۲',

        joinedAt: '2026-07-22T09:15:00.000Z',

        lastActivityAt: '2026-08-29T07:35:00.000Z',

        casesCount: 2,

        risk: {
            code: 'normal',
            label: 'عادی',
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
        id: 'USR-1003',
        name: 'مهدی رضوانی',
        role: 'وکیل',
        roleCode: 'lawyer',
        status: 'pending_verification',

        maskedPhone: '۶۱•••••۰۹۱۲',

        joinedAt: '2026-08-25T11:45:00.000Z',

        lastActivityAt: '2026-08-29T06:20:00.000Z',

        casesCount: 0,

        risk: {
            code: 'sensitive',
            label: 'نیازمند بررسی',
        },

        accessSteps: [
            {
                id: 1,
                title: 'دریافت درخواست احراز',
                description: 'مدارک توسط وکیل ثبت شده است',
            },
            {
                id: 2,
                title: 'بررسی اطلاعات عمومی',
                description: 'اطلاعات غیرحساس برای مدیر نمایش داده می‌شود',
            },
            {
                id: 3,
                title: 'ثبت تصمیم احراز',
                description: 'نیازمند ثبت دلیل مدیر',
            },
        ],
    },
];

export function getUserById(userId) {
    return usersDetails.find(
        (user) =>
            user.id.toLowerCase() === decodeURIComponent(userId).toLowerCase(),
    );
}
