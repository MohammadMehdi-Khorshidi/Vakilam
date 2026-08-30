import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function CaseDetailsHeader({ caseData }) {
    return (
        <header className="mb-7">
            <div className="mb-4 flex items-center justify-between">

                <span className="rounded-full border border-[#ead9a7] bg-[#fffaf0] px-3 py-1.5 text-xs font-bold text-[#8a6828]">
                    {caseData.status}
                </span>
            </div>

            <div className="text-right">
                <h1 className="text-3xl font-black tracking-tight text-[#123f37] sm:text-4xl">
                    {caseData.title}
                </h1>

                <p className="mt-3 text-sm text-[#7c8984]">
                    {caseData.id}
                    <span className="mx-2">•</span>
                    {caseData.category}
                </p>
            </div>
        </header>
    );
}
