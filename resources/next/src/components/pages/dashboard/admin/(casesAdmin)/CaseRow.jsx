import Link from 'next/link';

const statusStyles = {
    waiting: 'border-[#ead9a7] bg-[#fffaf0] text-[#8a6828]',

    contract: 'border-[#c9e3ef] bg-[#f2faff] text-[#39718a]',

    active: 'border-[#ead9a7] bg-[#fffaf0] text-[#8a6828]',
};

export default function CaseRow({ caseItem }) {
    return (
        <tr className="border-b border-[#e6ebe8] last:border-b-0 hover:bg-[#fbfdfc]">
            {/* ID */}

            <td className="px-5 py-5">
                <Link
                    href={`/admin/cases/${caseItem.id}`}
                    className="font-bold text-[#17463c] underline decoration-[#c9a96e] underline-offset-4 transition hover:text-[#a17c2e]"
                >
                    {caseItem.id}
                </Link>
            </td>

            {/* Title */}

            <td className="px-5 py-5">
                <Link
                    href={`/admin/cases/${caseItem.id}`}
                    className="font-bold text-[#17463c] underline decoration-[#c9a96e] underline-offset-4 transition hover:text-[#a17c2e]"
                >
                    {caseItem.title}
                </Link>
            </td>

            {/* Client */}

            <td className="px-5 py-5 text-sm text-[#52625b]">
                {caseItem.client}
            </td>

            {/* Status */}

            <td className="px-5 py-5">
                <span
                    className={`inline-flex rounded-full border px-3 py-1.5 text-[11px] font-bold ${
                        statusStyles[caseItem.statusType]
                    }`}
                >
                    {caseItem.status}
                </span>
            </td>

            {/* Lawyer */}

            <td className="px-5 py-5 text-sm text-[#52625b]">
                {caseItem.lawyer}
            </td>

            {/* Action */}

            <td className="px-5 py-5">
                <Link
                    href={`/admin/cases/${caseItem.id}`}
                    className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[#d7e1dc] bg-white px-4 text-xs font-bold text-[#17463c] transition hover:border-[#b8ccc4] hover:bg-[#f5f9f7]"
                >
                    جزئیات پرونده
                </Link>
            </td>
        </tr>
    );
}
