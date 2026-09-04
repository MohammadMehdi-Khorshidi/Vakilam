export const lawyerDetails = [
    {
        id: 'LWR-1001',
        name: 'نرگس سعادتی',
        licenseNumber: '۲۸۴۱۱',
        city: 'تهران',
        professionalAuthority: 'کانون وکلای مرکز',
        verificationStatus: 'verified',
        verificationLabel: 'تأییدشده',
        trustScore: 92,
        cooperationScore: 4.8,
        activeCases: 6,
        settlementStatus: 'active',
        settlementLabel: 'فعال',

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
        id: 'LWR-1002',
        name: 'امیررضا باقری',
        licenseNumber: '۳۹۱۷۷',
        city: 'اصفهان',
        professionalAuthority: 'کانون وکلای اصفهان',
        verificationStatus: 'verified',
        verificationLabel: 'تأییدشده',
        trustScore: 88,
        cooperationScore: 4.6,
        activeCases: 4,
        settlementStatus: 'active',
        settlementLabel: 'فعال',

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
        id: 'LWR-1003',
        name: 'مهدی رضوانی',
        licenseNumber: '۲۸۴۵۶',
        city: 'تهران',
        professionalAuthority: 'کانون وکلای مرکز',
        verificationStatus: 'pending',
        verificationLabel: 'در انتظار بررسی',
        trustScore: null,
        cooperationScore: null,
        activeCases: 0,
        settlementStatus: 'inactive',
        settlementLabel: 'غیرفعال',

        accessSteps: [
            {
                id: 1,
                title: 'دریافت درخواست احراز',
                description: 'مدارک وکیل در سامانه ثبت شده است',
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

export function getLawyerById(lawyerId) {
    const decodedId = decodeURIComponent(lawyerId);

    return lawyerDetails.find(
        (lawyer) => lawyer.id.toLowerCase() === decodedId.toLowerCase(),
    );
}
