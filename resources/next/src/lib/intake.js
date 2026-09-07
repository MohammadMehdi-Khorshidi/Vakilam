export const steps = [
    'شرح مسئله',
    'برداشت و دسته‌بندی',
    'گفت‌وگو و راهنما',
    'راهنمای اقدام',
    'شهر پرونده',
    'فوریت',
    'مدارک',
    'محرمانگی',
    'خلاصه و اصلاح',
    'تأیید نهایی',
    'انتخاب مسیر بعدی',
];

export const initialData = {
    description: '',
    legal_category_id: null,
    category: '',
    answer: '',
    action: '',
    province_id: '',
    city_id: '',
    city: '',
    urgency: 'normal',
    documents: [],
    privacy: 'استاندارد',
    confirmed: false,
    path: '',
};

export const categories = [
    {
        id: 'civil',
        title: 'حقوقی',
        letter: 'ح',
        description: 'چک، سفته، بدهی، مطالبه وجه و اختلافات حقوقی',
    },
    {
        id: 'real_estate',
        title: 'املاک',
        letter: 'م',
        description: 'مالکیت، اجاره، تخلیه، سرقفلی و اختلافات ملکی',
    },
    {
        id: 'labor',
        title: 'کار و تأمین اجتماعی',
        letter: 'ک',
        description: 'حقوق کار، بیمه و اختلاف کارگر و کارفرما',
    },
    {
        id: 'commercial',
        title: 'تجاری و شرکت‌ها',
        letter: 'ش',
        description: 'قرارداد تجاری، شرکت و اختلاف شرکا',
    },
    {
        id: 'family',
        title: 'خانواده',
        letter: 'خ',
        description: 'طلاق، مهریه، حضانت و نفقه',
    },
    {
        id: 'criminal',
        title: 'کیفری',
        letter: 'ک',
        description: 'شکایت، اتهام، جرایم و پرونده‌های کیفری',
    },
    {
        id: 'administrative',
        title: 'دیوان عدالت اداری',
        letter: 'د',
        description: 'اعتراض به تصمیم‌ها و اقدامات دستگاه‌های اداری',
    },
    {
        id: 'registration',
        title: 'ثبتی',
        letter: 'ث',
        description: 'ثبت اسناد، شرکت‌ها و موضوعات ثبتی',
    },
    {
        id: 'tax',
        title: 'مالیاتی',
        letter: 'م',
        description: 'مالیات، اعتراض مالیاتی و هیئت‌های حل اختلاف',
    },
    {
        id: 'banking',
        title: 'بانکی',
        letter: 'ب',
        description: 'تسهیلات، ضمانت‌ها و اختلافات بانکی',
    },
    {
        id: 'other',
        title: 'سایر',
        letter: 'س',
        description: 'موضوعاتی که در دسته‌های دیگر قرار نمی‌گیرند',
    },
];

export const urgencyOptions = [
    { value: 'normal', label: 'عادی' },
    { value: 'high', label: 'مهم' },
    { value: 'urgent', label: 'فوری — کمتر از ۲۴ ساعت فرصت دارم' },
];

export const paths = [
    {
        id: 'lawyer_selection',
        title: 'انتخاب وکیل',
        text: 'دریافت پیشنهاد و انتخاب وکیل مناسب',
    },
    {
        id: 'consultation',
        title: 'رزرو مشاوره',
        text: 'انتخاب وکیل و زمان مشاوره',
    },
    {
        id: 'ai_assistant',
        title: 'دستیار هوش مصنوعی',
        text: 'این مسیر به‌زودی فعال می‌شود',
        disabled: true,
    },
];

const categoryAliases = {
    'حقوق و مالی': 'civil',
    حقوقی: 'civil',
    ملکی: 'real_estate',
    املاک: 'real_estate',
    'کار و تأمین اجتماعی': 'labor',
    'شرکت‌ها و قراردادها': 'commercial',
    'تجاری و شرکت‌ها': 'commercial',
    خانواده: 'family',
    کیفری: 'criminal',
    'دیوان عدالت اداری': 'administrative',
    ثبتی: 'registration',
    مالیاتی: 'tax',
    بانکی: 'banking',
    سایر: 'other',
};

const urgencyAliases = {
    عادی: 'normal',
    مهم: 'high',
    'فوری — کمتر از ۲۴ ساعت فرصت دارم': 'urgent',
};

const serviceIntentAliases = {
    lawyer: 'lawyer_selection',
    lawyer_selection: 'lawyer_selection',
    consultation: 'consultation',
    ai: 'ai_assistant',
    ai_assistant: 'ai_assistant',
    undecided: 'undecided',
};

export function normalizeCategoryCode(value) {
    if (!value) return '';
    if (typeof value === 'object') {
        return normalizeCategoryCode(value.code ?? value.value ?? value.id);
    }
    const stringValue = String(value).trim();
    return categoryAliases[stringValue] ?? stringValue;
}

export function normalizeUrgencyValue(value) {
    if (!value) return 'normal';
    if (typeof value === 'object') {
        return normalizeUrgencyValue(value.value ?? value.id);
    }
    const stringValue = String(value).trim();
    return urgencyAliases[stringValue] ?? stringValue;
}

export function normalizeServiceIntent(value) {
    if (!value) return '';
    if (typeof value === 'object') {
        return normalizeServiceIntent(value.value ?? value.id);
    }
    const stringValue = String(value).trim();
    return serviceIntentAliases[stringValue] ?? stringValue;
}

export function categoryLabel(value) {
    const code = normalizeCategoryCode(value);
    return categories.find((item) => item.id === code)?.title ?? value ?? 'ثبت نشده';
}

export function urgencyLabel(value) {
    const normalized = normalizeUrgencyValue(value);
    return urgencyOptions.find((item) => item.value === normalized)?.label ?? value ?? 'ثبت نشده';
}

export const titles = [
    'موضوع حقوقی‌ات را با زبان خودت توضیح بده',
    'پیشنهاد وکیلم برای دسته‌بندی مسئله',
    'دستیار وکیلم چند سؤال کوتاه دارد',
    'راهنمای اقدام پیشنهادی',
    'پرونده مربوط به کدام شهر است؟',
    'این موضوع چقدر فوری است؟',
    'مدارک مرتبط را اضافه کنید',
    'سطح محرمانگی را انتخاب کنید',
    'خلاصه پرونده را مرور کنید',
    'تأیید نهایی اطلاعات',
    'مسیر بعدی را انتخاب کنید',
];

export const subtitles = [
    'لازم نیست عنوان دعوا یا اصطلاح حقوقی را بدانید؛ فقط اتفاق را ساده و روشن بنویسید.',
    'این تشخیص پیشنهادی است؛ آن را تأیید یا اصلاح کنید.',
    'پاسخ‌ها کمک می‌کنند راهنمایی اولیه متناسب‌تری دریافت کنید.',
    'این راهنما تصمیم نهایی حقوقی محسوب نمی‌شود.',
    'محل وقوع موضوع یا مرجع احتمالی رسیدگی را انتخاب کنید.',
    'فوریت در اولویت‌بندی و پیشنهاد خدمات اثر دارد.',
    'افزودن مدرک در این مرحله اختیاری است.',
    'کنترل اطلاعات همیشه در اختیار شماست.',
    'قبل از ادامه، اطلاعات ثبت‌شده را بررسی کنید.',
    'پس از تأیید، درخواست برای انتخاب مسیر آماده می‌شود.',
    'یکی از روش‌های فعال دریافت خدمت را انتخاب کنید.',
];
