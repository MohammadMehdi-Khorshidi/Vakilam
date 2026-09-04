export const notificationDetails = [
    {
        id: 'NTF-901',
        title: 'مدرک احراز ناقص است',
        audience: 'وکیل',
        trigger: 'تصمیم مدیر',
        channel: 'صندوق هوشمند و پیامک',
        status: 'فعال',
        statusCode: 'active',
        containsSensitiveData: false,
        message:
            'یکی از مدارک احراز شما نیازمند اصلاح است. جزئیات را در پنل مشاهده کنید.',

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
        id: 'NTF-902',
        title: 'قرارداد برای تأیید آماده است',
        audience: 'موکل',
        trigger: 'بارگذاری وکیل',
        channel: 'صندوق هوشمند',
        status: 'فعال',
        statusCode: 'active',
        containsSensitiveData: false,
        message: 'قرارداد همکاری برای بررسی و تأیید شما آماده شده است.',

        accessSteps: [
            {
                id: 1,
                title: 'بارگذاری قرارداد',
                description: 'ثبت قرارداد توسط وکیل',
            },
            {
                id: 2,
                title: 'ایجاد اعلان',
                description: 'ساخت اعلان توسط سامانه',
            },
            {
                id: 3,
                title: 'ارسال برای موکل',
                description: 'نمایش در صندوق هوشمند',
            },
        ],
    },
];

export function getNotificationById(notificationId) {
    return notificationDetails.find(
        (notification) => notification.id === notificationId,
    );
}
