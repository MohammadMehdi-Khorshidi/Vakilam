import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const statusStyles = {
    verified: 'border-emerald-200 bg-emerald-50 text-emerald-700',

    pending: 'border-amber-200 bg-amber-50 text-amber-700',

    suspended: 'border-red-200 bg-red-50 text-red-600',
};

export default function LawyerDetailsHeader({ lawyer }) {
    return (
        <header className="mb-7">


            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                    <h1 className="text-3xl font-black leading-tight text-[#10382f] md:text-4xl">
                        {lawyer.name}
                    </h1>

                    <p className="mt-3 text-sm text-[#7b8882]">
                        {lawyer.professionalAuthority}
                        <span className="mx-2">·</span>
                        پروانه {lawyer.licenseNumber}
                    </p>
                </div>

                <span
                    className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-medium ${
                        statusStyles[lawyer.verificationStatus] ||
                        statusStyles.pending
                    }`}
                >
                    {lawyer.verificationLabel}
                </span>
            </div>
        </header>
    );
}
