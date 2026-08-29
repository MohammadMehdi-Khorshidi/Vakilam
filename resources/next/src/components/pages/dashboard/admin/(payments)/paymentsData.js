export const paymentStats = [
    {
        id: 1,
        title: 'پیش‌پرداخت امروز',
        value: '۸۶ میلیون',
        type: 'money',
    },
    {
        id: 2,
        title: 'سهم آماده تسویه',
        value: '۵۷ میلیون',
        type: 'money',
    },
    {
        id: 3,
        title: 'کمیسیون ثبت‌شده',
        value: '۶/۳ میلیون',
        type: 'money',
    },
    {
        id: 4,
        title: 'موارد متوقف',
        value: '۳',
        type: 'stopped',
    },
];

export const payments = [
    {
        id: 'PAY-1405-00128',
        cooperationId: 'COL-501',
        title: 'مطالبه وجه چک',
        prepayment: '۱۸,۰۰۰,۰۰۰ تومان',
        contractStatus: 'انجام شد',
        clientConfirmation: 'انجام شد',
        commission: '۱,۸۰۰,۰۰۰ تومان',
        settlementStatus: 'آماده تسویه',
    },
    {
        id: 'PAY-1405-00121',
        cooperationId: 'COL-502',
        title: 'تنظیم قرارداد تجاری',
        prepayment: '۱۲,۰۰۰,۰۰۰ تومان',
        contractStatus: 'انجام شد',
        clientConfirmation: 'در انتظار',
        commission: '۱,۲۰۰,۰۰۰ تومان',
        settlementStatus: 'متوقف',
    },
    {
        id: 'PAY-1405-00117',
        cooperationId: 'COL-503',
        title: 'اختلاف پیمانکاری',
        prepayment: '۲۵,۰۰۰,۰۰۰ تومان',
        contractStatus: 'ثبت نشده',
        clientConfirmation: 'در انتظار',
        commission: '—',
        settlementStatus: 'غیرفعال‌سازی',
    },
];
