export const aiErrorDetails = [
    {
        id: 'AI-701',
        field: 'مبلغ چک',
        aiSuggestion: '۸۲۰٬۰۰۰٬۰۰۰ ریال',
        correctedValue: '۸۲٬۰۰۰٬۰۰۰ تومان',
        corrector: 'موکل',
        correctedAt: 'امروز، ۹:۴۵',
        status: 'جزئیات',

        auditSteps: [
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
        id: 'AI-702',
        field: 'نام طرف مقابل',
        aiSuggestion: 'توسعه تجارت آرمان',
        correctedValue: 'شرکت توسعه تجارت آرمان',
        corrector: 'موکل',
        correctedAt: 'امروز، ۹:۴۷',
        status: 'جزئیات',

        auditSteps: [
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
];

export function getAiErrorById(errorId) {
    return aiErrorDetails.find((error) => error.id === errorId);
}
