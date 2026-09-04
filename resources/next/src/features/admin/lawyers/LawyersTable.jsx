import Link from 'next/link';

import LawyerStatusBadge from './LawyerStatusBadge';

export default function LawyersTable({ lawyers }) {
    if (!lawyers.length) {
        return (
            <section className="mt-5 rounded-2xl border border-[#dce4df] bg-white px-5 py-16 text-center shadow-[0_8px_25px_rgba(15,52,45,0.05)]">
                <h2 className="text-lg font-black text-[#173b34]">
                    وکیلی پیدا نشد
                </h2>

                <p className="mt-2 text-sm text-[#7d8983]">
                    در این وضعیت وکیلی برای نمایش وجود ندارد.
                </p>
            </section>
        );
    }

    return (
        <section className="mt-5 overflow-hidden rounded-2xl border border-[#dce4df] bg-white p-4 shadow-[0_8px_25px_rgba(15,52,45,0.05)] md:p-5">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] border-collapse text-right text-sm">
                    <thead>
                        <tr className="bg-[#f8faf8] text-xs text-[#66736d]">
                            <th className="rounded-r-xl p-4 font-medium">
                                نام وکیل
                            </th>

                            <th className="p-4 font-medium">شماره پروانه</th>

                            <th className="p-4 font-medium">احراز</th>

                            <th className="p-4 font-medium">امتیاز اعتماد</th>

                            <th className="p-4 font-medium">پرونده فعال</th>

                            <th className="rounded-l-xl p-4 text-center font-medium">
                                اقدام
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {lawyers.map((lawyer) => (
                            <tr
                                key={lawyer.id}
                                className="border-b border-[#e1e7e3] transition last:border-b-0 hover:bg-[#fafcfb]"
                            >
                                <td className="p-4">
                                    <Link
                                        href={`/admin/lawyersAdmin/${lawyer.id}`}
                                        className="font-bold text-[#17483e] underline decoration-[#c7a252] underline-offset-4 transition hover:text-[#b18431]"
                                    >
                                        {lawyer.name}
                                    </Link>
                                </td>

                                <td className="p-4 font-medium text-[#344840]">
                                    {lawyer.licenseNumber}
                                </td>

                                <td className="p-4">
                                    <LawyerStatusBadge
                                        status={lawyer.verificationStatus}
                                    />
                                </td>

                                <td className="p-4">
                                    {lawyer.trustScore !== null ? (
                                        <span className="font-bold text-[#273f38]">
                                            {lawyer.trustScore.toLocaleString(
                                                'fa-IR',
                                            )}
                                        </span>
                                    ) : (
                                        <span className="text-[#87938d]">
                                            —
                                        </span>
                                    )}
                                </td>

                                <td className="p-4">
                                    <span className="font-bold text-[#273f38]">
                                        {lawyer.activeCases.toLocaleString(
                                            'fa-IR',
                                        )}
                                    </span>
                                </td>

                                <td className="p-4 text-center">
                                    <Link
                                        href={`/admin/lawyersAdmin/${lawyer.id}`}
                                        className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#d2dcd7] bg-white px-4 text-sm font-bold text-[#17483e] transition hover:border-[#b99449] hover:bg-[#fbf8f0]"
                                    >
                                        مشاهده کامل
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
