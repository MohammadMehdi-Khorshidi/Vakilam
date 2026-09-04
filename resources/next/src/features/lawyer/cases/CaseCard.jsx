import Link from 'next/link';

import {
    BriefcaseBusiness,
    CircleAlert,
    ClipboardList,
    MapPin,
    MessageSquare,
} from 'lucide-react';

import InfoItem from './InfoItem';

const statusStyles = {
    green: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    amber: 'border-amber-200 bg-amber-50 text-amber-700',
    blue: 'border-sky-200 bg-sky-50 text-sky-700',
};

export default function CaseCard({ item }) {
    return (
        <article
            className={`rounded-2xl bg-white p-6 shadow-sm ${
                item.highlighted
                    ? 'border border-[#d8b45d]'
                    : 'border border-[#dce6e2]'
            }`}
        >
            <div className="flex items-start gap-4">
                <div className="grid size-12 shrink-0 place-items-center rounded-xl border border-[#dce6e2] bg-[#f4f9f7] text-[#0b302b]">
                    <BriefcaseBusiness size={22} />
                </div>

                <div>
                    <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs ${
                            statusStyles[item.statusColor]
                        }`}
                    >
                        {item.status}
                    </span>

                    <h2 className="mt-2 text-xl font-bold text-[#0b302b]">
                        {item.title}
                    </h2>

                    <p className="mt-1 text-xs text-[#7a8985]">
                        {item.code} · موکل: {item.client}
                    </p>
                </div>
            </div>

            <p className="my-6 min-h-12 text-sm leading-8 text-[#677773]">
                {item.description}
            </p>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <InfoItem icon={MapPin}>{item.city}</InfoItem>

                <InfoItem icon={CircleAlert}>{item.urgency}</InfoItem>

                <InfoItem icon={MessageSquare}>
                    {item.messages} پیام جدید
                </InfoItem>

                <InfoItem icon={ClipboardList}>
                    {item.tasks} کار عقب‌افتاده
                </InfoItem>
            </div>

            <div className="my-5 rounded-xl border border-[#ead3a1] bg-[#fffaf0] px-4 py-3">
                <span className="block text-xs text-[#aa7b25]">اقدام بعدی</span>

                <strong className="mt-1 block text-sm text-[#183d36]">
                    {item.nextAction}
                </strong>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
                <Link
                    href={`/lawyer/cases/${encodeURIComponent(item.code)}`}
                    className="rounded-xl border border-[#cfdbd7] bg-white px-5 py-3 text-center text-sm font-bold text-[#0b302b] transition hover:bg-[#f5f8f6]"
                >
                    کارهای پرونده
                </Link>

                <Link
                    href={`/lawyer/cases/${encodeURIComponent(item.code)}`}
                    className="rounded-xl bg-[#0b5648] px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-[#073f35]"
                >
                    ورود به پرونده
                </Link>
            </div>
        </article>
    );
}
