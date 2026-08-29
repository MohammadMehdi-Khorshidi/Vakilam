import Link from 'next/link';

export default function ContractAccessCard({ contract }) {
    const accessSteps = contract?.accessSteps ?? [];

    return (
        <aside className="rounded-2xl border border-[#dce4df] bg-white p-5 shadow-[0_8px_25px_rgba(15,52,45,0.04)] sm:p-6">
            <div className="border-b border-[#e5ebe7] pb-4">
                <h2 className="text-lg font-black text-[#173d35]">
                    کنترل دسترسی و سابقه
                </h2>

                <p className="mt-2 text-xs leading-6 text-[#87938d]">
                    تمام مشاهده‌ها و تصمیم‌ها قابل حسابرسی‌اند.
                </p>
            </div>

            <div className="mt-5 space-y-5">
                {accessSteps.length > 0 ? (
                    accessSteps.map((step, index) => (
                        <div
                            key={step.id ?? index}
                            className="flex items-start gap-3"
                        >
                            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#f8f0dd] text-sm font-black text-[#73551e]">
                                {(step.id ?? index + 1).toLocaleString('fa-IR')}
                            </span>

                            <div>
                                <h3 className="text-sm font-black text-[#263f38]">
                                    {step.title}
                                </h3>

                                <p className="mt-1 text-xs leading-6 text-[#87938d]">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="rounded-xl bg-[#f3f8f5] px-4 py-5 text-center text-xs text-[#87938d]">
                        سابقه دسترسی ثبت نشده است.
                    </div>
                )}
            </div>

            <Link
                href={`/admin/sensitive-access?request=${encodeURIComponent(
                    contract?.id ?? '',
                )}`}
                className="mt-7 flex min-h-12 w-full items-center justify-center rounded-xl border border-[#d4a447] bg-[#fffaf0] px-4 text-sm font-bold text-[#17463c] transition hover:bg-[#fdf3dd]"
            >
                مشاهده داده حساس با ثبت دلیل
            </Link>
        </aside>
    );
}
