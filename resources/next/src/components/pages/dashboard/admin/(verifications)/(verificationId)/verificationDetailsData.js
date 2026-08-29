const verificationDetails = {
    'verify-1': {
        id: 'verify-1',

        name: 'مهدی رضوانی',

        nationalId: '۷۸۰۰۰۰۰۱۲',

        licenseNumber: '۲۸۴۸۶',

        issuer: 'کانون وکلای مرکز',

        bankStatus: 'تطبیق نام انجام شد',

        documents: [
            {
                id: 1,
                title: 'کارت ملی',
                description: 'فایل محرمانه',
            },
            {
                id: 2,
                title: 'پروانه وکالت',
                description: 'فایل محرمانه',
            },
            {
                id: 3,
                title: 'عکس پرسنلی',
                description: 'فایل محرمانه',
            },
            {
                id: 4,
                title: 'گواهی بانکی',
                description: 'فایل محرمانه',
            },
        ],
    },

    'verify-2': {
        id: 'verify-2',

        name: 'الهام منصوری',

        nationalId: '۱۲۳۰۰۰۹۱۱',

        licenseNumber: '۹۱۱۷۶',

        issuer: 'مرکز وکلا',

        bankStatus: 'در انتظار تطبیق',

        documents: [
            {
                id: 'national-card',
                title: 'کارت ملی',
                description: 'فایل محرمانه',
            },
            {
                id: 'law-license',
                title: 'پروانه وکالت',
                description: 'فایل محرمانه',
            },
            {
                id: 'personal-photo',
                title: 'عکس پرسنلی',
                description: 'فایل محرمانه',
            },
            {
                id: 'bank-certificate',
                title: 'گواهی بانکی',
                description: 'فایل محرمانه',
            },
        ],
    },
};

export function getVerificationById(id) {
    return verificationDetails[id];
}
