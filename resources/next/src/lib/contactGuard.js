const toEnglishDigits = (value = '') =>
    String(value)
        .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
        .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)));

const patterns = [
    /[a-z0-9._%+-]+\s*@\s*[a-z0-9.-]+\.[a-z]{2,}/iu,
    /(?:https?:\/\/|www\.)\S+/iu,
    /(?:t\.me|telegram\.me|wa\.me|whatsapp\.com|instagram\.com)\/?\S*/iu,
    /@[a-z0-9_.]{3,}/iu,
    /(?:تلگرام|واتساپ|واتس\s*اپ|اینستاگرام|ایمیل|e-?mail|telegram|whats\s*app|instagram)/iu,
    /(?<!\d)(?:(?:\+98|0098|98)[\s\-.()]*)?0?9\d(?:[\s\-.()]*\d){8}(?!\d)/u,
    /(?<!\d)0\d(?:[\s\-.()]*\d){8,10}(?!\d)/u,
];

export function containsContactInformation(value) {
    const normalized = toEnglishDigits(value);
    return patterns.some((pattern) => pattern.test(normalized));
}

export const contactWarning =
    'ارسال شماره تماس، ایمیل، لینک یا شناسه شبکه‌های اجتماعی در مذاکره مجاز نیست.';
