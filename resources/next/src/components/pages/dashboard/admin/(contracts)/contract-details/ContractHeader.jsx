export default function ContractHeader({ contract }) {
    if (!contract) {
        return null;
    }

    return (
        <div
            dir="rtl"
            className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
        >
            <div>
                <p className="mb-2 text-sm font-bold text-[#b28a3e]">
                    مدیریت قراردادها
                </p>

                <h1 className="text-2xl font-black text-[#123f37] sm:text-3xl lg:text-4xl">
                    {contract.title}
                </h1>

                <p className="mt-2 text-sm text-[#87938d]">
                    {contract.cooperationId || '—'}

                    <span className="mx-2">•</span>

                    {contract.iranRegistrationId || '—'}
                </p>
            </div>

            <span className="inline-flex w-fit items-center rounded-full border border-[#ead9a9] bg-[#fffaf0] px-4 py-2 text-xs font-bold text-[#8a6727]">
                {contract.status || 'در جریان'}
            </span>
        </div>
    );
}
