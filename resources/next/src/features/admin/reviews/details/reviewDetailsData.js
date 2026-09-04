export const reviewDetails = [
    {
        id: 'review-401',
        author: 'نرگس سعادتی',
        text: 'پاسخ‌گویی منظم بود و هزینه‌ها و روند پرونده را روشن توضیح دادند.',
        editableText:
            'پاسخ‌گویی منظم بود و هزینه‌ها و روند پرونده را روشن توضیح دادند.',
        rating: '۴.۸',
        collaborationStatus: 'همکاری ثبت‌شده',
        visibilityStatus: 'عمومی نشده',
        description: 'همکاری ثبت‌شده و هویت موکل به‌صورت داخلی تأیید شده است.',

        controls: [
            {
                id: 1,
                label: 'فاقد شماره تماس، نشانی یا شناسه بیرونی',
                checked: true,
            },
            {
                id: 2,
                label: 'فاقد اطلاعات محرمانه پرونده',
                checked: true,
            },
            {
                id: 3,
                label: 'درباره تجربه همکاری است، نه نتیجه پرونده',
                checked: true,
            },
            {
                id: 4,
                label: 'نیازمند تبدیل به گزارش تخلف',
                checked: false,
            },
        ],
    },
    {
        id: 'review-402',
        author: 'امیررضا باقری',
        text: 'در چند مرحله پاسخ‌گویی با تأخیر انجام شد و درباره هزینه تکمیلی اختلاف داشتیم.',
        editableText:
            'در چند مرحله پاسخ‌گویی با تأخیر انجام شد و درباره هزینه تکمیلی اختلاف داشتیم.',
        rating: '۲.۶',
        collaborationStatus: 'همکاری ثبت‌شده',
        visibilityStatus: 'عمومی نشده',
        description: 'همکاری ثبت‌شده و هویت موکل به‌صورت داخلی تأیید شده است.',

        controls: [
            {
                id: 1,
                label: 'فاقد شماره تماس، نشانی یا شناسه بیرونی',
                checked: true,
            },
            {
                id: 2,
                label: 'فاقد اطلاعات محرمانه پرونده',
                checked: true,
            },
            {
                id: 3,
                label: 'درباره تجربه همکاری است، نه نتیجه پرونده',
                checked: true,
            },
            {
                id: 4,
                label: 'نیازمند تبدیل به گزارش تخلف',
                checked: false,
            },
        ],
    },
];

export function getReviewById(reviewId) {
    return reviewDetails.find((review) => review.id === reviewId);
}
