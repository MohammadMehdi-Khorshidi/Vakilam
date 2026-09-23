export const STATUS_LABELS = {
    active: 'فعال',
    suspended: 'تعلیق‌شده',
    closed: 'بسته',
    pending: 'در انتظار بررسی',
    approved: 'تأییدشده',
    rejected: 'ردشده',
    held: 'رزرو موقت',
    confirmed: 'تأییدشده',
    completed: 'انجام‌شده',
    cancelled: 'لغوشده',
    canceled: 'لغوشده',
    failed: 'ناموفق',
    paid: 'پرداخت‌شده',
    unpaid: 'پرداخت‌نشده',
    draft: 'پیش‌نویس',
    submitted: 'ثبت‌شده',
    matching: 'در حال تطبیق',
    in_progress: 'در حال انجام',
    accepted: 'پذیرفته‌شده',
    declined: 'ردشده',
};

export const ROLE_LABELS = {
    client: 'موکل',
    lawyer: 'وکیل',
    admin: 'ادمین',
    super_admin: 'سوپر ادمین',
};

export const SERVICE_INTENT_LABELS = {
    lawyer_selection: 'انتخاب وکیل',
    consultation: 'مشاوره حقوقی',
};

export const URGENCY_LABELS = {
    low: 'عادی',
    normal: 'عادی',
    medium: 'متوسط',
    high: 'فوری',
    urgent: 'خیلی فوری',
};

export const ACTION_LABELS = {
    'user.status.suspended': 'تعلیق حساب کاربر',
    'user.status.active': 'فعال‌سازی حساب کاربر',
    'lawyer.verification.approved': 'تأیید احراز وکیل',
    'lawyer.verification.rejected': 'رد احراز وکیل',
    'admin.granted': 'اعطای دسترسی ادمین',
    'admin.revoked': 'لغو دسترسی ادمین',
};

export const TARGET_LABELS = {
    User: 'کاربر',
    LawyerProfile: 'وکیل',
    LawyerVerification: 'احراز وکیل',
};

export function statusLabel(value) {
    return STATUS_LABELS[value] ?? String(value || '—');
}

export function roleLabel(value) {
    return ROLE_LABELS[value] ?? String(value || '—');
}

export function serviceIntentLabel(value) {
    return SERVICE_INTENT_LABELS[value] ?? String(value || '—');
}

export function urgencyLabel(value) {
    return URGENCY_LABELS[value] ?? String(value || '—');
}

export function actionLabel(value) {
    return ACTION_LABELS[value] ?? String(value || 'عملیات مدیریتی');
}

export function targetLabel(value) {
    return TARGET_LABELS[value] ?? String(value || 'سامانه');
}

export function faDate(value) {
    if (!value) return '—';
    try {
        return new Intl.DateTimeFormat('fa-IR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(value));
    } catch {
        return '—';
    }
}
