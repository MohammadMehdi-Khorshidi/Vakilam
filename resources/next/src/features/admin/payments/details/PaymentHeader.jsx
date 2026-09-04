export default function PaymentHeader({ payment }) {
    return (
        <div
            dir="rtl"
            className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
        >
            <div>
                <p className="mb-2 text-sm font-bold text-[#b28a3e]">
                    پرداخت، کمیسیون و تسویه
                </p>

                <h1 className="text-2xl font-black text-[#123f37] sm:text-3xl lg:text-4xl">
                    {payment.title}
                </h1>

                <p className="mt-2 text-sm text-[#87938d]">
                    {payment.id}

                    <span className="mx-2">•</span>

                    {payment.cooperationId}
                </p>
            </div>

            <span className="inline-flex w-fit items-center rounded-full border border-[#cde7dc] bg-[#f0faf5] px-4 py-2 text-xs font-bold text-[#28745c]">
                {payment.status}
            </span>
        </div>
    );
}
