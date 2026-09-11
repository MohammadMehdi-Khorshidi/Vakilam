export const proposalStatusLabels = {
    draft: 'پیش‌نویس',
    submitted: 'در انتظار تصمیم موکل',
    rejected: 'پذیرفته نشد',
    withdrawn: 'پس‌گرفته‌شده',
    selected: 'پذیرفته‌شده',
    shortlisted: 'در حال بررسی',
    cancelled: 'لغوشده',
    expired: 'منقضی‌شده',
};

export function proposalStatusLabel(status) {
    return proposalStatusLabels[status] || 'پیشنهاد';
}
