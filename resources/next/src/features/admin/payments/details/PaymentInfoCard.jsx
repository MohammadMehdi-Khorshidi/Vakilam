export default function PaymentInfoCard({ payment }) {
    const items = [
        {
            label: 'شناسه پرداخت',
            value: payment.id,
        },
        {
            label: 'موکل',
            value: payment.client,
        },
        {
            label: 'پیش‌پرداخت ثبت‌شده',
            value: payment.expectedPayment,
        },
        {
            label: 'وکیل',
            value: payment.lawyer,
        },
        {
            label: 'کمیسیون وکیلم',
            value: payment.commission,
        },
        {
            label: 'سهم وکیل',
            value: payment.lawyerShare,
        },
        {
            label: 'وضعیت',
            value: payment.status,
        },
        {
            label: 'تطبیق حساب بانکی',
            value: payment.bankStatus,
        },
        {
            label: 'کنترل حسابداری',
            value: payment.accountingStatus,
        },
    ];

    return (
        <section className="rounded-2xl border border-[#dce4df] bg-white p-5 shadow-[0_8px_25px_rgba(15,52,45,0.04)] sm:p-6">
            <div className="border-b border-[#e5ebe7] pb-4">
                <h2 className="text-lg font-black text-[#173d35]">
                    اطلاعات کامل رکورد
                </h2>

                <p className="mt-2 text-xs text-[#87938d]">
                    اطلاعات عملیاتی قابل مشاهده در سطح فعلی
                </p>
            </div>

            <div className="mt-4 grid overflow-hidden rounded-2xl border border-[#dce4df] sm:grid-cols-2">
                {items.map((item, index) => (
                    <div
                        key={item.label}
                        className={`min-h-[76px] border-[#e1e7e3] px-5 py-4 ${index % 2 === 0 ? 'sm:border-l' : ''} ${index < items.length - 2 ? 'border-b' : ''} `}
                    >
                        <p className="text-xs text-[#89958f]">{item.label}</p>

                        <p className="mt-2 text-sm font-black text-[#183d35]">
                            {item.value}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}
