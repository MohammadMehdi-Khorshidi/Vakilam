const informationItems = [
    {
        key: 'id',
        label: 'شناسه گزارش',
    },
    {
        key: 'reportedUser',
        label: 'گزارش‌شونده',
    },
    {
        key: 'source',
        label: 'منبع گزارش',
    },
    {
        key: 'severity',
        label: 'شدت',
    },
    {
        key: 'status',
        label: 'وضعیت',
    },
    {
        key: 'createdAt',
        label: 'زمان ایجاد',
    },
    {
        key: 'relatedCase',
        label: 'پرونده مرتبط',
    },
    {
        key: 'reviewer',
        label: 'مسئول بررسی',
    },
];

export default function ViolationInformation({ violation }) {
    return (
        <section className="rounded-[22px] border border-[#dce5e1] bg-white p-5 shadow-[0_7px_25px_rgba(20,61,52,0.05)]">
            <div className="border-b border-[#e4eae7] pb-4">
                <h2 className="text-lg font-black text-[#173e38]">
                    اطلاعات کامل رکورد
                </h2>

                <p className="mt-2 text-xs text-[#89948f]">
                    اطلاعات عملیاتی قابل مشاهده در سطح فعلی
                </p>
            </div>

            <dl className="mt-4 grid overflow-hidden rounded-2xl border border-[#dce4e1] sm:grid-cols-2">
                {informationItems.map((item) => (
                    <div
                        key={item.key}
                        className="min-h-[82px] border-b border-[#dce4e1] p-4 odd:sm:border-l"
                    >
                        <dt className="text-xs text-[#89948f]">{item.label}</dt>

                        <dd className="mt-2 text-sm font-bold text-[#143c35]">
                            {violation[item.key]}
                        </dd>
                    </div>
                ))}
            </dl>
        </section>
    );
}
