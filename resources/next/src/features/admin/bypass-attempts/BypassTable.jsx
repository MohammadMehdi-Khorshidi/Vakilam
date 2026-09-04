import Link from 'next/link';

import BypassStatus from './BypassStatus';

const columns = [
    'زمان',
    'نقش',
    'نوع شناسایی',
    'مسدود شد',
    'تکرار',
    'وضعیت',
    'اقدام',
];

function EventLink({ eventId }) {
    return (
        <Link
            href={`/admin/bypass-attempts/${eventId}`}
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#d3dcd8] bg-white px-4 text-sm font-bold text-[#173e38] transition hover:border-[#b68a31] hover:bg-[#fffaf0]"
        >
            مشاهده رویداد
        </Link>
    );
}

export default function BypassTable({ events }) {
    return (
        <section className="overflow-hidden rounded-[22px] border border-[#dce5e1] bg-white p-3 shadow-[0_8px_28px_rgba(20,61,52,0.06)] sm:p-5">
            {/* نسخه دسکتاپ */}
            <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[950px] border-collapse text-center">
                    <thead className="bg-[#fafbf9] text-sm font-semibold text-[#687a74]">
                        <tr>
                            {columns.map((column) => (
                                <th key={column} className="px-5 py-4">
                                    {column}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {events.map((event) => (
                            <tr
                                key={event.id}
                                className="border-t border-[#dde5e1] text-sm text-[#253e39] transition hover:bg-[#fbfcfa]"
                            >
                                <td className="px-5 py-5">
                                    <Link
                                        href={`/admin/bypass-attempts/${event.id}`}
                                        className="border-b border-[#c79631] font-bold text-[#155347]"
                                    >
                                        {event.time}
                                    </Link>
                                </td>

                                <td className="px-5 py-5">{event.role}</td>

                                <td className="px-5 py-5">
                                    {event.detectionType}
                                </td>

                                <td className="px-5 py-5">
                                    {event.blocked ? 'بله' : 'خیر'}
                                </td>

                                <td className="px-5 py-5">{event.repeat}</td>

                                <td className="px-5 py-5">
                                    <BypassStatus status={event.status} />
                                </td>

                                <td className="px-5 py-5">
                                    <EventLink eventId={event.id} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* نسخه موبایل */}
            <div className="grid gap-3 md:hidden">
                {events.map((event) => (
                    <article
                        key={event.id}
                        className="rounded-2xl border border-[#e1e8e5] p-4"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <Link
                                    href={`/admin/bypass-attempts/${event.id}`}
                                    className="border-b border-[#c79631] text-sm font-bold text-[#155347]"
                                >
                                    {event.time}
                                </Link>

                                <p className="mt-2 font-bold">
                                    {event.detectionType}
                                </p>
                            </div>

                            <BypassStatus status={event.status} />
                        </div>

                        <dl className="mt-5 grid grid-cols-3 gap-3 text-sm">
                            <div>
                                <dt className="text-xs text-[#84918d]">نقش</dt>

                                <dd className="mt-1 font-medium">
                                    {event.role}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-xs text-[#84918d]">
                                    مسدود شد
                                </dt>

                                <dd className="mt-1 font-medium">
                                    {event.blocked ? 'بله' : 'خیر'}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-xs text-[#84918d]">
                                    تکرار
                                </dt>

                                <dd className="mt-1 font-medium">
                                    {event.repeat}
                                </dd>
                            </div>
                        </dl>

                        <div className="mt-5">
                            <EventLink eventId={event.id} />
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}
