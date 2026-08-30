function InformationItem({
    title,
    children,
    borderBottom = true,
    borderLeft = false,
}) {
    return (
        <div
            className={`min-h-[82px] p-5 ${
                borderBottom ? 'border-b border-[#dfe6e2]' : ''
            } ${borderLeft ? 'md:border-l md:border-[#dfe6e2]' : ''}`}
        >
            <span className="block text-xs text-[#87938d]">{title}</span>

            <div className="mt-2 text-sm font-black text-[#173d35]">
                {children}
            </div>
        </div>
    );
}

export default function LawyerRecordCard({ lawyer }) {
    return (
        <article className="rounded-2xl border border-[#dce4df] bg-white p-5 shadow-[0_8px_25px_rgba(15,52,45,0.04)] md:p-6">
            <header className="border-b border-[#e1e7e3] pb-4">
                <h2 className="text-lg font-black text-[#173d35]">
                    اطلاعات کامل رکورد
                </h2>

                <p className="mt-2 text-xs text-[#85918b]">
                    اطلاعات عملیاتی قابل مشاهده در سطح فعلی
                </p>
            </header>

            <div className="mt-4 overflow-hidden rounded-2xl border border-[#dce4df]">
                <div className="grid md:grid-cols-2">
                    <InformationItem title="شناسه وکیل" borderLeft>
                        <span dir="ltr">{lawyer.id}</span>
                    </InformationItem>

                    <InformationItem title="شهر">{lawyer.city}</InformationItem>

                    <InformationItem title="مرجع حرفه‌ای" borderLeft>
                        {lawyer.professionalAuthority}
                    </InformationItem>

                    <InformationItem title="شماره پروانه">
                        {lawyer.licenseNumber}
                    </InformationItem>

                    <InformationItem title="وضعیت احراز" borderLeft>
                        {lawyer.verificationLabel}
                    </InformationItem>

                    <InformationItem title="امتیاز اعتماد">
                        {lawyer.trustScore !== null
                            ? lawyer.trustScore.toLocaleString('fa-IR')
                            : 'محاسبه نشده'}
                    </InformationItem>

                    <InformationItem title="امتیاز تجربه همکاری" borderLeft>
                        {lawyer.cooperationScore !== null
                            ? lawyer.cooperationScore.toLocaleString('fa-IR')
                            : 'بدون سابقه'}
                    </InformationItem>

                    <InformationItem title="پرونده فعال">
                        {lawyer.activeCases.toLocaleString('fa-IR')}
                    </InformationItem>

                    <InformationItem
                        title="وضعیت تسویه"
                        borderBottom={false}
                        borderLeft
                    >
                        {lawyer.settlementLabel}
                    </InformationItem>

                    <InformationItem title="وضعیت همکاری" borderBottom={false}>
                        {lawyer.verificationStatus === 'verified'
                            ? 'مجاز به دریافت پرونده'
                            : 'غیرفعال تا پایان احراز'}
                    </InformationItem>
                </div>
            </div>
        </article>
    );
}
