function addMinutes(date, minutes) {
    return new Date(
        date.getTime() + minutes * 60 * 1000,
    ).toISOString();
}

function addHours(date, hours) {
    return addMinutes(date, hours * 60);
}

function addDays(date, days) {
    return addHours(date, days * 24);
}

function createExampleCase(caseCode) {
    const now = new Date();

    function addMinutes(date, minutes) {
        return new Date(date.getTime() + minutes * 60 * 1000).toISOString();
    }

    function addHours(date, hours) {
        return addMinutes(date, hours * 60);
    }

    function addDays(date, days) {
        return addHours(date, days * 24);
    }

    return {
        code: caseCode || 'VK-1405-00128',

        title: 'مطالبه وجه چک',

        client: 'فرزام ن.',

        category: 'حقوقی و مالی',

        city: 'تهران',

        urgency: 'زیاد',

        status: 'در حال پیگیری',

        engagementCode: 'COL-501',

        // زمان واقعی آخرین بارگذاری صفحه
        updatedAt: now.toISOString(),

        health: 82,

        unreadMessages: 2,

        pendingTasks: 1,

        contractStatus: 'ثبت‌شده در عدل ایران',

        nextAction: 'بررسی نهایی گواهی عدم پرداخت و آماده‌سازی پیش‌نویس اقدام',

        description:
            'مطالبه مبلغ یک فقره چک برگشتی با بررسی مسیرهای حقوقی و ثبتی. اصل چک و گواهی عدم پرداخت در پرونده موجود است.',

        information: {
            clientRequest: 'مطالبه اصل وجه و خسارت‌های قانونی قابل مطالبه',

            opposingParty: 'شرکت توسعه تجارت آرمان',

            amountRial: 8_200_000_000,

            dueDate: '2026-08-25T00:00:00.000Z',

            certificateStatus: 'گواهی عدم پرداخت دریافت شده است',

            checkStatus: 'چک به نام موکل ثبت شده است',
        },

        tasks: [
            {
                id: 'TSK-101',

                title: 'بررسی قرارداد پایه',

                assignee: 'وکیل',

                status: 'in_progress',

                // دو ساعت بعد
                dueAt: addHours(now, 2),

                // یک روز قبل
                createdAt: addDays(now, -1),
            },

            {
                id: 'TSK-102',

                title: 'تطبیق مبلغ و تاریخ چک',

                assignee: 'موکل',

                status: 'completed',

                // یک ساعت قبل
                dueAt: addHours(now, -1),

                // دو روز قبل
                createdAt: addDays(now, -2),
            },

            {
                id: 'TSK-103',

                title: 'تهیه پیش‌نویس اقدام حقوقی',

                assignee: 'وکیل',

                status: 'scheduled',

                // سه روز بعد
                dueAt: addDays(now, 3),

                // امروز
                createdAt: addHours(now, -2),
            },
        ],

        aiReview: {
            requiresClientConfirmation: true,

            message:
                'اطلاعات استخراج‌شده از اسناد، خلاصه‌ها و پیشنهاد اقدام بدون تأیید موکل یا وکیل نهایی نمی‌شوند.',

            items: [
                {
                    id: 1,

                    field: 'مبلغ چک',

                    aiSuggestion: '۸۲۰ میلیون ریال',

                    approvedValue: '۸۲۰ میلیون تومان',

                    correctedBy: 'موکل',
                },

                {
                    id: 2,

                    field: 'نام طرف مقابل',

                    aiSuggestion: 'توسعه تجارت آرمان',

                    approvedValue: 'شرکت توسعه تجارت آرمان',

                    correctedBy: 'موکل',
                },
            ],
        },

        collaboration: {
            code: 'COL-501',

            status: 'فعال',

            // پنج روز قبل از تاریخ فعلی
            startedAt: addDays(now, -5),

            contractStatus: 'ثبت‌شده در عدل ایران',

            financialStatus: 'پیش‌پرداخت ثبت شده؛ سهم وکیل منتظر تأیید موکل',

            serviceScope:
                'بررسی مدارک، انتخاب مسیر مناسب، تهیه پیش‌نویس دادخواست و پیگیری مرحله نخست',
        },

        activities: [
            {
                id: 1,

                title: 'وکیل قرارداد پایه را مشاهده کرد',

                // پنج دقیقه قبل
                occurredAt: addMinutes(now, -5),
            },

            {
                id: 2,

                title: 'نسخه ثبت‌شده قرارداد بارگذاری شد',

                // یک ساعت قبل
                occurredAt: addHours(now, -1),
            },

            {
                id: 3,

                title: 'موکل گواهی عدم پرداخت را تأیید کرد',

                // یک روز قبل
                occurredAt: addDays(now, -1),
            },

            {
                id: 4,

                title: 'رابطه همکاری COL-501 فعال شد',

                // پنج روز قبل
                occurredAt: addDays(now, -5),
            },
        ],
        contract: {
            id: 'CTR-88421',

            engagementCode: 'COL-501',

            adliranCode: 'ADL-1405-88421',

            totalAmountToman: 48_000_000,

            prepaymentToman: 18_000_000,

            platformCommissionRate: 10,

            status: 'registered',

            paymentCompleted: true,

            registeredInAdliran: true,

            registeredCopyUploaded: false,

            clientConfirmed: false,

            lawyerSettled: false,
        },

        /*
         * جلسه ثابت قبلی حذف شده است.
         * جلسات جدید توسط فرم و با تاریخ انتخابی کاربر
         * داخل localStorage ذخیره می‌شوند.
         */
        meetings: [],
    };
}

export async function getCaseDetails(caseCode) {
    return createExampleCase(caseCode);
}
