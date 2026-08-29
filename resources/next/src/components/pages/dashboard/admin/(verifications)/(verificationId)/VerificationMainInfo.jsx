import Link from 'next/link';

export default function VerificationMainInfo({ verification }) {
    return (
        <section className="rounded-2xl border border-[#dce4df] bg-white p-5 shadow-[0_8px_25px_rgba(15,52,45,0.04)] md:p-6">
            {/* Header */}

            <div className="border-b border-[#e1e7e3] pb-4">
                <h2 className="text-lg font-black text-[#173d35]">
                    اطلاعات اصلی
                </h2>
            </div>

            {/* Information */}

            <div className="mt-4 divide-y divide-[#e7ece9]">
                <div className="flex items-center justify-between py-3">
                    <span className="text-xs text-[#87938d]">کد ملی</span>

                    <span className="text-sm font-medium text-[#263f38]">
                        {verification.nationalId}
                    </span>
                </div>

                <div className="flex items-center justify-between py-3">
                    <span className="text-xs text-[#87938d]">شماره پروانه</span>

                    <span className="text-sm font-medium text-[#263f38]">
                        {verification.licenseNumber}
                    </span>
                </div>

                <div className="flex items-center justify-between py-3">
                    <span className="text-xs text-[#87938d]">مرجع صدور</span>

                    <span className="text-sm font-medium text-[#263f38]">
                        {verification.issuer}
                    </span>
                </div>

                <div className="flex items-center justify-between py-3">
                    <span className="text-xs text-[#87938d]">حساب بانکی</span>

                    <span className="text-sm font-medium text-[#263f38]">
                        {verification.bankStatus}
                    </span>
                </div>
            </div>

            {/* Sensitive Access */}

            <Link
                href={`/admin/sensitive-access?request=${encodeURIComponent(
                    verification.id,
                )}`}
                className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl border border-[#d4a447] bg-[#fffaf0] px-5 text-sm font-bold text-[#17463c] transition hover:bg-[#fdf3dd]"
            >
                مشاهده اطلاعات حساس با ثبت دلیل
            </Link>
        </section>
    );
}
