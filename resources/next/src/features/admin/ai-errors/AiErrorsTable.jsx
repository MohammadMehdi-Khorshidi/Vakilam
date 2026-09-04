import Link from 'next/link';

const columns = [
    'شناسه',
    'فیلد',
    'پیشنهاد هوش مصنوعی',
    'مقدار اصلاح‌شده',
    'اصلاح‌کننده',
    'زمان',
    'اقدام',
];

function HistoryButton({ errorId }) {
    return (
        <Link
            href={`/admin/ai-errors/${errorId}`}
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#d3dcd8] bg-white px-4 text-sm font-bold text-[#173e38] transition hover:border-[#b68a31] hover:bg-[#fffaf0] focus:outline-none focus:ring-2 focus:ring-[#c89a3b]/20"
        >
            تاریخچه کامل
        </Link>
    );
}

export default function AiErrorsTable({ errors = [] }) {
    if (!errors.length) {
        return (
            <section
                dir="rtl"
                className="rounded-[22px] border border-[#dce5e1] bg-white p-8 text-center shadow-[0_8px_28px_rgba(20,61,52,0.06)]"
            >
                <p className="text-sm text-[#71807b]">
                    هیچ اصلاحی برای نمایش وجود ندارد.
                </p>
            </section>
        );
    }

    return (
        <section
            dir="rtl"
            className="overflow-hidden rounded-[22px] border border-[#dce5e1] bg-white p-3 shadow-[0_8px_28px_rgba(20,61,52,0.06)] sm:p-5"
        >
            {/* نسخه دسکتاپ */}
            <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[1050px] border-collapse text-center">
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
                        {errors.map((item) => (
                            <tr
                                key={item.id}
                                className="border-t border-[#dde5e1] text-sm text-[#253e39] transition hover:bg-[#fbfcfa]"
                            >
                                <td className="whitespace-nowrap px-5 py-5">
                                    <Link
                                        href={`/admin/ai-error/${item.id}`}
                                        className="border-b border-[#c79631] font-bold text-[#155347] transition hover:text-[#0d4037]"
                                    >
                                        {item.id}
                                    </Link>
                                </td>

                                <td className="whitespace-nowrap px-5 py-5 font-medium">
                                    {item.field}
                                </td>

                                <td className="px-5 py-5">
                                    <span className="text-[#65736f] line-through decoration-[#9b524e] decoration-1">
                                        {item.aiSuggestion}
                                    </span>
                                </td>

                                <td className="px-5 py-5 font-bold text-[#173e38]">
                                    {item.correctedValue}
                                </td>

                                <td className="whitespace-nowrap px-5 py-5">
                                    {item.corrector}
                                </td>

                                <td className="whitespace-nowrap px-5 py-5">
                                    {item.time}
                                </td>

                                <td className="whitespace-nowrap px-5 py-5">
                                    <HistoryButton errorId={item.id} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* نسخه موبایل */}
            <div className="grid gap-3 md:hidden">
                {errors.map((item) => (
                    <article
                        key={item.id}
                        className="rounded-2xl border border-[#e1e8e5] p-4"
                    >
                        <div className="flex items-center justify-between gap-3">
                            <Link
                                href={`/admin/ai-error/${item.id}`}
                                className="border-b border-[#c79631] font-bold text-[#155347]"
                            >
                                {item.id}
                            </Link>

                            <span className="text-xs text-[#7c8884]">
                                {item.time}
                            </span>
                        </div>

                        <h2 className="mt-4 font-black text-[#173e38]">
                            {item.field}
                        </h2>

                        <dl className="mt-4 space-y-4 text-sm">
                            <div>
                                <dt className="text-xs text-[#84918d]">
                                    پیشنهاد هوش مصنوعی
                                </dt>

                                <dd className="mt-1 leading-7 text-[#65736f] line-through decoration-[#9b524e]">
                                    {item.aiSuggestion}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-xs text-[#84918d]">
                                    مقدار اصلاح‌شده
                                </dt>

                                <dd className="mt-1 font-bold leading-7 text-[#173e38]">
                                    {item.correctedValue}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-xs text-[#84918d]">
                                    اصلاح‌کننده
                                </dt>

                                <dd className="mt-1">{item.corrector}</dd>
                            </div>
                        </dl>

                        <div className="mt-5">
                            <HistoryButton errorId={item.id} />
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}
