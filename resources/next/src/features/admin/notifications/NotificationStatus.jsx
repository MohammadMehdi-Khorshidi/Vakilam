const statusConfig = {
    active: {
        label: 'فعال',
        className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    },

    financial_connection: {
        label: 'نیازمند اتصال مالی',
        className: 'border-amber-200 bg-amber-50 text-amber-700',
    },

    inactive: {
        label: 'غیرفعال',
        className: 'border-slate-200 bg-slate-50 text-slate-600',
    },

    draft: {
        label: 'پیش‌نویس',
        className: 'border-sky-200 bg-sky-50 text-sky-700',
    },
};

export default function NotificationStatus({ status }) {
    const config = statusConfig[status];

    if (!config) {
        return null;
    }

    return (
        <span
            className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${config.className}`}
        >
            {config.label}
        </span>
    );
}
