export default function CaseFullInfo({ caseData }) {
    const information = [
        {
            label: 'شناسه پرونده',
            value: caseData.id,
        },
        {
            label: 'موکل',
            value: caseData.client,
        },
        {
            label: 'دسته‌بندی',
            value: caseData.category,
        },
        {
            label: 'شهر',
            value: caseData.city,
        },
        {
            label: 'فوریت',
            value: caseData.urgency,
        },
        {
            label: 'وکیل فعلی',
            value: caseData.lawyer,
        },
        {
            label: 'تاریخ ایجاد',
            value: caseData.createdAt,
        },
        {
            label: 'تعداد اسناد',
            value: caseData.documentsCount,
        },
    ];

    return (
        <section className="rounded-2xl border border-[#dce4df] bg-white p-5 shadow-[0_8px_25px_rgba(15,52,45,0.04)] md:p-6">
            <div className="border-b border-[#e1e7e3] pb-4">
                <h2 className="text-lg font-black text-[#173d35]">
                    اطلاعات کامل رکورد
                </h2>

                <p className="mt-2 text-xs text-[#87938d]">
                    اطلاعات عملیاتی قابل مشاهده در سطح فعلی
                </p>
            </div>

            <div className="mt-4 overflow-hidden rounded-2xl border border-[#dce4df]">
                <div className="grid grid-cols-1 md:grid-cols-2">
                    {information.map((item, index) => (
                        <div
                            key={item.label}
                            className={`flex min-h-[70px] flex-col justify-center gap-2 px-5 py-4 ${
                                index % 2 === 0 ? 'md:border-l' : ''
                            } ${
                                index < information.length - 2 ? 'border-b' : ''
                            } border-[#e1e7e3]`}
                        >
                            <span className="text-xs text-[#84908b]">
                                {item.label}
                            </span>

                            <strong className="text-sm font-black text-[#173d35]">
                                {item.value}
                            </strong>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
