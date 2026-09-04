const accessSteps = [
    {
        id: 1,
        title: 'ایجاد یا دریافت رکورد',
        description: 'ثبت خودکار در سامانه',
    },
    {
        id: 2,
        title: 'ورود مدیر به صفحه جزئیات',
        description: 'نمایش داده عملیاتی بدون بازکردن اطلاعات حساس',
    },
    {
        id: 3,
        title: 'تصمیم یا اقدام بعدی',
        description: 'نیازمند ثبت دلیل مدیر',
    },
];

export default function ViolationAccessControl() {
    return (
        <aside className="rounded-[22px] border border-[#dce5e1] bg-white p-5 shadow-[0_7px_25px_rgba(20,61,52,0.05)]">
            <div className="border-b border-[#e4eae7] pb-4">
                <h2 className="text-lg font-black text-[#173e38]">
                    کنترل دسترسی و سابقه
                </h2>

                <p className="mt-2 text-xs leading-6 text-[#89948f]">
                    تمام مشاهده‌ها و تصمیم‌ها قابل حسابرسی‌اند
                </p>
            </div>

            <ol className="mt-4 space-y-4">
                {accessSteps.map((step) => (
                    <li key={step.id} className="flex items-start gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#f8f1e2] text-sm font-bold text-[#173e38]">
                            {step.id}
                        </span>

                        <div>
                            <h3 className="text-sm font-bold">{step.title}</h3>

                            <p className="mt-1 text-xs leading-5 text-[#89948f]">
                                {step.description}
                            </p>
                        </div>
                    </li>
                ))}
            </ol>

            <button
                type="button"
                className="mt-5 w-full rounded-xl border border-[#d5a746] bg-[#fffcf5] px-4 py-3 text-sm font-bold text-[#23433d] transition hover:bg-[#fff7e6]"
            >
                مشاهده داده حساس با ثبت دلیل
            </button>
        </aside>
    );
}
