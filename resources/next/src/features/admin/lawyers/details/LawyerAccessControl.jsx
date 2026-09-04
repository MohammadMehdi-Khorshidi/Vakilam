import Link from 'next/link';

export default function LawyerAccessControl({ lawyer }) {
    const sensitiveAccessUrl = `/admin/sensitive-access?request=${encodeURIComponent(
        lawyer.id,
    )}&type=lawyer`;

    return (
        <aside className="rounded-2xl border border-[#dce4df] bg-white p-5 shadow-[0_8px_25px_rgba(15,52,45,0.04)] md:p-6">
            <header className="border-b border-[#e1e7e3] pb-4">
                <h2 className="text-lg font-black text-[#173d35]">
                    کنترل دسترسی و سابقه
                </h2>

                <p className="mt-2 text-xs leading-6 text-[#85918b]">
                    تمام مشاهده‌ها و تصمیم‌ها قابل حسابرسی‌اند.
                </p>
            </header>

            <div className="mt-4 space-y-4">
                {lawyer.accessSteps.map((step) => (
                    <div key={step.id} className="flex items-start gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#f8f0dd] text-sm font-black text-[#73551e]">
                            {step.id.toLocaleString('fa-IR')}
                        </span>

                        <div>
                            <strong className="block text-sm text-[#263f38]">
                                {step.title}
                            </strong>

                            <p className="mt-1 text-xs leading-6 text-[#87938d]">
                                {step.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <Link
                href={sensitiveAccessUrl}
                className="mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-[#d4a447] bg-[#fffaf0] px-4 text-sm font-bold text-[#17463c] transition hover:bg-[#fdf3dd]"
            >
                مشاهده داده حساس با ثبت دلیل
            </Link>
        </aside>
    );
}
