import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function SensitiveAccessHeader() {
    return (
        <header className="mb-8">
            <Link
                href="/admin"
                className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-[#9d7425] transition hover:text-[#755619]"
            >
                <ArrowRight size={17} />
                بازگشت به مرکز کنترل
            </Link>
            <h1 className="mt-4 text-3xl font-black leading-tight text-[#10382f] md:text-4xl">
                ثبت دلیل مشاهده
            </h1>

            <p className="mt-3 text-sm leading-7 text-[#7b8882]">
                مشاهده اطلاعات حساس فقط در محدوده وظیفه و با ثبت دلیل ممکن است.
            </p>
        </header>
    );
}
