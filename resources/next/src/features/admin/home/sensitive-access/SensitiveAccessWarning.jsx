import { TriangleAlert } from 'lucide-react';

export default function SensitiveAccessWarning() {
    return (
        <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-[#efd28c] bg-[#fff8e8] px-4 py-4 md:px-5"
        >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white text-[#b47e24] shadow-sm">
                <TriangleAlert size={18} strokeWidth={1.8} />
            </span>

            <div>
                <strong className="block text-sm font-black text-[#3c3c34]">
                    حساسیت دسترسی
                </strong>

                <p className="mt-2 text-xs leading-6 text-[#77766d]">
                    شناسه مدیر، دلیل، زمان، پرونده مرتبط و داده مشاهده‌شده در
                    رویدادهای امنیتی ثبت می‌شود.
                </p>
            </div>
        </div>
    );
}
