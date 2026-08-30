const contracts = [
    {
        id: 'CTR-88421',

        paymentId: 'PAY-6101',

        iranRegistrationId: 'ADL-1405-88421',
        caseId: 'VK-1405-00128',
        cooperationId: 'COL-501',

        title: 'مطالبه وجه چک',

        category: 'حقوقی و مالی',

        client: 'فرزام نخعی',

        lawyer: 'نرگس سعادتی',

        iranStatus: 'ثبت و بارگذاری شد',

        lawyerStatus: 'تأیید شد',

        totalFee: '۴۸,۰۰۰,۰۰۰ تومان',

        lawyerShare: '۱۸,۰۰۰,۰۰۰ تومان',

        commission: '۱,۸۰۰,۰۰۰ تومان',

        financialStatus: 'آماده مالی',

        uploadTime: 'امروز، ۱۲:۱۰',

        status: 'جزئیات',

        financialItems: [
            {
                id: 1,
                title: 'رابطه همکاری مشخص',
                value: 'COL-501',
                status: 'completed',
            },
            {
                id: 2,
                title: 'ثبت در عدل ایران و بارگذاری نسخه ثبت‌شده',
                value: 'ثبت و بارگذاری شد',
                status: 'completed',
            },
            {
                id: 3,
                title: 'تأیید موکل',
                value: 'تأیید شد',
                status: 'completed',
            },
            {
                id: 4,
                title: 'آزادسازی سهم وکیل',
                value: 'آماده مالی',
                status: 'financial',
            },
        ],

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
        id: 'CTR-88412',

        paymentId: 'PAY-6102',

        iranRegistrationId: 'ADL-1405-88412',
        caseId: 'VK-1405-00121',
        cooperationId: 'COL-502',

        title: 'تنظیم قرارداد تجاری',

        category: 'قراردادی',

        client: 'الهام رضایی',

        lawyer: 'سارا توکلی',

        iranStatus: 'بارگذاری شد',

        lawyerStatus: 'در انتظار موکل',

        totalFee: '۳۲,۰۰۰,۰۰۰ تومان',

        lawyerShare: '۱۲,۰۰۰,۰۰۰ تومان',

        commission: '۱,۲۰۰,۰۰۰ تومان',

        financialStatus: 'متوقف',

        uploadTime: 'دیروز، ۱۶:۳۰',

        status: 'متوقف',

        financialItems: [
            {
                id: 1,
                title: 'رابطه همکاری مشخص',
                value: 'COL-502',
                status: 'completed',
            },
            {
                id: 2,
                title: 'ثبت در عدل ایران و بارگذاری نسخه ثبت‌شده',
                value: 'بارگذاری شد',
                status: 'completed',
            },
            {
                id: 3,
                title: 'تأیید موکل',
                value: 'در انتظار موکل',
                status: 'pending',
            },
            {
                id: 4,
                title: 'آزادسازی سهم وکیل',
                value: 'متوقف',
                status: 'financial',
            },
        ],

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
];

export function getContractById(contractId) {
    return contracts.find((contract) => contract.id === contractId);
}

export default contracts;
