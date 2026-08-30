const severityConfig = {
    high: {
        label: 'زیاد',
        className: 'border-red-200 bg-red-50 text-red-600',
    },

    medium: {
        label: 'متوسط',
        className: 'border-amber-200 bg-amber-50 text-amber-700',
    },

    informational: {
        label: 'اطلاعاتی',
        className: 'border-sky-200 bg-sky-50 text-sky-700',
    },

    low: {
        label: 'کم',
        className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    },
};

export default function SecuritySeverity({ severity }) {
    const config = severityConfig[severity];

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
