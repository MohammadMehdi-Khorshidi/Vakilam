const statusConfig = {
    active: {
        label: 'فعال',
        className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    },

    pending_verification: {
        label: 'در انتظار احراز',
        className: 'border-amber-200 bg-amber-50 text-amber-700',
    },

    suspended: {
        label: 'تعلیق‌شده',
        className: 'border-red-200 bg-red-50 text-red-600',
    },

    inactive: {
        label: 'غیرفعال',
        className: 'border-slate-200 bg-slate-50 text-slate-600',
    },
};

export default function UserStatusBadge({ status }) {
    const config = statusConfig[status] || statusConfig.inactive;

    return (
        <span
            className={`inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-medium ${config.className}`}
        >
            {config.label}
        </span>
    );
}
