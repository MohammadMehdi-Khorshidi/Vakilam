import { violationStatusLabels } from './violationsData';

const statusStyles = {
    open: 'border-red-200 bg-red-50 text-red-600',
    reviewing: 'border-amber-200 bg-amber-50 text-amber-700',
};

export default function ViolationStatus({ status }) {
    return (
        <span
            className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${
                statusStyles[status] ?? ''
            }`}
        >
            {violationStatusLabels[status] ?? status}
        </span>
    );
}
