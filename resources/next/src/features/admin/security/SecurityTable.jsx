import Link from 'next/link';

import SecuritySeverity from './SecuritySeverity';

const columns = ['شناسه', 'عامل', 'رویداد', 'زمان', 'شدت', 'اقدام'];

function DetailsButton({ eventId }) {
    return (
        <Link
            href={`/admin/security-events/${eventId}`}
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#d3dcd8] bg-white px-4 text-sm font-bold text-[#173e38] transition hover:border-[#b68a31] hover:bg-[#fffaf0] focus:outline-none focus:ring-2 focus:ring-[#c89a3b]/20"
        >
            جزئیات رویداد
        </Link>
    );
}

export default function SecurityTable({ events = [] }) {
    if (!events.length) {
        return (
            <section className="rounded-[22px] border border-[#dce5e1] bg-white p-8 text-center">
                <p className="text-sm text-[#71807b]">
                    رویداد امنیتی برای نمایش وجود ندارد.
                </p>
            </section>
        );
    }

    return (
        <section className="overflow-hidden rounded-[22px] border border-[#dce5e1] bg-white p-3 shadow-[0_8px_28px_rgba(20,61,52,0.06)] sm:p-5">
            {/* نسخه دسکتاپ */}
            <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[950px] border-collapse text-center">
                    <thead className="bg-[#fafbf9] text-sm font-semibold text-[#687a74]">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column}
                                    scope="col"
                                    className="whitespace-nowrap px-5 py-4"
                                >
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
                                <td className="whitespace-nowrap px-5 py-5">
                                    <Link
                                        href={`/admin/security/${event.id}`}
                                        className="border-b border-[#c79631] font-bold text-[#155347]"
                                    >
                                        {event.id}
                                    </Link>
                                </td>

                                <td className="whitespace-nowrap px-5 py-5">
                                    {event.actor}
                                </td>

                                <td className="px-5 py-5">{event.event}</td>

                                <td className="whitespace-nowrap px-5 py-5">
                                    {event.time}
                                </td>

                                <td className="whitespace-nowrap px-5 py-5">
                                    <SecuritySeverity
                                        severity={event.severity}
                                    />
                                </td>

                                <td className="whitespace-nowrap px-5 py-5">
                                    <DetailsButton eventId={event.id} />
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
                        <div className="flex items-center justify-between gap-3">
                            <Link
                                href={`/admin/security/${event.id}`}
                                className="border-b border-[#c79631] font-bold text-[#155347]"
                            >
                                {event.id}
                            </Link>

                            <SecuritySeverity severity={event.severity} />
                        </div>

                        <h2 className="mt-4 text-sm font-black leading-7 text-[#173e38]">
                            {event.event}
                        </h2>

                        <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <dt className="text-xs text-[#84918d]">عامل</dt>

                                <dd className="mt-1 font-medium">
                                    {event.actor}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-xs text-[#84918d]">زمان</dt>

                                <dd className="mt-1 font-medium">
                                    {event.time}
                                </dd>
                            </div>
                        </dl>

                        <div className="mt-5">
                            <DetailsButton eventId={event.id} />
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}
