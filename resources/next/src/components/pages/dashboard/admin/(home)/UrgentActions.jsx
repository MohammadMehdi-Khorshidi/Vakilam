import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { urgentActions } from './dashboardData';
import PanelTitle from './PanelTitle';

const badgeStyles = {
    red: 'border-red-200 bg-red-50 text-red-600',
    amber: 'border-amber-200 bg-amber-50 text-amber-700',
    blue: 'border-sky-200 bg-sky-50 text-sky-700',
};

const dotStyles = {
    red: 'bg-red-400',
    amber: 'bg-amber-400',
    blue: 'bg-[#bd9137]',
};

export default function UrgentActions() {
    return (
        <article className="rounded-2xl border border-t-2 border-[#dce4df] border-t-[#cba753] bg-white p-5 shadow-[0_6px_18px_rgba(15,52,45,0.03)] md:p-6">
            <PanelTitle title="اقدام‌های فوری" />

            <div className="mt-4 space-y-2">
                {urgentActions.map((item) => (
                    <Link
                        key={item.id}
                        href={item.href}
                        className={`group flex items-center gap-3 rounded-xl p-4 transition hover:bg-[#f3f7f4] ${
                            item.highlighted ? 'bg-[#f1f7f4]' : ''
                        }`}
                    >
                        <span
                            className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                                dotStyles[item.tone]
                            }`}
                        />

                        <div className="min-w-0 flex-1">
                            <strong className="block truncate text-sm text-[#173b34]">
                                {item.title}
                            </strong>

                            <p className="mt-1 text-xs text-[#89948f]">
                                {item.description}
                            </p>
                        </div>

                        <span
                            className={`shrink-0 rounded-full border px-3 py-1 text-xs ${
                                badgeStyles[item.tone]
                            }`}
                        >
                            {item.label}
                        </span>

                        <ArrowLeft
                            size={17}
                            className="shrink-0 text-[#b28b3e] transition-transform group-hover:-translate-x-1"
                        />
                    </Link>
                ))}
            </div>
        </article>
    );
}
