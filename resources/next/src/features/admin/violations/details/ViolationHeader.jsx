import Link from 'next/link';

export default function ViolationHeader({ violation }) {
    return (
        <header className="mb-8">
            <h1 className="text-3xl font-black tracking-[-0.04em] text-[#103a33] sm:text-[38px]">
                {violation.title}
            </h1>

            <p className="mt-3 text-sm text-[#74817d]">
                {violation.id}
                <span className="mx-2">•</span>
                {violation.reportedUser}
            </p>

            <span className="mt-5 inline-flex rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
                {violation.status}
            </span>
        </header>
    );
}
