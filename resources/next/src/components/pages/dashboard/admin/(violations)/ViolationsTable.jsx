import Link from 'next/link';

import ViolationStatus from './ViolationStatus';

const tableColumns = ['شناسه', 'نوع', 'گزارش‌شونده', 'منبع', 'وضعیت', 'اقدام'];

function ReviewButton({ violationId }) {
    return (
        <Link
            href={`/admin/violations/${violationId}`}
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#d3dcd8] bg-white px-4 text-sm font-bold text-[#173e38] transition hover:border-[#b68a31] hover:bg-[#fffaf0]"
        >
            بررسی کامل
        </Link>
    );
}

export default function ViolationsTable({ violations }) {
    return (
        <section className="overflow-hidden rounded-[22px] border border-[#dce5e1] bg-white p-3 shadow-[0_8px_28px_rgba(20,61,52,0.06)] sm:p-5">
            {/* دسکتاپ */}
            <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[850px] border-collapse text-center">
                    <thead className="bg-[#fafbf9] text-sm font-semibold text-[#687a74]">
                        <tr>
                            {tableColumns.map((column) => (
                                <th key={column} className="px-5 py-4">
                                    {column}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {violations.map((violation) => (
                            <tr
                                key={violation.id}
                                className="border-t border-[#dde5e1] text-sm text-[#253e39] transition hover:bg-[#fbfcfa]"
                            >
                                <td className="px-5 py-5">
                                    <Link
                                        href={`/admin/violations/${violation.id}`}
                                        className="border-b border-[#c79631] font-bold text-[#155347]"
                                    >
                                        {violation.id}
                                    </Link>
                                </td>

                                <td className="px-5 py-5">{violation.type}</td>

                                <td className="px-5 py-5">
                                    {violation.reportedUser}
                                </td>

                                <td className="px-5 py-5">
                                    {violation.source}
                                </td>

                                <td className="px-5 py-5">
                                    <ViolationStatus
                                        status={violation.status}
                                    />
                                </td>

                                <td className="px-5 py-5">
                                    <ReviewButton violationId={violation.id} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* موبایل */}
            <div className="grid gap-3 md:hidden">
                {violations.map((violation) => (
                    <article
                        key={violation.id}
                        className="rounded-2xl border border-[#e1e8e5] p-4"
                    >
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <Link
                                href={`/admin/violations/${violation.id}`}
                                className="border-b border-[#c79631] font-bold text-[#155347]"
                            >
                                {violation.id}
                            </Link>

                            <ViolationStatus status={violation.status} />
                        </div>

                        <h2 className="font-bold text-[#173e38]">
                            {violation.type}
                        </h2>

                        <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <dt className="text-[#84918d]">گزارش‌شونده</dt>

                                <dd className="mt-1">
                                    {violation.reportedUser}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-[#84918d]">منبع</dt>

                                <dd className="mt-1">{violation.source}</dd>
                            </div>
                        </dl>

                        <div className="mt-5">
                            <ReviewButton violationId={violation.id} />
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}
