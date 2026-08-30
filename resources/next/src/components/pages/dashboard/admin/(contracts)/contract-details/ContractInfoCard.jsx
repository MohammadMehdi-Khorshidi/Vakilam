export default function ContractInfoCard({ contract }) {
    const items = [
        {
            label: 'شناسه داخلی',
            value: contract?.id,
        },
        {
            label: 'شناسه ثبت عدل ایران',
            value: contract?.iranRegistrationId,
        },
        {
            label: 'شناسه پرونده',
            value: contract?.caseId,
        },
        {
            label: 'شناسه همکاری',
            value: contract?.cooperationId,
        },
        {
            label: 'موکل',
            value: contract?.client,
        },
        {
            label: 'وکیل',
            value: contract?.lawyer,
        },
        {
            label: 'وضعیت عدل ایران',
            value: contract?.iranStatus,
        },
        {
            label: 'تأیید موکل',
            value: contract?.lawyerStatus,
        },
        {
            label: 'حق‌الوکاله کل',
            value: contract?.totalFee,
        },
        {
            label: 'پیش‌پرداخت',
            value: contract?.lawyerShare,
        },
        {
            label: 'کمیسیون وکیلم',
            value: contract?.commission,
        },
        {
            label: 'وضعیت مالی',
            value: contract?.financialStatus,
        },
        {
            label: 'زمان بارگذاری',
            value: contract?.uploadTime,
        },
    ];

    return (
        <section
            dir="rtl"
            className="rounded-[20px] border border-[#dce5e0] bg-white p-5 shadow-[0_8px_30px_rgba(15,52,45,0.035)] sm:p-6"
        >
            {/* Header */}
            <div className="border-b border-[#e8eeeb] pb-4">
                <h2 className="text-lg font-black text-[#173d35]">
                    اطلاعات کامل رکورد
                </h2>

                <p className="mt-1.5 text-xs text-[#87938d]">
                    اطلاعات عملیاتی قابل مشاهده در سطح فعلی
                </p>
            </div>

            {/* Information */}
            <div className="mt-5 overflow-hidden rounded-[16px] border border-[#e0e8e4]">
                <div className="grid sm:grid-cols-2">
                    {items.map((item, index) => (
                        <div
                            key={item.label}
                            className={`flex min-h-[70px] flex-col justify-center px-5 py-3.5 transition-colors hover:bg-[#f8fbf9] ${index !== items.length - 1 ? 'border-b border-[#e8eeeb]' : ''} ${index % 2 === 0 ? 'sm:border-l sm:border-[#e8eeeb]' : ''} ${index === items.length - 2 ? 'sm:border-b-0' : ''} ${index === items.length - 1 ? 'sm:border-b-0' : ''} `}
                        >
                            <span className="text-[11px] font-medium text-[#89958f]">
                                {item.label}
                            </span>

                            <span className="mt-1.5 text-sm font-black text-[#183d35]">
                                {item.value || '—'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
