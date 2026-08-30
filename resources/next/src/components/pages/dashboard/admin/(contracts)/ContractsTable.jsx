'use client';

import Link from 'next/link';
import { contracts } from './contractsData';

function StatusBadge({ type, children }) {
    const styles = {
        ready: 'border-[#bfe3d5] bg-[#effaf5] text-[#28735f]',
        stopped: 'border-[#ead9a9] bg-[#fff9e9] text-[#9a7628]',
        progress: 'border-[#c8dfeb] bg-[#f0f8fc] text-[#36728b]',
    };

    return (
        <span
            className={`inline-flex items-center justify-center rounded-full border px-3 py-1 text-[11px] font-bold ${
                styles[type] || styles.progress
            }`}
        >
            {children}
        </span>
    );
}

export default function ContractsTable() {
    return (
        <section
            dir="rtl"
            className="overflow-hidden rounded-2xl border border-[#dce4df] bg-white p-4 shadow-[0_8px_25px_rgba(15,52,45,0.04)] sm:p-5"
        >
            {/* Desktop Table */}
            <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[900px] border-collapse">
                    <thead>
                        <tr className="border-b border-[#e1e7e3]">
                            <th className="px-4 py-4 text-right text-xs font-bold text-[#77847e]">
                                شناسه ثبت
                            </th>

                            <th className="px-4 py-4 text-right text-xs font-bold text-[#77847e]">
                                پرونده
                            </th>

                            <th className="px-4 py-4 text-right text-xs font-bold text-[#77847e]">
                                ثبت عدل ایران
                            </th>

                            <th className="px-4 py-4 text-right text-xs font-bold text-[#77847e]">
                                تأیید موکل
                            </th>

                            <th className="px-4 py-4 text-right text-xs font-bold text-[#77847e]">
                                وضعیت
                            </th>

                            <th className="px-4 py-4 text-center text-xs font-bold text-[#77847e]">
                                اقدام
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {contracts.map((contract) => (
                            <tr
                                key={contract.id || contract.caseTitle}
                                className="border-b border-[#e7ece9] last:border-b-0"
                            >
                                {/* شناسه */}
                                <td className="px-4 py-5">
                                    {contract.id ? (
                                        <Link
                                            href={`/admin/contracts/${contract.id}`}
                                            className="font-bold text-[#174f45] underline decoration-[#c9a96e] underline-offset-4 transition hover:text-[#c19b50]"
                                        >
                                            {contract.id}
                                        </Link>
                                    ) : (
                                        <span className="text-sm text-[#87938d]">
                                            ثبت نشده
                                        </span>
                                    )}
                                </td>

                                {/* پرونده */}
                                <td className="px-4 py-5">
                                    <Link
                                        href={`/admin/contracts/${
                                            contract.id || 'new'
                                        }`}
                                        className="font-bold text-[#174f45] underline decoration-[#c9a96e] underline-offset-4 transition hover:text-[#c19b50]"
                                    >
                                        {contract.caseTitle}
                                    </Link>
                                </td>

                                {/* عدل ایران */}
                                <td className="px-4 py-5 text-sm text-[#344b44]">
                                    {contract.iranJudiciaryStatus}
                                </td>

                                {/* تأیید موکل */}
                                <td className="px-4 py-5 text-sm text-[#344b44]">
                                    {contract.lawyerStatus}
                                </td>

                                {/* وضعیت */}
                                <td className="px-4 py-5">
                                    <StatusBadge type={contract.statusType}>
                                        {contract.status}
                                    </StatusBadge>
                                </td>

                                {/* اقدام */}
                                <td className="px-4 py-5 text-center">
                                    <Link
                                        href={`/admin/contracts/${
                                            contract.id || 'new'
                                        }`}
                                        className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[#d5dfda] bg-white px-4 text-xs font-bold text-[#315c51] transition hover:border-[#c9a96e] hover:bg-[#fffaf0]"
                                    >
                                        باز کردن قرارداد
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="space-y-3 md:hidden">
                {contracts.map((contract) => (
                    <div
                        key={contract.id || contract.caseTitle}
                        className="rounded-2xl border border-[#e0e7e3] p-4"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-[11px] text-[#8a9690]">
                                    پرونده
                                </p>

                                <Link
                                    href={`/admin/contracts/${
                                        contract.id || 'new'
                                    }`}
                                    className="mt-1 block text-sm font-bold text-[#174f45] underline decoration-[#c9a96e] underline-offset-4"
                                >
                                    {contract.caseTitle}
                                </Link>
                            </div>

                            <StatusBadge type={contract.statusType}>
                                {contract.status}
                            </StatusBadge>
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-3 text-xs">
                            <div className="flex items-center justify-between border-b border-[#edf0ee] pb-2">
                                <span className="text-[#87938d]">
                                    شناسه ثبت
                                </span>

                                <span className="font-bold text-[#31544b]">
                                    {contract.id || 'ثبت نشده'}
                                </span>
                            </div>

                            <div className="flex items-center justify-between border-b border-[#edf0ee] pb-2">
                                <span className="text-[#87938d]">
                                    ثبت عدل ایران
                                </span>

                                <span className="font-medium text-[#31544b]">
                                    {contract.iranJudiciaryStatus}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-[#87938d]">
                                    تأیید موکل
                                </span>

                                <span className="font-medium text-[#31544b]">
                                    {contract.lawyerStatus}
                                </span>
                            </div>
                        </div>
                        <Link
                            href={`/admin/contract/${contract.id}`}
                            className="inline-flex items-center justify-center rounded-xl border border-[#d8e2dd] bg-white px-4 py-2.5 text-xs font-bold text-[#17463c] transition hover:bg-[#f3f8f5]"
                        >
                            باز کردن قرارداد
                        </Link>
                    </div>
                ))}
            </div>
        </section>
    );
}
