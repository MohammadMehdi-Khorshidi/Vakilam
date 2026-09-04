const payments = [
    {
        id: 'PAY-6101',

        title: 'مطالبه وجه چک',

        cooperationId: 'COL-501',

        caseId: 'VK-1405-00128',

        client: 'فرزام نخعی',

        lawyer: 'نرگس سعادتی',

        expectedPayment: '۱۸,۰۰۰,۰۰۰ تومان',

        lawyerShare: '۱۶,۲۰۰,۰۰۰ تومان',

        commission: '۱,۸۰۰,۰۰۰ تومان',

        status: 'آماده تسویه',

        bankStatus: 'تطبیق شد',

        accountingStatus: 'در انتظار اقدام مدیر مالی',

        paymentSteps: [
            {
                id: 1,
                title: 'پیش‌پرداخت در وکیلم ثبت شده',
                value: '۱۸,۰۰۰,۰۰۰ تومان',
                type: 'payment',
            },
            {
                id: 2,
                title: 'قرارداد در عدل ایران ثبت و بارگذاری شده',
                value: 'تکمیل',
                type: 'contract',
            },
            {
                id: 3,
                title: 'موکل قرارداد را تأیید کرده',
                value: 'تکمیل',
                type: 'client',
            },
            {
                id: 4,
                title: 'کنترل مالی و آزادسازی',
                value: 'در انتظار اقدام مدیر مالی',
                type: 'financial',
            },
        ],
    },
];

export function getPaymentById(paymentId) {
    return payments.find((payment) => payment.id === paymentId);
}
