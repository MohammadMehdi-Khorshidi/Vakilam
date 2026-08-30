const cases = {
    'VK-1405-00128': {
        id: 'VK-1405-00128',
        title: 'مطالبه وجه چک',

        category: 'حقوقی و مالی',

        client: 'فرزام نجفی',

        city: 'تهران',

        status: 'در حال انتخاب وکیل',

        urgency: 'زیاد',

        lawyer: '—',

        createdAt: '۲۳ تیر ۱۴۰۵',

        documentsCount: 4,

        accessSteps: [
            {
                id: 1,
                title: 'ایجاد در دریافت رکورد',
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

    'VK-1405-00121': {
        id: 'VK-1405-00121',
        title: 'تنظیم قرارداد تجاری',

        category: 'قرارداد',

        client: 'الهام رضایی',

        city: 'تهران',

        status: 'در انتظار تأیید قرارداد',

        urgency: 'عادی',

        lawyer: 'سارا توکلی',

        createdAt: '۲۰ تیر ۱۴۰۵',

        documentsCount: 3,

        accessSteps: [
            {
                id: 1,
                title: 'ایجاد در دریافت رکورد',
                description: 'ثبت خودکار در سامانه',
            },
            {
                id: 2,
                title: 'ورود مدیر به صفحه جزئیات',
                description: 'نمایش داده عملیاتی',
            },
            {
                id: 3,
                title: 'تصمیم یا اقدام بعدی',
                description: 'نیازمند ثبت دلیل مدیر',
            },
        ],
    },

    'VK-1405-00117': {
        id: 'VK-1405-00117',
        title: 'اختلاف پیمانکاری',

        category: 'قراردادی',

        client: 'موکل نمونه ۳',

        city: 'اصفهان',

        status: 'همکاری فعال',

        urgency: 'عادی',

        lawyer: 'امیررضا باقری',

        createdAt: '۱۸ تیر ۱۴۰۵',

        documentsCount: 6,

        accessSteps: [
            {
                id: 1,
                title: 'ایجاد در دریافت رکورد',
                description: 'ثبت خودکار در سامانه',
            },
            {
                id: 2,
                title: 'ورود مدیر به صفحه جزئیات',
                description: 'نمایش داده عملیاتی',
            },
            {
                id: 3,
                title: 'تصمیم یا اقدام بعدی',
                description: 'نیازمند ثبت دلیل مدیر',
            },
        ],
    },
};

export function getCaseById(caseId) {
    return cases[caseId];
}
