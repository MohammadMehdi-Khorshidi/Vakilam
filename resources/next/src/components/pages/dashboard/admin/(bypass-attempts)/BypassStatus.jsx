const statusConfig = {
    pending_review: {
        label: 'نیازمند بررسی',
        className: 'border-red-200 bg-red-50 text-red-600',
    },

    warned: {
        label: 'هشدار داده شد',
        className: 'border-amber-200 bg-amber-50 text-amber-700',
    },

    restricted: {
        label: 'دسترسی محدود',
        className: 'border-red-200 bg-red-50 text-red-600',
    },
};

export default function BypassStatus({ status }) {
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
