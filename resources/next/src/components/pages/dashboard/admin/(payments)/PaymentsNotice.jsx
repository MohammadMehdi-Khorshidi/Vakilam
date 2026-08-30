import { TriangleAlert } from 'lucide-react';

export default function PaymentsNotice() {
    return (
        <section
            dir="rtl"
            className="mt-4 flex items-start gap-4 rounded-2xl border border-[#efd99d] bg-[#fff9e9] px-5 py-4"
        >
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-[#b58a34]">
                <TriangleAlert size={18} strokeWidth={1.8} />
            </div>

            <div>
                <h2 className="text-sm font-black text-[#4c4a3d]">
                    پیش از پرداخت واقعی
                </h2>

                <p className="mt-1.5 text-xs leading-6 text-[#8a8777]">
                    کنترل‌های حقوقی، مالی، حسابداری، تطبیق حساب بانکی و سوابق
                    قرارداد در نسخه عملیاتی انجام می‌شود.
                </p>
            </div>
        </section>
    );
}
