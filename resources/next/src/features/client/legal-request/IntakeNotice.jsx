import { Check } from 'lucide-react';
import { Vazirmatn } from 'next/font/google';

const vazir = Vazirmatn({
    subsets: ['arabic'],
    weight: ['400', '500', '600', '700', '800'],
});

export default function IntakeNotice() {
    return (
        <div
            dir="rtl"

            className={`${vazir.className} mb-5 flex gap-3 rounded-xl border border-[#c9dfd7] bg-[#e8f2ef] p-4`}
        >
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#2c856e] text-white">
                <Check size={17} />
            </span>

            <div>
                <b className="text-sm">این مرحله مانع ادامه نیست</b>

                <p className="mt-1 text-xs leading-6 text-slate-500">
                    اطلاعات را بعداً هم می‌توانید تکمیل یا اصلاح کنید.
                </p>
            </div>
        </div>
    );
}
