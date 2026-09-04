import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function VerificationCard({ request }) {
    return (
        <div className="flex flex-col gap-4 rounded-2xl border border-[#dce4df] bg-white px-4 py-3 transition-all duration-200 hover:border-[#c9d6d0] hover:shadow-[0_8px_25px_rgba(15,52,45,0.05)] md:flex-row md:items-center md:justify-between">
            {/* ================= اطلاعات وکیل ================= */}

            <div className="flex min-w-0 items-center gap-3">
                {/* Avatar */}

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#123f37] text-sm font-black text-white">
                    {request.name.charAt(0)}
                </div>

                {/* Information */}

                <div className="min-w-0">
                    <h2 className="truncate text-sm font-black text-[#173d35]">
                        {request.name}
                    </h2>

                    <p className="mt-1 text-xs text-[#87938d]">
                        {request.office}
                    </p>

                    <p className="mt-1 text-[11px] text-[#a0aaa5]">
                        پرونده {request.caseNumber}
                    </p>
                </div>
            </div>

            {/* ================= وضعیت و عملیات ================= */}

            <div className="flex flex-wrap items-center gap-2 md:justify-end">
                {/* زمان */}

                <span className="text-[11px] text-[#8a9690]">
                    {request.submittedAt}
                </span>

                {/* Priority */}

                <span
                    className={`rounded-full border px-3 py-1.5 text-[11px] font-bold ${
                        request.priority === 'عادی'
                            ? 'border-[#cfe3d8] bg-[#f2faf5] text-[#46725d]'
                            : 'border-[#ead9a9] bg-[#fff9e9] text-[#8c6b28]'
                    }`}
                >
                    {request.priority}
                </span>

                {/* Status */}

                <span className="rounded-full border border-[#ead9a9] bg-[#fffaf0] px-3 py-1.5 text-[11px] font-bold text-[#73551e]">
                    {request.status}
                </span>

                {/* Details */}
                <Link
                    href={`/admin/lawyer-verifications/verify-${request.id}`}
                    className="group flex items-center gap-2 rounded-xl px-2 py-2 text-xs font-bold text-[#5f6d67] transition hover:bg-[#f4f7f4] hover:text-[#123f37]"
                >
                    بررسی
                    <ArrowLeft
                        size={15}
                        strokeWidth={1.8}
                        className="transition-transform duration-200 group-hover:-translate-x-1"
                    />
                </Link>
            </div>
        </div>
    );
}
