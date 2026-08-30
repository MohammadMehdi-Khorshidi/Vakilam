import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function LawyersHeader() {
    return (
        <header>
            <h1 className="mt-4 text-3xl font-black leading-tight text-[#10382f] md:text-4xl">
                اعتبار حرفه‌ای و دسترسی وکلا
            </h1>

            <p className="mt-3 text-sm leading-7 text-[#7b8882]">
                وکیل فقط پس از بررسی مدیر و تأیید مدارک وارد مسیر همکاری واقعی
                می‌شود.
            </p>
        </header>
    );
}
